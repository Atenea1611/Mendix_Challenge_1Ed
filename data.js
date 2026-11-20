/** Shared server data. Only unfinished form drafts stay in this browser. */
'use strict';
const TECMILENIO_CAMPUS = [
  'Campus Aguascalientes',
  'Campus Cancún',
  'Campus Chihuahua',
  'Campus Ciudad Juárez',
  'Campus Cuautitlán Izcalli',
  'Campus Cuernavaca',
  'Campus Culiacán',
  'Campus Cumbres',
  'Campus Ferrería',
  'Campus Guadalajara',
  'Campus Guadalupe',
  'Campus Hermosillo',
  'Campus Laguna',
  'Campus Las Torres',
  'Campus Morelia',
  'Campus Puebla',
  'Campus Querétaro',
  'Campus Reynosa',
  'Campus San Luis Potosí',
  'Campus San Nicolás',
  'Campus Toluca',
  'Campus Veracruz',
  'Campus Villahermosa',
  'Campus Zacatecas',
  'Campus Zapopan',
  'Campus Durango',
  'Campus Mérida'
];
const DataStore = {
  data:{participants:[],judges:[],sentCertificates:{},publishedRankingTop10:[]},session:null,busy:false,
  get(){return this.data;},getSession(){return this.session;},
  async request(url,body){
    const response=await fetch(url,{method:body?'POST':'GET',credentials:'same-origin',
      headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});
    const result=await response.json();
    if(!response.ok || !result.success)throw Object.assign(new Error(result.message || 'No se pudo completar la operación.'),{details:result});
    return result;
  },
  async refresh(){
    const result=await this.request('/api/state');this.data=result.data;this.session=result.session;return result;
  },
  async action(action,...args){
    if(this.busy)return {success:false,message:'Espera a que termine la operación anterior.'};
    this.busy=true;
    try{
      const result=await this.request('/api/action',{action,args});
      try{await this.refresh();}catch{
        window.App?.showToast('La operación se guardó, pero no se pudo actualizar la vista. Recarga la página.','warning');
      }
      if(action==='registerParticipant')this.clearDraftParticipant();
      if(action==='registerJudge')this.clearDraftJudge();
      return result;
    }catch(error){return {...error.details,success:false,message:error.message || 'No hay conexión con el servidor. Conserva tus datos.'};}
    finally{this.busy=false;}
  },
  async login(email,password){
    try{await this.request('/api/login',{email,password});await this.refresh();return {success:true,session:this.session};}
    catch(error){return {success:false,message:error.message};}
  },
  async clearSession(){
    try{await this.request('/api/logout',{});this.session=null;this.data={participants:[],judges:[],sentCertificates:{},publishedRankingTop10:[]};await this.refresh();return {success:true};}
    catch(error){return {success:false,message:error.message};}
  },
  registerParticipant(p){return this.action('registerParticipant',p);},
  registerJudge(j){return this.action('registerJudge',j);},
  deleteParticipant(id){return this.action('deleteParticipant',id);},
  deleteJudge(id){return this.action('deleteJudge',id);},
  runAutoAssignment(){return this.action('runAutoAssignment');},
  setManualAssignment(id,judgeId){return this.action('setManualAssignment',id,judgeId);},
  saveEvaluation(id,input,locked=false){return this.action('saveEvaluation',id,input,locked);},
  generateOfficialRanking(){return this.action('generateOfficialRanking');},
  toggleRankingVisibility(){return this.action('toggleRankingVisibility');},
  getOfficialRanking(){return this.data.rankingGenerated?(this.data.publishedRankingTop10||[]):[];},
  getPublishedRanking(){return this.getOfficialRanking();},
  isRankingPublic(){return !!this.data.rankingPubliclyVisible;},
  getPendingJudges(){return this.data.judges.filter(j=>(j.assignedParticipants||[]).some(id=>{
    const p=this.data.participants.find(p=>p.id===id);return !p?.evaluation?.isLocked;
  }));},
  isCertificateSent(id,type){return !!this.data.sentCertificates?.[type+'_'+id];},
  draft(key,value){
    try{if(value===undefined)return JSON.parse(localStorage.getItem(key)||'null');
      localStorage.setItem(key,JSON.stringify(value));return true;}
    catch{window.App?.showToast('No se pudo guardar el borrador en este navegador.','warning');return null;}
  },
  saveDraftParticipant(p){return this.draft('MAC_DRAFT_PARTICIPANT',p);},
  getDraftParticipant(){return this.draft('MAC_DRAFT_PARTICIPANT');},
  clearDraftParticipant(){try{localStorage.removeItem('MAC_DRAFT_PARTICIPANT');}catch{}},
  saveDraftJudge(j){return this.draft('MAC_DRAFT_JUDGE',j);},
  getDraftJudge(){return this.draft('MAC_DRAFT_JUDGE');},
  clearDraftJudge(){try{localStorage.removeItem('MAC_DRAFT_JUDGE');}catch{}}
};
window.DataStore=DataStore;
window.TECMILENIO_CAMPUS=TECMILENIO_CAMPUS;

