'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createApplication}=require('../server/index.cjs');
const {rank,mutate}=require('../server/model.cjs');
const INVITE='test-invitation-code-2026';
const PASSWORD='Test-password-2026';
const CAMPUS_A='Campus Puebla',CAMPUS_B='Campus Mérida';
const allIndicators=Object.fromEntries(['A1','A2','A3','A4','A5','A6','A7','A8',
  'B1','B2','B3','C1','C2','C3','D1','D2','D3','E1','E2','E3'].map(k=>[k,5]));
function judge(email,campus){return {firstName:'Juez',lastName:'Prueba',payroll:email.split('@')[0],
  campus,email,password:PASSWORD,inviteCode:INVITE};}
function team(id,campus=CAMPUS_A){
  const pdf='data:application/pdf;base64,'+Buffer.from('%PDF-1.4\n%%EOF').toString('base64');
  return {teamName:`Equipo ${id}`,campus,professor:{firstName:'Docente',lastName:'Prueba'},
    captain:{firstName:'Capitán',lastName:'Prueba',studentId:`A${id}`,email:`cap${id}@tecmilenio.mx`},
    members:[{firstName:'Alumno',lastName:'Prueba',studentId:`B${id}`,email:`member${id}@tecmilenio.mx`}],
    professorApprovalFileDataUrl:pdf,projectDocFileDataUrl:pdf,videoUrl:'https://example.com/video'};
}
const evaluation=(G=9)=>({indicators:{...allIndicators},G,justificationG:'Evidencias revisadas con la rúbrica oficial.'});
async function fixture(t){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mendix-test-'));
  let app,base;
  const env={DATA_DIR:dir,ADMIN_EMAIL:'admin@tecmilenio.mx',ADMIN_PASSWORD:PASSWORD,
    JUDGE_INVITE_CODE:INVITE,PUBLIC_ORIGIN:'http://127.0.0.1'};
  async function start(){
    // Configurar un puerto disponible sin aceptar orígenes arbitrarios.
    app=createApplication({env});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
    base=`http://127.0.0.1:${app.server.address().port}`;
  }
  await start();
  const client=()=>({cookie:'',async call(route,body,overrides={}){
    const response=await fetch(base+route,{method:body?'POST':'GET',
      headers:{...(body?{'Content-Type':'application/json',Origin:env.PUBLIC_ORIGIN}:{}),
        ...(this.cookie?{Cookie:this.cookie}:{}),...overrides},body:body?JSON.stringify(body):undefined});
    if(response.headers.get('set-cookie'))this.cookie=response.headers.get('set-cookie').split(';')[0];
    const type=response.headers.get('content-type')||'';
    return {status:response.status,headers:response.headers,body:type.includes('application/json')?await response.json():await response.text()};
  },action(action,...args){return this.call('/api/action',{action,args});}});
  t.after(async()=>{await app.close();fs.rmSync(dir,{recursive:true,force:true});});
  return {client,get db(){return app.db;},async restart(){await app.close();await start();},env};
}

