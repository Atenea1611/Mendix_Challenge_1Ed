'use strict';
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const { randomBytes, createHash } = require('node:crypto');
const { check, newState, projectState, mutate, verifyPassword } = require('./model.cjs');

const ROOT = path.resolve(__dirname, '..');
const campuses = JSON.parse(fs.readFileSync(path.join(__dirname,'campuses.json'),'utf8'));
const digest = value => createHash('sha256').update(value).digest('hex');
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.png':'image/png','.pdf':'application/pdf'};
const PUBLIC_FILES = new Set(['index.html','data.js','app.js','styles.css','cert_logos.js',
  'LogoMendixChallenge_1_Edition.png','Universidad_Tecmilenio.png','Siemens-Logo.wine.png',
  'Medalla_1.png','Medalla_2.png','Medalla_3.png','Manual_Etapa_Docente_Mendix_Agile_Challenge.pdf',
  'Plantilla_AvalDocente.pdf']);
function createApplication(options = {}) {
  const env = options.env || process.env;
  const origin = env.PUBLIC_ORIGIN || 'http://localhost:8080';
  const configuredURL = new URL(origin);
  check(origin===configuredURL.origin, 'PUBLIC_ORIGIN debe ser un origen sin ruta.');
  check(configuredURL.protocol==='https:' || ['localhost','127.0.0.1'].includes(configuredURL.hostname),
    'El origen público debe usar HTTPS.');
  const dataDir=path.resolve(env.DATA_DIR || path.join(ROOT,'storage'));
  fs.mkdirSync(dataDir,{recursive:true,mode:0o700});
  const db=new DatabaseSync(path.join(dataDir,'challenge.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  db.exec('CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL);'+
    'CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL);'+
    'CREATE TABLE IF NOT EXISTS attachments (participant_id TEXT NOT NULL, kind TEXT NOT NULL, data BLOB NOT NULL, PRIMARY KEY(participant_id,kind));');
  if(!db.prepare('SELECT id FROM state WHERE id=1').get()){
    check(typeof env.JUDGE_INVITE_CODE==='string' && env.JUDGE_INVITE_CODE.length>=16,
      'Configura JUDGE_INVITE_CODE con al menos 16 caracteres.');
    const initial=newState(env.ADMIN_EMAIL || 'admin@tecmilenio.mx',env.ADMIN_PASSWORD);
    db.prepare('INSERT INTO state VALUES (1,?)').run(JSON.stringify(initial));
  }
  const load=()=>JSON.parse(db.prepare('SELECT payload FROM state WHERE id=1').get().payload);
  const save=data=>db.prepare('UPDATE state SET payload=? WHERE id=1').run(JSON.stringify(data));
  const attempts=new Map();
  const dummyHash=require('node:crypto').scryptSync('invalid-password','dummy-auth-salt',64).toString('hex');
  function rateLimit(req,scope,limit,windowMs){
    const ip=env.TRUST_PROXY==='1' ? String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].trim()
      : req.socket.remoteAddress;
    const now=Date.now(), key=`${scope}:${ip}`;
    // Evitar crecimiento ilimitado por direcciones distintas.
    for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);
    const item=attempts.get(key) || {count:0,until:now+windowMs};
    check(item.count<limit,'Demasiados intentos. Inténtalo más tarde.',429);
    item.count++;attempts.set(key,item);
  }
  function sessionFor(req,data){
    const cookie=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('mac_session='));
    if(!cookie)return null;
    const token=cookie.slice('mac_session='.length);
    if(!/^[a-f0-9]{64}$/.test(token))return null;
    const stored=db.prepare('SELECT user_id,expires FROM sessions WHERE token=?').get(digest(token));
    if(!stored || stored.expires<Date.now())return null;
    if(stored.user_id==='admin')return {role:'admin',name:data.admin.name,email:data.admin.email};
    const j=data.judges.find(j=>j.id===stored.user_id);
    return j?{role:'judge',judgeId:j.id,name:`${j.firstName} ${j.lastName}`,email:j.email,campus:j.campus}:null;
  }
  const cookie=value=>`mac_session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${configuredURL.protocol==='https:'?'; Secure':''}`;
  function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));}
  async function readBody(req){
    check((req.headers['content-type']||'').split(';')[0]==='application/json','Se requiere JSON.',415);
    const chunks=[];let size=0;
    for await(const chunk of req){size+=chunk.length;check(size<=15*1024*1024,'La solicitud excede el límite de archivos.',413);chunks.push(chunk);}
    try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{check(false,'JSON inválido.');}
  }
  const server=http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try{
      const url=new URL(req.url,origin);
      if(url.pathname.startsWith('/api/')){
        if(req.method==='GET' && url.pathname==='/api/state'){
          const data=load(),session=sessionFor(req,data);
          return json(res,200,{success:true,data:projectState(data,session),session});
        }
        const fileMatch=url.pathname.match(/^\/api\/files\/([a-f0-9-]{36})\/(project|approval)$/);
        if(req.method==='GET' && fileMatch){
          const [,id,kind]=fileMatch,data=load(),session=sessionFor(req,data);
          const participant=data.participants.find(p=>p.id===id);
          check(session?.role==='admin' || (session?.role==='judge' && participant?.assignedJudgeId===session.judgeId),
            'No tienes acceso a este documento.',403);
          const file=db.prepare('SELECT data FROM attachments WHERE participant_id=? AND kind=?').get(id,kind);
          check(file,'Documento no encontrado.',404);
          res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':
            `attachment; filename="${kind==='project'?'Documento_Proyecto':'Aval_Docente'}.pdf"`});
          return res.end(Buffer.from(file.data));
        }
        check(req.method==='POST','Método no permitido.',405);
        check(req.headers.origin===origin,'Origen no autorizado.',403);
        const body=await readBody(req);
        check(body && typeof body==='object' && !Array.isArray(body),'Solicitud inválida.');
        if(url.pathname==='/api/login'){
          rateLimit(req,'login',10,15*60*1000);
          const data=load(),mail=typeof body.email==='string'?body.email.trim().toLowerCase():'';
          const user=mail===data.admin.email?data.admin:data.judges.find(j=>j.email===mail);
          check(verifyPassword(body.password,user?.passwordHash || `dummy-auth-salt:${dummyHash}`) && user,
            'Usuario o contraseña incorrectos.',401);
          const token=randomBytes(32).toString('hex');
          // Renovar la sesión actual al autenticar.
          const previous=String(req.headers.cookie||'').match(/(?:^|;\s*)mac_session=([a-f0-9]{64})(?:;|$)/)?.[1];
          if(previous)db.prepare('DELETE FROM sessions WHERE token=?').run(digest(previous));
          db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
          db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token),user===data.admin?'admin':user.id,Date.now()+8*60*60*1000);
          res.setHeader('Set-Cookie',cookie(token));return json(res,200,{success:true});
        }
        if(url.pathname==='/api/logout'){
          const token=String(req.headers.cookie||'').match(/(?:^|;\s*)mac_session=([a-f0-9]{64})(?:;|$)/)?.[1];
          if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token));
          res.setHeader('Set-Cookie',cookie('')+'; Max-Age=0');return json(res,200,{success:true});
        }
        check(url.pathname==='/api/action','Ruta no encontrada.',404);
        check(typeof body.action==='string' && Array.isArray(body.args),'Operación inválida.');
        if(['registerParticipant','registerJudge'].includes(body.action))rateLimit(req,'register',20,60*60*1000);
        let result;
        db.exec('BEGIN IMMEDIATE');
        try{
          const data=load(),session=sessionFor(req,data);
          result=mutate(data,body.action,body.args,session,{campuses,inviteCode:env.JUDGE_INVITE_CODE});
          if(body.action==='registerParticipant'){
            const participant=data.participants.find(p=>p.id===result.participant.id);
            for(const [kind,key] of [['project','projectDocFile'],['approval','professorApprovalFile']]){
              const buffer=Buffer.from(participant[key+'DataUrl'].split(',')[1],'base64');
              db.prepare('INSERT INTO attachments VALUES (?,?,?)').run(participant.id,kind,buffer);
              participant[key]=`/api/files/${participant.id}/${kind}`;
              delete participant[key+'DataUrl'];
            }
          }
          if(body.action==='deleteParticipant')db.prepare('DELETE FROM attachments WHERE participant_id=?').run(body.args[0]);
          save(data);db.exec('COMMIT');
        }catch(error){db.exec('ROLLBACK');throw error;}
        return json(res,200,result);
      }
      check(req.method==='GET' || req.method==='HEAD','Método no permitido.',405);
      const file=decodeURIComponent(url.pathname==='/'?'index.html':url.pathname.slice(1));
      // Solo archivos publicados expresamente; jamás .env, SQLite, código del servidor o documentos generados.
      check(PUBLIC_FILES.has(file) || /^cert_assets\/(?:[A-Za-z0-9_-]+\.png|exact_slides\/slide_[1-5]\.png)$/.test(file),
        'Archivo no encontrado.',404);
      const full=path.join(ROOT,file);check(fs.existsSync(full),'Archivo no encontrado.',404);
      res.setHeader('Content-Type',MIME[path.extname(file)]||'application/octet-stream');
      if(req.method==='HEAD')return res.end();
      fs.createReadStream(full).on('error',()=>res.destroy()).pipe(res);
    }catch(error){
      if(!error.status)console.error('Error del servidor:',error.message);
      if(!res.headersSent)json(res,error.status||500,{success:false,
        message:error.status?error.message:'No se pudo guardar la operación. Conserva tus datos e inténtalo de nuevo.'});
      else res.destroy();
    }
  });
  server.requestTimeout=30000;
  return {server,db,close:()=>new Promise(resolve=>server.close(()=>{db.close();resolve();}))};
}
if(require.main===module){
  try{
    const app=createApplication();
    app.server.listen(Number(process.env.PORT||8080),process.env.HOST||'127.0.0.1',()=>console.log('Portal iniciado. Origen:',process.env.PUBLIC_ORIGIN||'http://localhost:8080'));
    for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit(0)));
  }catch(error){console.error(error.message);process.exit(1);}
}
module.exports={createApplication};
