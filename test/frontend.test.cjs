'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
function runtime(extra={}){
  const values=new Map(),context={window:{},console,localStorage:{
    getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)
  },document:{addEventListener(){}},...extra};
  vm.createContext(context);vm.runInContext(source('data.js'),context);
  vm.runInContext(source('app.js'),context);return context;
}
test('conserva borradores al fallar el servidor y no registra falsos envíos',async()=>{
  const ctx=runtime({fetch:async()=>({ok:false,json:async()=>({success:false,message:'No se pudo guardar'})})});
  const ds=ctx.window.DataStore,app=ctx.window.App;
  const notices=[];app.showToast=(message,type)=>notices.push({message,type});
  ds.saveDraftParticipant({teamName:'Mi equipo'});
  const result=await ds.registerParticipant({teamName:'Mi equipo'});
  assert.equal(result.success,false);assert.equal(ds.getDraftParticipant().teamName,'Mi equipo');
  app.executeEmailSend();app.sendBatchCertificates();
  assert.equal(notices.every(n=>n.type==='warning'),true);
  assert.equal(Object.keys(ds.get().sentCertificates).length,0);
});
test('el autoguardado no reemplaza el manejador de carga de PDF',()=>{
  const fileHandler=()=>{},file={type:'file',onchange:fileHandler},text={type:'text'};
  const ctx=runtime({document:{addEventListener(){},getElementById:id=>id==='form-participant-registration'
    ? {querySelectorAll:()=>[file,text]}:null}});
  ctx.window.App.bindAutosaveInputs();
  assert.equal(file.onchange,fileHandler);assert.equal(typeof text.onchange,'function');
});
test('eliminar un integrante y agregar otro mantiene IDs únicos',()=>{
  const rows=new Map();
  const container={appendChild:row=>{assert.equal(rows.has(row.id),false);rows.set(row.id,row);}};
  const ctx=runtime({document:{addEventListener(){},
    getElementById:id=>id==='members-fields-container'?container:rows.get(id),
    createElement:()=>({style:{},remove(){rows.delete(this.id);}})}});
  const app=ctx.window.App;app.bindAutosaveInputs=()=>{};app.triggerAutosaveParticipant=()=>{};
  app.addMemberField();app.addMemberField();app.removeMemberField(1);app.addMemberField();
  assert.equal(rows.size,2);assert.equal(rows.has('member-row-1'),true);assert.equal(rows.has('member-row-2'),true);
});
test('escapa texto de participantes antes de insertarlo como HTML',()=>{
  const app=runtime().window.App;
  assert.equal(app.escapeHTML('<img src=x onerror="alert(1)">'),
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