test('registro compartido, permisos, rúbrica, publicación y persistencia',async t=>{
  const f=await fixture(t),publicUser=f.client(),admin=f.client(),j1=f.client(),j2=f.client();
  assert.equal((await publicUser.call('/api/state')).body.data.participants.length,0);
  assert.equal((await admin.call('/api/login',{email:'admin@tecmilenio.mx',password:PASSWORD})).status,200);
  const a=await publicUser.action('registerParticipant',team('001'));
  assert.equal(a.status,200);const id=a.body.participant.id;
  assert.equal((await publicUser.call(`/api/files/${id}/project`)).status,403);
  assert.equal((await admin.call('/api/state')).body.data.participants.length,1);
  assert.equal((await publicUser.call('/api/state')).body.data.participants.length,0);
  assert.equal((await publicUser.action('registerJudge',judge('judge1@tecmilenio.mx',CAMPUS_B))).status,200);
  assert.equal((await publicUser.action('registerJudge',judge('judge2@tecmilenio.mx',CAMPUS_A))).status,200);
  await j1.call('/api/login',{email:'judge1@tecmilenio.mx',password:PASSWORD});
  await j2.call('/api/login',{email:'judge2@tecmilenio.mx',password:PASSWORD});
  let state=(await admin.call('/api/state')).body.data;
  const [judge1,judge2]=state.judges;
  assert.equal((await admin.action('setManualAssignment',id,judge2.id)).status,400);
  assert.equal((await admin.action('setManualAssignment',id,judge1.id)).status,200);
  assert.equal((await j1.call('/api/state')).body.data.participants.length,1);
  assert.equal((await j1.call(`/api/files/${id}/project`)).status,200);
  assert.equal((await j2.call(`/api/files/${id}/project`)).status,403);
  assert.equal((await admin.call('/api/state')).body.data.participants[0].projectDocFileDataUrl,undefined);
  assert.equal((await j2.call('/api/state')).body.data.participants.length,0);
  assert.equal((await publicUser.action('saveEvaluation',id,evaluation(),false)).status,403);
  assert.equal((await j2.action('saveEvaluation',id,evaluation(),false)).status,403);
  assert.equal((await j1.action('toggleRankingVisibility')).status,403);
  assert.equal((await j1.action('saveEvaluation',id,evaluation(99),false)).status,400);
  assert.equal((await j1.action('saveEvaluation',id,evaluation(-1),false)).status,400);
  assert.equal((await j1.action('saveEvaluation',id,evaluation(9.55),false)).status,400);
  const decimal=evaluation();decimal.indicators.A1=2.5;
  assert.equal((await j1.action('saveEvaluation',id,decimal,false)).status,400);
  assert.equal((await j1.action('saveEvaluation',id,{indicators:{A1:5},G:9},true)).status,400);
  const draft=await j1.action('saveEvaluation',id,evaluation(),false);
  assert.equal(draft.body.evaluation.finalScore,99);
  assert.equal((await admin.action('generateOfficialRanking')).status,409);
  assert.equal((await admin.action('toggleRankingVisibility')).status,409);
  // Reasignar no transfiere una evaluación a otro juez.
  assert.equal((await admin.action('setManualAssignment',id,judge2.id)).status,409);
  assert.equal((await admin.action('runAutoAssignment')).status,200);
  assert.equal((await j1.action('saveEvaluation',id,evaluation(),true)).status,200);
  assert.equal((await j1.action('saveEvaluation',id,{...evaluation(),forceUnlock:true},false)).status,409);
  assert.equal((await admin.action('deleteJudge',judge1.id)).status,409);
  assert.equal((await admin.action('deleteParticipant',id)).status,409);
  assert.equal((await admin.action('generateOfficialRanking')).status,200);
  assert.equal((await publicUser.call('/api/state')).body.data.publishedRankingTop10.length,0);
  assert.equal((await admin.action('toggleRankingVisibility')).body.visible,true);
  const published=(await publicUser.call('/api/state')).body.data;
  assert.equal(published.publishedRankingTop10.length,1);
  assert.equal(published.publishedRankingTop10[0].captain.email,'');
  assert.equal(JSON.stringify(published).includes('password'),false);
  state=(await admin.call('/api/state')).body.data;
  assert.equal(JSON.stringify(state).includes('passwordHash'),false);
  assert.equal(JSON.stringify(state).includes(INVITE),false);
  await f.restart();
  assert.equal((await admin.call('/api/state')).body.data.participants[0].folio,a.body.participant.folio);
  const logout=await admin.call('/api/logout',{});
  assert.equal(logout.status,200);assert.match(logout.headers.get('set-cookie'),/HttpOnly/);
  assert.equal((await admin.call('/api/state')).body.session,null);
});

