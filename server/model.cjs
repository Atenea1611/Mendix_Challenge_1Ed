'use strict';
const { randomUUID, randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');

const CODES = ['A1','A2','A3','A4','A5','A6','A7','A8',
  'B1','B2','B3','C1','C2','C3','D1','D2','D3','E1','E2','E3'];
const SCORE_KEYS=['finalScore','subtotalA','subtotalC','subtotalE','subtotalD','subtotalB','G'];
const scoreKey=p=>SCORE_KEYS.map(k=>p.evaluation[k]).join('|');
function unresolvedTies(data){
  const groups=new Map();
  for(const p of data.participants.filter(p=>p.evaluation?.isLocked)){
    const key=scoreKey(p);groups.set(key,[...(groups.get(key)||[]),p]);
  }
  return [...groups.values()].filter(group=>group.length>1 && !(data.tieDecisions||[]).some(d=>
    d.score===scoreKey(group[0]) && d.ids.length===group.length && group.every(p=>d.ids.includes(p.id))));
}
function check(ok, message, status = 400) {
  if (!ok) throw Object.assign(new Error(message), { status });
}
function text(value, label, max = 160) {
  check(typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max,
    `${label}: campo obligatorio o demasiado largo.`);
  check(!/[\u0000-\u001f\u007f]/.test(value), `${label}: caracteres no permitidos.`);
  return value.trim();
}
function email(value) {
  const result = text(value, 'Correo', 254).toLowerCase();
  check(/^[^\s@]+@tecmilenio\.mx$/.test(result), 'Utiliza tu correo institucional @tecmilenio.mx.');
  return result;
}
function hashPassword(password) {
  check(typeof password === 'string' && password.length >= 12 && password.length <= 128,
    'La contraseña debe tener entre 12 y 128 caracteres.');
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, hash) {
  if (typeof password !== 'string' || password.length > 128 || !hash) return false;
  const [salt, key] = hash.split(':');
  const expected = Buffer.from(key, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
function newState(adminEmail, password) {
  return {
    version: 2,
    admin: { email: email(adminEmail), passwordHash: hashPassword(password), name: 'Coordinación Nacional Tecmilenio' },
    participants: [], judges: [], rankingGenerated: false,
    rankingPubliclyVisible: false, publishedRankingTop10: null, sentCertificates: {}
  };
}
function rank(data) {
  return data.participants.filter(p => p.evaluation?.isLocked).sort((a,b) => {
    for (const k of SCORE_KEYS) {
      const diff = b.evaluation[k] - a.evaluation[k];
      if (diff) return diff;
    }
    const decision=(data.tieDecisions||[]).find(d=>d.score===scoreKey(a) && d.ids.includes(a.id) && d.ids.includes(b.id));
    return decision ? decision.ids.indexOf(a.id)-decision.ids.indexOf(b.id) : 0;
  });
}
function invalidateRanking(data) {
  data.rankingGenerated = false;
  data.rankingPubliclyVisible = false;
  data.publishedRankingTop10 = null;
  data.tieDecisions = [];
}
function publicParticipant(p) {
  const scores=Object.fromEntries(['subtotalA','subtotalB','subtotalC','subtotalD','subtotalE',
    'R','contributionR','G','finalScore','isLocked'].map(k=>[k,p.evaluation[k]]));
  return { id:p.id, folio:p.folio, teamName:p.teamName, campus:p.campus,
    captain:{firstName:'',lastName:'',email:'',studentId:''}, members:[],
    evaluation:scores };
}
function safeJudge(j) {
  const { passwordHash, ...safe } = j;
  return safe;
}
function projectState(data, session) {
  const published = data.rankingGenerated && data.rankingPubliclyVisible
    ? (data.publishedRankingTop10 || []).map(publicParticipant) : [];
  const common = { rankingGenerated:data.rankingGenerated,
    rankingPubliclyVisible:data.rankingPubliclyVisible,
    publishedRankingTop10:published, participants:[],judges:[],sentCertificates:{} };
  if (session?.role === 'admin') return { ...data, admin:{name:data.admin.name,email:data.admin.email},
    judges:data.judges.map(safeJudge) };
  if (session?.role === 'judge') {
    const judge = data.judges.find(j=>j.id===session.judgeId);
    return { ...common, judges:judge?[safeJudge(judge)]:[],
      participants:data.participants.filter(p=>p.assignedJudgeId===session.judgeId) };
  }
  return common;
}
function pdf(value, label) {
  check(typeof value === 'string' && /^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/.test(value),
    `${label}: adjunta un archivo PDF.`);
  const body = Buffer.from(value.split(',')[1], 'base64');
  check(body.length <= 5 * 1024 * 1024 && body.subarray(0,5).toString() === '%PDF-',
    `${label}: PDF inválido o mayor a 5 MB.`);
  return value;
}
function person(value, label) {
  check(value && typeof value === 'object', `${label}: datos incompletos.`);
  const studentId = text(value.studentId, 'Matrícula', 30).toUpperCase();
  check(/^[A-Z0-9-]+$/.test(studentId), 'Matrícula inválida.');
  return { firstName:text(value.firstName,'Nombre'), lastName:text(value.lastName,'Apellidos'),
    studentId, email:email(value.email) };
}
function evaluation(input, judgeId, isLocked) {
  check(input && typeof input==='object', 'Evaluación inválida.');
  const indicators = input.indicators;
  check(indicators && typeof indicators==='object' && Object.keys(indicators).length===20,
    'Completa los 20 indicadores.');
  for (const code of CODES) check(indicators[code]===0 || indicators[code]===5,
    `El indicador ${code} solo admite 0 o 5 puntos.`);
  const G = input.G;
  check(typeof G==='number' && Number.isFinite(G) && G>=0 && G<=10 &&
    Math.abs(G*10-Math.round(G*10))<1e-8, 'La valoración G debe estar entre 0 y 10, con máximo un decimal.');
  const justificationG = typeof input.justificationG==='string' ? input.justificationG.trim() : '';
  check(justificationG.length<=4000, 'La justificación es demasiado larga.');
  check(!isLocked || justificationG.length>=10, 'Justifica la valoración global antes de confirmar.');
  const subtotals = Object.fromEntries(['A','B','C','D','E'].map(k=>[
    `subtotal${k}`,CODES.filter(c=>c[0]===k).reduce((sum,c)=>sum+indicators[c],0)]));
  const R = Object.values(subtotals).reduce((a,b)=>a+b,0);
  const contributionR = Math.round(R*90)/100;
  return { evaluatedBy:judgeId, evaluatedAt:new Date().toISOString(), indicators:{...indicators},
    ...subtotals,R,contributionR,G,finalScore:Math.round((contributionR+G)*100)/100,
    justificationG,isDraft:!isLocked,isLocked };
}
function mutate(data, action, args, session, options) {
  const admin = () => check(session?.role==='admin', 'Acceso exclusivo de administración.',403);
  const participant = id => {
    const p=data.participants.find(p=>p.id===id);check(p,'Equipo no encontrado.',404);return p;
  };
  switch(action) {
    case 'registerParticipant': {
      const p=args[0];check(p && typeof p==='object','Registro inválido.');
      const teamName=text(p.teamName,'Nombre del equipo');
      check(options.campuses.includes(p.campus),'Selecciona un campus válido.');
      check(Array.isArray(p.members) && p.members.length>=1 && p.members.length<=3,
        'El equipo debe tener entre 2 y 4 integrantes, incluido el capitán.');
      const captain=person(p.captain,'Capitán');
      const members=p.members.map(m=>person(m,'Integrante'));
      const ids=[captain,...members].map(m=>m.studentId);
      check(new Set(ids).size===ids.length,'Existen matrículas repetidas en el equipo.');
      const existing=new Set(data.participants.flatMap(p=>[p.captain,...p.members].map(m=>m.studentId)));
      check(!ids.some(id=>existing.has(id)),'Una matrícula ya está registrada en otro equipo.');
      const professor={firstName:text(p.professor?.firstName,'Nombre del profesor'),
        lastName:text(p.professor?.lastName,'Apellidos del profesor')};
      let video;try{video=new URL(p.videoUrl);}catch{check(false,'URL del video inválida.');}
      check(video.protocol==='https:' && !video.username && !video.password,'El video debe usar una URL HTTPS.');
      const id=randomUUID();
      const entry={id,folio:`TEC-MAC-2026-${id.toUpperCase()}`,teamName,campus:p.campus,professor,captain,members,
        professorApprovalFileDataUrl:pdf(p.professorApprovalFileDataUrl,'Aval docente'),
        projectDocFileDataUrl:pdf(p.projectDocFileDataUrl,'Documento del proyecto'),
        professorApprovalFileName:'Aval_Docente.pdf',projectDocFileName:'Documento_Proyecto.pdf',
        videoUrl:video.href,assignedJudgeId:null,registeredAt:new Date().toISOString(),evaluation:null};
      data.participants.push(entry);invalidateRanking(data);
      return {success:true,participant:{id,folio:entry.folio,teamName}};
    }
    case 'registerJudge': {
      const j=args[0];check(j && typeof j==='object','Registro inválido.');
      check(typeof options.inviteCode==='string' && options.inviteCode.length>=16 &&
        typeof j.inviteCode==='string' && j.inviteCode===options.inviteCode,
        'Solicita un código de invitación válido a la coordinación.',403);
      const mail=email(j.email), payroll=text(j.payroll,'Nómina',30).toUpperCase();
      check(/^[A-Z0-9-]+$/.test(payroll),'Nómina inválida.');
      check(mail!==data.admin.email && !data.judges.some(x=>x.email===mail || x.payroll===payroll),
        'El correo o la nómina ya están registrados.');
      check(options.campuses.includes(j.campus),'Selecciona un campus válido.');
      const judge={id:randomUUID(),firstName:text(j.firstName,'Nombre'),lastName:text(j.lastName,'Apellidos'),
        payroll,campus:j.campus,email:mail,passwordHash:hashPassword(j.password),assignedParticipants:[],confirmed:false};
      data.judges.push(judge);return {success:true};
    }
    case 'saveEvaluation': {
      const [id,input,locked=false]=args,p=participant(id);
      check(session?.role==='judge' && p.assignedJudgeId===session.judgeId,
        'Solo el juez asignado puede evaluar este equipo.',403);
      check(!p.evaluation?.isLocked,'La evaluación ya está confirmada y bloqueada.',409);
      check(typeof locked==='boolean','Confirmación inválida.');
      p.evaluation=evaluation(input,session.judgeId,locked);invalidateRanking(data);
      return {success:true,evaluation:p.evaluation};
    }
    case 'setManualAssignment': {
      admin();const [id,judgeId]=args,p=participant(id);
      check(!p.evaluation,'No reasignes un equipo que ya tiene una evaluación.',409);
      const j=data.judges.find(j=>j.id===judgeId);
      check(!judgeId || j,'Juez no encontrado.');
      check(!j || j.campus!==p.campus,'El juez no puede evaluar a su propio campus.');
      data.judges.forEach(j=>j.assignedParticipants=j.assignedParticipants.filter(x=>x!==id));
      p.assignedJudgeId=j?.id || null;
      if(j)j.assignedParticipants.push(id);
      invalidateRanking(data);return {success:true};
    }
    case 'runAutoAssignment': {
      admin();check(data.judges.length && data.participants.length,'Registra equipos y jueces antes de asignar.');
      // Mantener todas las evaluaciones y sus jueces; repartir solo los equipos pendientes.
      const counts=new Map(data.judges.map(j=>[j.id,0]));
      data.judges.forEach(j=>{j.assignedParticipants=[];});
      const pending=[];
      for(const p of data.participants){
        if(p.evaluation){
          const j=data.judges.find(j=>j.id===p.assignedJudgeId);
          check(j && j.campus!==p.campus,'Una evaluación tiene una asignación inválida.',409);
          j.assignedParticipants.push(p.id);counts.set(j.id,counts.get(j.id)+1);
        }else{p.assignedJudgeId=null;pending.push(p);}
      }
      pending.sort((a,b)=>data.judges.filter(j=>j.campus!==a.campus).length-
        data.judges.filter(j=>j.campus!==b.campus).length);
      let unassigned=0;
      for(const p of pending){
        const j=data.judges.filter(j=>j.campus!==p.campus).sort((a,b)=>counts.get(a.id)-counts.get(b.id))[0];
        if(!j){unassigned++;continue;}
        p.assignedJudgeId=j.id;j.assignedParticipants.push(p.id);counts.set(j.id,counts.get(j.id)+1);
      }
      invalidateRanking(data);return {success:true,warning:unassigned>0,
        message:unassigned?`${unassigned} equipos sin juez por conflicto de campus.`:'Asignaciones guardadas.'};
    }
    case 'deleteParticipant': {
      admin();const p=participant(args[0]);
      check(!p.evaluation?.isLocked,'No se puede eliminar un equipo con evaluación confirmada.',409);
      data.participants=data.participants.filter(x=>x.id!==p.id);
      data.judges.forEach(j=>j.assignedParticipants=j.assignedParticipants.filter(x=>x!==p.id));
      invalidateRanking(data);return {success:true};
    }
    case 'deleteJudge': {
      admin();const id=args[0];
      check(data.judges.some(j=>j.id===id),'Juez no encontrado.',404);
      check(!data.participants.some(p=>p.assignedJudgeId===id && p.evaluation),
        'No se puede eliminar un juez que ya tiene evaluaciones.',409);
      data.judges=data.judges.filter(j=>j.id!==id);
      data.participants.forEach(p=>{if(p.assignedJudgeId===id)p.assignedJudgeId=null;});
      invalidateRanking(data);return {success:true};
    }
    case 'recordTieDecision': {
      admin();const [ids,reason]=args;
      check(Array.isArray(ids) && ids.length>1 && new Set(ids).size===ids.length,'Orden de desempate inválido.');
      const group=unresolvedTies(data).find(group=>group.length===ids.length && group.every(p=>ids.includes(p.id)));
      check(group,'El grupo de empate cambió o ya fue resuelto. Actualiza la información.',409);
      const justification=text(reason,'Dictamen del comité',2000);
      check(justification.length>=10,'Explica el dictamen del comité (mínimo 10 caracteres).');
      if(!data.tieDecisions)data.tieDecisions=[];
      data.tieDecisions.push({ids:[...ids],score:scoreKey(group[0]),reason:justification,
        decidedBy:session.email,decidedAt:new Date().toISOString()});
      data.rankingGenerated=false;data.rankingPubliclyVisible=false;data.publishedRankingTop10=null;
      return {success:true};
    }
    case 'generateOfficialRanking': {
      admin();check(data.participants.length>0 && data.participants.every(p=>p.assignedJudgeId && p.evaluation?.isLocked),
        'Todos los equipos deben tener juez y evaluación confirmada antes de generar el ranking.',409);
      const sorted=rank(data);
      const tieGroups=unresolvedTies(data).filter(group=>group.some(p=>sorted.slice(0,10).some(top=>top.id===p.id)));
      if(tieGroups.length)return {success:false,message:'Se requiere un dictamen del comité para resolver empates completos.',
        tieGroups:tieGroups.map(group=>group.map(p=>({id:p.id,folio:p.folio,teamName:p.teamName})))};
      data.publishedRankingTop10=sorted.slice(0,10);data.rankingGenerated=true;
      data.rankingGeneratedAt=new Date().toISOString();return {success:true,count:data.publishedRankingTop10.length};
    }
    case 'toggleRankingVisibility': {
      admin();check(data.rankingGenerated,'Genera el ranking oficial antes de publicarlo.',409);
      data.rankingPubliclyVisible=!data.rankingPubliclyVisible;return {success:true,visible:data.rankingPubliclyVisible};
    }
    default:check(false,'Operación no disponible.',404);
  }
}
module.exports={check,newState,projectState,mutate,verifyPassword,rank};