test('rechaza duplicados, archivos falsos, invitaciones inválidas y peticiones de otros sitios',async t=>{
  const f=await fixture(t),c=f.client();
  const invalid=team('100');invalid.projectDocFileDataUrl='data:application/pdf;base64,SG9sYQ==';
  assert.equal((await c.action('registerParticipant',invalid)).status,400);
  const badURL=team('100');badURL.videoUrl='javascript:alert(1)';
  assert.equal((await c.action('registerParticipant',badURL)).status,400);
  const internal=team('100');internal.members[0].studentId=internal.captain.studentId;
  assert.equal((await c.action('registerParticipant',internal)).status,400);
  const results=await Promise.all([c.action('registerParticipant',team('101')),c.action('registerParticipant',team('101'))]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);
  const other=await c.action('registerParticipant',team('102'));
  assert.notEqual(other.body.participant.folio,results.find(r=>r.status===200).body.participant.folio);
  assert.equal((await c.action('registerJudge',{...judge('no@tecmilenio.mx',CAMPUS_A),inviteCode:'wrong'})).status,403);
  assert.equal((await c.action('registerJudge',{...judge('no@tecmilenio.mx',CAMPUS_A),password:'short'})).status,400);
  assert.equal((await c.call('/api/action',{action:'deleteParticipant',args:['fake']},{Origin:'https://evil.example'})).status,403);
  assert.equal((await c.call('/api/action',{action:'markCertificateSent',args:[]})).status,404);
  c.cookie='mac_session='+ 'f'.repeat(64);
  assert.equal((await c.call('/api/state')).body.session,null);
  for(const route of ['/.env','/server/index.cjs','/storage/challenge.sqlite','/AGENTS.md','/reconocimientos_generados/test.pptx']){
    assert.equal((await c.call(route)).status,404,route);
  }
  const js=await c.call('/data.js');assert.equal(js.status,200);
  assert.equal(js.body.includes('adminTEC'),false);assert.equal(js.body.includes('juezTEC2026'),false);
});

test('un fallo de SQLite revierte el registro sin una confirmación falsa',async t=>{
  const f=await fixture(t),c=f.client(),admin=f.client();
  await admin.call('/api/login',{email:'admin@tecmilenio.mx',password:PASSWORD});
  f.db.exec("CREATE TRIGGER fail_write BEFORE UPDATE ON state BEGIN SELECT RAISE(ABORT,'simulated disk error'); END");
  const failed=await c.action('registerParticipant',team('200'));
  assert.equal(failed.status,500);assert.equal(failed.body.success,false);
  assert.equal(f.db.prepare('SELECT count(*) AS count FROM attachments').get().count,0);
  assert.equal((await admin.call('/api/state')).body.data.participants.length,0);
  f.db.exec('DROP TRIGGER fail_write');
  assert.equal((await c.action('registerParticipant',team('200'))).status,200);
});

test('desempates académicos y exclusión de borradores',()=>{
  const base={finalScore:90,subtotalA:35,subtotalC:10,subtotalE:10,subtotalD:10,subtotalB:10,G:9,isLocked:true};
  const participants=[{id:'draft',evaluation:{...base,finalScore:100,isLocked:false}},
    {id:'low',evaluation:{...base}},{id:'high',evaluation:{...base,subtotalC:15}}];
  assert.deepEqual(rank({participants}).map(p=>p.id),['high','low']);
});

test('un empate completo requiere dictamen documentado de administración',()=>{
  const score={finalScore:99,subtotalA:40,subtotalC:15,subtotalE:15,subtotalD:15,subtotalB:15,G:9,isLocked:true};
  const data={participants:['one','two'].map(id=>({id,folio:id,teamName:id,assignedJudgeId:'judge',evaluation:{...score}})),
    judges:[],tieDecisions:[]};
  const admin={role:'admin',email:'admin@tecmilenio.mx'};
  const blocked=mutate(data,'generateOfficialRanking',[],admin,{});
  assert.equal(blocked.success,false);assert.equal(blocked.tieGroups.length,1);
  assert.throws(()=>mutate(data,'recordTieDecision',[['two','one'],'Dictamen fundamentado del comité'],{role:'judge'},{}));
  assert.throws(()=>mutate(data,'recordTieDecision',[['two','two'],'Dictamen fundamentado del comité'],admin,{}));
  assert.equal(mutate(data,'recordTieDecision',[['two','one'],'Dictamen fundamentado del comité'],admin,{}).success,true);
  assert.equal(mutate(data,'generateOfficialRanking',[],admin,{}).success,true);
  assert.deepEqual(data.publishedRankingTop10.map(p=>p.id),['two','one']);
  assert.equal(data.tieDecisions[0].decidedBy,admin.email);
});
