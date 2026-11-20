/**
 * Mendix Agile Challenge - Universidad Tecmilenio & Siemens
 * Controlador de Interfaz, Eventos, Autoguardado y Cédula de 20 Indicadores
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  data: null,
  session: null,
  currentTab: 'home',
  selectedJudgeParticipantId: null,
  currentEvaluationState: null,
  memberCount: 0,
  uploadedApprovalFile: null,
  uploadedDocFile: null,

  init() {
    this.loadData();
    this.session = window.DataStore.getSession();

    this.bindNavigation();
    this.bindThemeToggle();
    this.populateCampusDropdowns();
    this.setupAutosave();
    this.renderSessionState();

    // Si no hay integrantes aún en el formulario, agregar 2 por defecto
    if (document.getElementById('members-fields-container')?.children.length === 0) {
      this.addMemberField();
      this.addMemberField();
    }

    // Renderizar pestaña inicial
    this.switchTab('home');
  },

  loadData() {
    this.data = window.DataStore.get();
  },

  // -------------------------------------------------------------
  // NAVEGACIÓN Y SESIÓN
  // -------------------------------------------------------------
  bindNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    this.loadData();

    // Control de acceso para pestañas exclusivas de administrador
    const isAdminOnly = (tabId === 'admin' || tabId === 'certificates' || tabId === 'agents');
    if (isAdminOnly && (!this.session || this.session.role !== 'admin')) {
      this.showToast('Acceso restringido. Debes iniciar sesión como Administrador para ver esta sección.', 'warning');
      this.switchTab('home');
      return;
    }

    // Control de acceso para el ranking si no está público
    if (tabId === 'ranking' && (!this.session || this.session.role !== 'admin') && !window.DataStore.isRankingPublic()) {
      this.showToast('La tabla de Ranking Nacional aún no es pública. Solo el Administrador puede visualizarla.', 'warning');
      this.switchTab('home');
      return;
    }

    // Control de acceso para portal del juez
    if (tabId === 'judge' && (!this.session || this.session.role !== 'judge')) {
      this.showToast('Acceso exclusivo para Jueces Evaluadores.', 'warning');
      this.switchTab('home');
      return;
    }

    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === `tab-${tabId}`);
    });

    if (tabId === 'ranking') this.renderRanking();
    if (tabId === 'admin') this.renderAdminPanel();
    if (tabId === 'certificates') this.renderCertificatesTab();
    if (tabId === 'judge') this.renderJudgePortal();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  bindThemeToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;

    if (localStorage.getItem('MENDIX_DARK_MODE') === 'true') {
      document.body.classList.add('dark-mode');
      btn.innerHTML = '☀️';
    }

    btn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('MENDIX_DARK_MODE', isDark);
      btn.innerHTML = isDark ? '☀️' : '🌙';
    });
  },

  renderSessionState() {
    const s = this.session;
    const pill = document.getElementById('session-info-pill');
    const roleBadge = document.getElementById('session-role-badge');
    const userName = document.getElementById('session-user-name');
    const btnLogin = document.getElementById('btn-header-login');
    const btnLogout = document.getElementById('btn-header-logout');
    const tabAdmin = document.getElementById('tab-nav-admin');
    const tabCertificates = document.getElementById('tab-nav-certificates');
    const tabRanking = document.getElementById('tab-nav-ranking');
    const tabAgents = document.getElementById('tab-nav-agents');
    const tabJudge = document.getElementById('tab-nav-judge');
    const btnToggleRanking = document.getElementById('btn-toggle-ranking-visibility');
    const tiebreakerBanner = document.getElementById('ranking-tiebreaker-banner');

    const isRankingPublic = window.DataStore.isRankingPublic();

    if (s) {
      pill.style.display = 'flex';
      userName.textContent = s.name;
      btnLogin.style.display = 'none';
      btnLogout.style.display = 'inline-flex';

      if (s.role === 'admin') {
        roleBadge.textContent = '👑 Administrador';
        roleBadge.className = 'badge badge-confirmed';
        if (tabAdmin) tabAdmin.style.display = 'inline-flex';
        if (tabCertificates) tabCertificates.style.display = 'inline-flex';
        if (tabRanking) tabRanking.style.display = 'inline-flex';
        if (tabAgents) tabAgents.style.display = 'inline-flex';
        if (tabJudge) tabJudge.style.display = 'none';
        if (btnToggleRanking) btnToggleRanking.style.display = 'inline-flex';
        if (tiebreakerBanner) tiebreakerBanner.style.display = 'block';
      } else if (s.role === 'judge') {
        const campusShort = (s.campus || '').replace('Campus ', '');
        roleBadge.textContent = `⚖️ Juez (${campusShort})`;
        roleBadge.className = 'badge badge-evaluated';
        if (tabAdmin) tabAdmin.style.display = 'none';
        if (tabCertificates) tabCertificates.style.display = 'none';
        if (tabRanking) tabRanking.style.display = isRankingPublic ? 'inline-flex' : 'none';
        if (tabAgents) tabAgents.style.display = 'none';
        if (tabJudge) tabJudge.style.display = 'inline-flex';
        if (btnToggleRanking) btnToggleRanking.style.display = 'none';
        if (tiebreakerBanner) tiebreakerBanner.style.display = 'none';
      }
    } else {
      pill.style.display = 'none';
      btnLogin.style.display = 'inline-flex';
      btnLogout.style.display = 'none';
      if (tabAdmin) tabAdmin.style.display = 'none';
      if (tabCertificates) tabCertificates.style.display = 'none';
      if (tabRanking) tabRanking.style.display = isRankingPublic ? 'inline-flex' : 'none';
      if (tabAgents) tabAgents.style.display = 'none';
      if (tabJudge) tabJudge.style.display = 'none';
      if (btnToggleRanking) btnToggleRanking.style.display = 'none';
      if (tiebreakerBanner) tiebreakerBanner.style.display = 'none';
    }

    this.updateRankingVisibilityButton();
  },

  populateCampusDropdowns() {
    const campusList = window.TECMILENIO_CAMPUS || [];
    ['reg-campus', 'judge-reg-campus'].forEach(selectId => {
      const select = document.getElementById(selectId);
      if (!select) return;
      select.innerHTML = '<option value="">-- Seleccionar Campus Tecmilenio --</option>' +
        campusList.map(c => `<option value="${c}">${c}</option>`).join('');
    });
  },

  // -------------------------------------------------------------
  // AUTENTICACIÓN
  // -------------------------------------------------------------
  openLoginModal() {
    document.getElementById('modal-login').classList.add('active');
  },

  closeLoginModal() {
    document.getElementById('modal-login').classList.remove('active');
  },

  fillDemoLogin(type) {
    if (type === 'admin') {
      document.getElementById('login-email').value = 'admin@tecmilenio.mx';
      document.getElementById('login-password').value = 'adminTEC';
    } else if (type === 'judge1') {
      document.getElementById('login-email').value = 'roberto.garcia@tecmilenio.mx';
      document.getElementById('login-password').value = 'juezTEC2026';
    } else if (type === 'judge2') {
      document.getElementById('login-email').value = 'laura.sanchez@tecmilenio.mx';
      document.getElementById('login-password').value = 'juezTEC2026';
    }
  },

  submitLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    const res = window.DataStore.login(email, pass);
    if (res.success) {
      this.session = res.session;
      this.closeLoginModal();
      this.renderSessionState();
      this.showToast(`¡Bienvenido, ${this.session.name}!`, 'success');

      if (this.session.role === 'admin') {
        this.switchTab('admin');
      } else if (this.session.role === 'judge') {
        this.switchTab('judge');
      }
    } else {
      this.showToast(res.message, 'danger');
    }
  },

  logout() {
    window.DataStore.clearSession();
    this.session = null;
    this.renderSessionState();
    this.switchTab('home');
    this.showToast('Sesión cerrada correctamente.', 'info');
  },

  // -------------------------------------------------------------
  // REGISTRO DE PARTICIPANTES & MANEJO DE ARCHIVOS
  // -------------------------------------------------------------
  openParticipantModal() {
    this.switchTab('register');
  },

  handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'approval') {
        this.uploadedApprovalFile = {
          name: file.name,
          dataUrl: e.target.result
        };
        this.showToast(`Archivo aval "${file.name}" cargado para almacenamiento.`, 'info');
      } else if (type === 'doc') {
        this.uploadedDocFile = {
          name: file.name,
          dataUrl: e.target.result
        };
        this.showToast(`Documento del proyecto "${file.name}" cargado para almacenamiento.`, 'info');
      }
    };
    reader.readAsDataURL(file);
  },

  addMemberField() {
    if (this.memberCount >= 3) {
      this.showToast('El equipo puede tener un máximo de 3 integrantes adicionales además del capitán.', 'warning');
      return;
    }
    this.memberCount++;
    const idx = this.memberCount;
    const container = document.getElementById('members-fields-container');
    if (!container) return;

    const div = document.createElement('div');
    div.id = `member-row-${idx}`;
    div.style.background = 'var(--bg-card)';
    div.style.padding = '0.85rem';
    div.style.borderRadius = 'var(--radius-sm)';
    div.style.marginBottom = '0.75rem';
    div.style.border = '1px solid var(--border-color)';

    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <strong style="font-size: 0.82rem; color: var(--text-secondary);">Integrante #${idx}</strong>
        <button type="button" class="btn btn-danger btn-sm" onclick="App.removeMemberField(${idx})">Eliminar</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.5rem;">
        <input type="text" id="member-name-${idx}" class="form-control" placeholder="Nombres" required>
        <input type="text" id="member-lastname-${idx}" class="form-control" placeholder="Apellidos" required>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
        <input type="text" id="member-id-${idx}" class="form-control" placeholder="Matrícula (Única)" required>
        <input type="email" id="member-email-${idx}" class="form-control" placeholder="correo@tecmilenio.mx" required>
      </div>
    `;

    container.appendChild(div);
    this.bindAutosaveInputs();
  },

  removeMemberField(idx) {
    const el = document.getElementById(`member-row-${idx}`);
    if (el) el.remove();
    this.memberCount--;
    this.triggerAutosaveParticipant();
  },

  setupAutosave() {
    this.bindAutosaveInputs();
    this.restoreParticipantDraft();
  },

  bindAutosaveInputs() {
    const pForm = document.getElementById('form-participant-registration');
    if (pForm) {
      pForm.querySelectorAll('input, select').forEach(input => {
        input.oninput = () => this.triggerAutosaveParticipant();
        input.onchange = () => this.triggerAutosaveParticipant();
      });
    }

    const jForm = document.getElementById('form-judge-registration');
    if (jForm) {
      jForm.querySelectorAll('input, select').forEach(input => {
        input.oninput = () => this.triggerAutosaveJudge();
      });
    }
  },

  triggerAutosaveParticipant() {
    const data = {
      teamName: document.getElementById('reg-team-name')?.value || '',
      campus: document.getElementById('reg-campus')?.value || '',
      profName: document.getElementById('reg-prof-name')?.value || '',
      profLastname: document.getElementById('reg-prof-lastname')?.value || '',
      capName: document.getElementById('reg-cap-name')?.value || '',
      capLastname: document.getElementById('reg-cap-lastname')?.value || '',
      capId: document.getElementById('reg-cap-id')?.value || '',
      capEmail: document.getElementById('reg-cap-email')?.value || '',
      videoUrl: document.getElementById('reg-video-url')?.value || '',
      members: []
    };

    for (let i = 1; i <= 3; i++) {
      const name = document.getElementById(`member-name-${i}`)?.value;
      if (name !== undefined) {
        data.members.push({
          firstName: name,
          lastName: document.getElementById(`member-lastname-${i}`)?.value || '',
          studentId: document.getElementById(`member-id-${i}`)?.value || '',
          email: document.getElementById(`member-email-${i}`)?.value || ''
        });
      }
    }

    window.DataStore.saveDraftParticipant(data);
    const ind = document.getElementById('autosave-participant-indicator');
    if (ind) {
      ind.textContent = '💾 Autoguardado: ' + new Date().toLocaleTimeString();
    }
  },

  restoreParticipantDraft() {
    const draft = window.DataStore.getDraftParticipant();
    if (!draft) return;

    if (draft.teamName) document.getElementById('reg-team-name').value = draft.teamName;
    if (draft.campus) document.getElementById('reg-campus').value = draft.campus;
    if (draft.profName) document.getElementById('reg-prof-name').value = draft.profName;
    if (draft.profLastname) document.getElementById('reg-prof-lastname').value = draft.profLastname;
    if (draft.capName) document.getElementById('reg-cap-name').value = draft.capName;
    if (draft.capLastname) document.getElementById('reg-cap-lastname').value = draft.capLastname;
    if (draft.capId) document.getElementById('reg-cap-id').value = draft.capId;
    if (draft.capEmail) document.getElementById('reg-cap-email').value = draft.capEmail;
    if (draft.videoUrl) document.getElementById('reg-video-url').value = draft.videoUrl;

    if (draft.members && draft.members.length > 0) {
      const container = document.getElementById('members-fields-container');
      if (container) container.innerHTML = '';
      this.memberCount = 0;
      draft.members.forEach(m => {
        this.addMemberField();
        const idx = this.memberCount;
        if (document.getElementById(`member-name-${idx}`)) {
          document.getElementById(`member-name-${idx}`).value = m.firstName || '';
          document.getElementById(`member-lastname-${idx}`).value = m.lastName || '';
          document.getElementById(`member-id-${idx}`).value = m.studentId || '';
          document.getElementById(`member-email-${idx}`).value = m.email || '';
        }
      });
    }
  },

  clearParticipantFormDraft() {
    window.DataStore.clearDraftParticipant();
    document.getElementById('form-participant-registration')?.reset();
    document.getElementById('members-fields-container').innerHTML = '';
    this.memberCount = 0;
    this.uploadedApprovalFile = null;
    this.uploadedDocFile = null;
    this.addMemberField();
    this.addMemberField();
    this.showToast('Borrador restablecido.', 'info');
  },

  submitParticipantRegistration() {
    const teamName = document.getElementById('reg-team-name').value.trim();
    const campus = document.getElementById('reg-campus').value;
    const profName = document.getElementById('reg-prof-name').value.trim();
    const profLastname = document.getElementById('reg-prof-lastname').value.trim();
    const capName = document.getElementById('reg-cap-name').value.trim();
    const capLastname = document.getElementById('reg-cap-lastname').value.trim();
    const capId = document.getElementById('reg-cap-id').value.trim();
    const capEmail = document.getElementById('reg-cap-email').value.trim();
    const videoUrl = document.getElementById('reg-video-url').value.trim();

    const members = [];
    for (let i = 1; i <= 3; i++) {
      const n = document.getElementById(`member-name-${i}`)?.value?.trim();
      if (n) {
        members.push({
          firstName: n,
          lastName: document.getElementById(`member-lastname-${i}`)?.value?.trim() || '',
          studentId: document.getElementById(`member-id-${i}`)?.value?.trim() || '',
          email: document.getElementById(`member-email-${i}`)?.value?.trim() || ''
        });
      }
    }

    const fileApprovalInput = document.getElementById('reg-file-approval');
    const fileDocInput = document.getElementById('reg-file-doc');

    const approvalFileName = this.uploadedApprovalFile?.name || (fileApprovalInput?.files[0]?.name) || 'Plantilla_AvalDocente.pdf';
    const approvalDataUrl = this.uploadedApprovalFile?.dataUrl || null;

    const docFileName = this.uploadedDocFile?.name || (fileDocInput?.files[0]?.name) || 'Manual_Etapa_Docente_Mendix_Agile_Challenge.pdf';
    const docDataUrl = this.uploadedDocFile?.dataUrl || null;

    const payload = {
      teamName,
      campus,
      professor: { firstName: profName, lastName: profLastname },
      captain: { firstName: capName, lastName: capLastname, studentId: capId, email: capEmail },
      members,
      professorApprovalFile: approvalFileName,
      professorApprovalFileName: approvalFileName,
      professorApprovalFileDataUrl: approvalDataUrl,
      projectDocFile: docFileName,
      projectDocFileName: docFileName,
      projectDocFileDataUrl: docDataUrl,
      videoUrl
    };

    const res = window.DataStore.registerParticipant(payload);
    if (!res.success) {
      this.showToast(res.message, 'danger');
      return;
    }

    // Registro exitoso -> Mostrar folio único
    document.getElementById('success-team-name').textContent = res.participant.teamName;
    document.getElementById('success-folio-code').textContent = res.participant.folio;
    document.getElementById('modal-folio-success').classList.add('active');

    // Limpiar formulario y buffers
    document.getElementById('form-participant-registration').reset();
    document.getElementById('members-fields-container').innerHTML = '';
    this.memberCount = 0;
    this.uploadedApprovalFile = null;
    this.uploadedDocFile = null;
    this.addMemberField();
    this.addMemberField();
  },

  // -------------------------------------------------------------
  // REGISTRO DE CUENTA DE JUEZ
  // -------------------------------------------------------------
  openJudgeRegistrationModal() {
    this.closeLoginModal();
    document.getElementById('modal-register-judge').classList.add('active');
  },

  closeJudgeRegistrationModal() {
    document.getElementById('modal-register-judge').classList.remove('active');
  },

  triggerAutosaveJudge() {
    const data = {
      name: document.getElementById('judge-reg-name')?.value || '',
      lastname: document.getElementById('judge-reg-lastname')?.value || '',
      payroll: document.getElementById('judge-reg-payroll')?.value || '',
      campus: document.getElementById('judge-reg-campus')?.value || '',
      email: document.getElementById('judge-reg-email')?.value || ''
    };
    window.DataStore.saveDraftJudge(data);
  },

  submitJudgeRegistration() {
    const firstName = document.getElementById('judge-reg-name').value.trim();
    const lastName = document.getElementById('judge-reg-lastname').value.trim();
    const payroll = document.getElementById('judge-reg-payroll').value.trim();
    const campus = document.getElementById('judge-reg-campus').value;
    const email = document.getElementById('judge-reg-email').value.trim();
    const password = document.getElementById('judge-reg-password').value.trim();

    const res = window.DataStore.registerJudge({
      firstName, lastName, payroll, campus, email, password
    });

    if (!res.success) {
      this.showToast(res.message, 'danger');
      return;
    }

    this.closeJudgeRegistrationModal();
    this.showToast('¡Cuenta de juez creada con éxito! Iniciando sesión...', 'success');

    const loginRes = window.DataStore.login(email, password);
    if (loginRes.success) {
      this.session = loginRes.session;
      this.renderSessionState();
      this.switchTab('judge');
    }
  },

  // -------------------------------------------------------------
  // VISTA ADMINISTRADOR
  // -------------------------------------------------------------
  renderAdminPanel() {
    if (!this.session || this.session.role !== 'admin') return;
    this.loadData();

    document.getElementById('admin-participants-count').textContent = `${this.data.participants.length} equipos`;

    // Lista de Jueces Pendientes
    const pendingJudges = window.DataStore.getPendingJudges();
    const pendingContainer = document.getElementById('admin-pending-judges-list');
    if (pendingContainer) {
      if (pendingJudges.length === 0) {
        pendingContainer.innerHTML = '<span style="color: var(--success); font-weight:700; font-size: 0.85rem;">✓ ¡Todos los jueces han completado y confirmado sus evaluaciones!</span>';
      } else {
        pendingContainer.innerHTML = pendingJudges.map(j => `
          <div style="background: var(--warning-light); border: 1px solid var(--warning); padding: 0.4rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⏳</span>
            <strong>${j.firstName} ${j.lastName}</strong>
            <span style="color: var(--text-muted);">(${j.campus})</span>
            <span class="badge badge-pending">${j.assignedParticipants.length} asignados</span>
          </div>
        `).join('');
      }
    }

    // Padrón de Participantes ordenados de MAYOR A MENOR por calificación en columna Estado
    const pTbody = document.getElementById('admin-participants-table-body');
    if (pTbody) {
      const sortedParticipants = [...this.data.participants].sort((a, b) => {
        const scoreA = (a.evaluation && typeof a.evaluation.finalScore === 'number') ? a.evaluation.finalScore : -1;
        const scoreB = (b.evaluation && typeof b.evaluation.finalScore === 'number') ? b.evaluation.finalScore : -1;
        return scoreB - scoreA;
      });

      pTbody.innerHTML = sortedParticipants.map(p => {
        const isEval = p.evaluation && p.evaluation.finalScore !== undefined;
        const statusBadge = isEval ?
          `<span class="badge badge-confirmed" style="font-size:0.85rem; font-weight:800;">${p.evaluation.finalScore} pts ${p.evaluation.isLocked ? '🔒' : '📝'}</span>` :
          `<span class="badge badge-pending">Sin Calificar</span>`;

        // URL de descarga del documento PDF del proyecto
        const docDownloadUrl = p.projectDocFileDataUrl || p.projectDocFile || 'Plantilla_AvalDocente.pdf';
        const docFileName = p.projectDocFileName || p.projectDocFile || 'Documento_Proyecto.pdf';

        const approvalDownloadUrl = p.professorApprovalFileDataUrl || p.professorApprovalFile || 'Plantilla_AvalDocente.pdf';
        const approvalFileName = p.professorApprovalFileName || p.professorApprovalFile || 'Aval_Docente.pdf';

        const judgeOptions = '<option value="">-- Sin Asignar --</option>' +
          this.data.judges.map(j => {
            const isSameCampus = j.campus === p.campus;
            const disabledAttr = isSameCampus ? 'disabled' : '';
            const sameTag = isSameCampus ? ' [MISMO CAMPUS]' : '';
            const selected = p.assignedJudgeId === j.id ? 'selected' : '';
            return `<option value="${j.id}" ${selected} ${disabledAttr}>${j.firstName} ${j.lastName} (${j.campus})${sameTag}</option>`;
          }).join('');

        return `
          <tr>
            <td style="font-weight: 800; font-size: 0.82rem; color: var(--tec-green);">${p.folio}</td>
            <td>
              <div style="font-weight: 700;">${p.teamName}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${p.members.length + 1} integrantes</div>
            </td>
            <td><span class="badge badge-campus">${p.campus}</span></td>
            <td>
              <div style="font-weight: 600;">${p.captain.firstName} ${p.captain.lastName}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${p.captain.studentId}</div>
            </td>
            <td>
              <div style="display:flex; gap:0.35rem; align-items:center;">
                <a href="${p.videoUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Ver Video (3 min)">🎥 Video</a>
                <a href="${docDownloadUrl}" download="${docFileName}" class="btn btn-tec btn-sm" title="Descargar Documento PDF del Proyecto">📥 PDF</a>
                <a href="${approvalDownloadUrl}" download="${approvalFileName}" class="btn btn-secondary btn-sm" title="Descargar Aval Docente">📋 Aval</a>
              </div>
            </td>
            <td>
              <select class="form-control" style="font-size: 0.8rem; padding: 0.35rem;" onchange="App.onAdminChangeJudgeAssignment('${p.id}', this.value)">
                ${judgeOptions}
              </select>
            </td>
            <td>${statusBadge}</td>
            <td style="text-align: right;">
              <button class="btn btn-danger btn-sm" onclick="App.deleteParticipantConfirm('${p.id}')">🗑️</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Tabla de Jueces
    const jTbody = document.getElementById('admin-judges-table-body');
    if (jTbody) {
      jTbody.innerHTML = this.data.judges.map(j => {
        const count = (j.assignedParticipants || []).length;
        const readyCount = (j.assignedParticipants || []).filter(pid => {
          const part = this.data.participants.find(p => p.id === pid);
          return part && part.evaluation && part.evaluation.isLocked;
        }).length;

        const isFullyDone = count > 0 && readyCount === count;
        const confirmedBadge = isFullyDone ?
          '<span class="badge badge-confirmed">✓ Evaluaciones Listas (Bloqueadas)</span>' :
          `<span class="badge badge-pending">Pendiente (${readyCount}/${count} listos)</span>`;

        return `
          <tr>
            <td style="font-weight: 700;">${j.firstName} ${j.lastName}</td>
            <td style="font-family: monospace;">${j.payroll}</td>
            <td><span class="badge badge-campus">${j.campus}</span></td>
            <td>${j.email}</td>
            <td><strong style="color: var(--mendix-blue); font-size: 1rem;">${count}</strong> proyectos</td>
            <td>${confirmedBadge}</td>
            <td style="text-align: right;">
              <button class="btn btn-danger btn-sm" onclick="App.deleteJudgeConfirm('${j.id}')">🗑️</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

  generateOfficialRanking() {
    const res = window.DataStore.generateOfficialRanking();
    if (res.success) {
      this.showToast(`¡Ranking Nacional generado exitosamente con el Top 10 de mejores puntajes!`, 'success');
      this.switchTab('ranking');
    } else {
      this.showToast('No fue posible generar el ranking.', 'danger');
    }
  },

  runAutoAssignmentWorkflow() {
    const res = window.DataStore.runAutoAssignment();
    if (res.success) {
      this.showToast(res.message, res.warning ? 'warning' : 'success');
      this.renderAdminPanel();
    } else {
      this.showToast(res.message, 'danger');
    }
  },

  onAdminChangeJudgeAssignment(partId, judgeId) {
    const res = window.DataStore.setManualAssignment(partId, judgeId);
    if (!res.success) {
      this.showToast(res.message, 'danger');
      this.renderAdminPanel();
    } else {
      this.showToast('Asignación actualizada correctamente.', 'success');
      this.renderAdminPanel();
    }
  },

  deleteParticipantConfirm(id) {
    if (confirm('¿Estás seguro de eliminar este registro de participante?')) {
      window.DataStore.deleteParticipant(id);
      this.showToast('Participante eliminado.', 'info');
      this.renderAdminPanel();
    }
  },

  deleteJudgeConfirm(id) {
    if (confirm('¿Estás seguro de eliminar este juez? Sus proyectos asignados quedarán sin asignar.')) {
      window.DataStore.deleteJudge(id);
      this.showToast('Juez eliminado.', 'info');
      this.renderAdminPanel();
    }
  },

  // -------------------------------------------------------------
  // VISTA JUEZ: CÉDULA DE 20 INDICADORES OBSERVABLES + G
  // -------------------------------------------------------------
  renderJudgePortal() {
    if (!this.session || this.session.role !== 'judge') return;
    this.loadData();

    const judgeId = this.session.judgeId;
    const judge = this.data.judges.find(j => j.id === judgeId);
    if (!judge) return;

    document.getElementById('judge-welcome-meta').textContent =
      `Juez: ${judge.firstName} ${judge.lastName} (Nómina: ${judge.payroll}) • Campus: ${judge.campus}`;

    const assignedIds = judge.assignedParticipants || [];
    const select = document.getElementById('judge-assigned-select');
    if (!select) return;

    if (assignedIds.length === 0) {
      select.innerHTML = '<option value="">No tienes proyectos asignados actualmente.</option>';
      document.getElementById('judge-project-dossier').style.display = 'none';
      document.getElementById('judge-rubric-container').style.display = 'none';
      return;
    }

    select.innerHTML = '<option value="">-- Seleccionar Proyecto Asignado --</option>' +
      assignedIds.map(pid => {
        const p = this.data.participants.find(part => part.id === pid);
        if (!p) return '';
        const evaluatedTag = p.evaluation && p.evaluation.finalScore !== undefined ?
          (p.evaluation.isLocked ? `🔒 Calificado y Listo: ${p.evaluation.finalScore} pts` : `📝 Borrador: ${p.evaluation.finalScore} pts`) :
          '⏳ Sin calificar';
        return `<option value="${p.id}">${p.folio} - ${p.teamName} (${p.campus}) [${evaluatedTag}]</option>`;
      }).join('');

    if (this.selectedJudgeParticipantId && assignedIds.includes(this.selectedJudgeParticipantId)) {
      select.value = this.selectedJudgeParticipantId;
      this.onSelectJudgeParticipant(this.selectedJudgeParticipantId);
    } else if (assignedIds.length > 0) {
      select.value = assignedIds[0];
      this.onSelectJudgeParticipant(assignedIds[0]);
    }
  },

  onSelectJudgeParticipant(pid) {
    this.selectedJudgeParticipantId = pid;
    if (!pid) {
      document.getElementById('judge-project-dossier').style.display = 'none';
      document.getElementById('judge-rubric-container').style.display = 'none';
      return;
    }

    const p = this.data.participants.find(part => part.id === pid);
    if (!p) return;

    document.getElementById('judge-project-dossier').style.display = 'block';
    document.getElementById('judge-rubric-container').style.display = 'grid';

    document.getElementById('dossier-campus').textContent = p.campus;
    document.getElementById('dossier-team-name').textContent = p.teamName;
    document.getElementById('dossier-folio').textContent = `Folio: ${p.folio} • Capitán: ${p.captain.firstName} ${p.captain.lastName}`;

    // Enlace de descarga del Documento PDF y Aval
    const docDownloadUrl = p.projectDocFileDataUrl || p.projectDocFile || 'Plantilla_AvalDocente.pdf';
    const docFileName = p.projectDocFileName || p.projectDocFile || 'Documento_Proyecto.pdf';

    const approvalDownloadUrl = p.professorApprovalFileDataUrl || p.professorApprovalFile || 'Plantilla_AvalDocente.pdf';
    const approvalFileName = p.professorApprovalFileName || p.professorApprovalFile || 'Aval_Docente.pdf';

    document.getElementById('dossier-links').innerHTML = `
      <a href="${p.videoUrl}" target="_blank" class="btn btn-tec btn-sm">🎥 Ver Video (Máx 3 min)</a>
      <a href="${docDownloadUrl}" download="${docFileName}" class="btn btn-secondary btn-sm" title="Descargar Documento PDF del Proyecto">📥 Descargar Documento PDF</a>
      <a href="${approvalDownloadUrl}" download="${approvalFileName}" class="btn btn-secondary btn-sm" title="Descargar Aval Docente">📋 Descargar Aval Docente</a>
    `;

    // Cargar indicadores o iniciar en 0
    const evalData = p.evaluation || {
      indicators: {
        A1: 0, A2: 0, A3: 0, A4: 0, A5: 0, A6: 0, A7: 0, A8: 0,
        B1: 0, B2: 0, B3: 0,
        C1: 0, C2: 0, C3: 0,
        D1: 0, D2: 0, D3: 0,
        E1: 0, E2: 0, E3: 0
      },
      G: 0.0,
      justificationG: '',
      isLocked: false
    };

    this.currentEvaluationState = JSON.parse(JSON.stringify(evalData));
    document.getElementById('input-eval-G').value = evalData.G || 0.0;
    document.getElementById('input-eval-justification').value = evalData.justificationG || '';

    // Estado bloqueado
    const isLocked = !!evalData.isLocked;
    document.getElementById('input-eval-G').disabled = isLocked;
    document.getElementById('input-eval-justification').disabled = isLocked;

    const actionContainer = document.getElementById('eval-action-buttons-container');
    const lockedNotice = document.getElementById('eval-locked-notice');

    if (isLocked) {
      if (actionContainer) actionContainer.style.display = 'none';
      if (lockedNotice) lockedNotice.style.display = 'block';
    } else {
      if (actionContainer) actionContainer.style.display = 'flex';
      if (lockedNotice) lockedNotice.style.display = 'none';
    }

    this.render20IndicatorsUI();
    this.onUpdateScoreCalculations();
  },

  INDICATORS_DEFINITION: {
    A: [
      { code: 'A1', text: 'Crea un evento con nombre y fecha; lo guarda y lo recupera en una consulta.', source: 'V' },
      { code: 'A2', text: 'Edita un dato del evento y muestra el cambio al consultarlo de nuevo.', source: 'V' },
      { code: 'A3', text: 'Registra un asistente, lo asocia a un evento y lo consulta dentro de ese evento.', source: 'V' },
      { code: 'A4', text: 'Crea una tarea vinculada a un evento, con responsable y fecha compromiso visibles.', source: 'V' },
      { code: 'A5', text: 'Cambia el estatus de una tarea y muestra el estado actualizado en su seguimiento.', source: 'V' },
      { code: 'A6', text: 'Genera un aviso o recordatorio con destinatario y contenido. Si es simulado, lo identifica expresamente.', source: 'V' },
      { code: 'A7', text: 'Muestra el evento creado en un calendario, agenda o listado organizado por fecha.', source: 'V' },
      { code: 'A8', text: 'Completa un recorrido con el mismo evento, sus asistentes y sus tareas vinculados, sin errores que impidan terminarlo.', source: 'V' }
    ],
    B: [
      { code: 'B1', text: 'Permite entrar a eventos, asistentes y tareas y regresar al contexto del evento mediante controles visibles.', source: 'V' },
      { code: 'B2', text: 'Presenta textos legibles y acciones identificadas; usa nombres y controles consistentes en los tres módulos.', source: 'V' },
      { code: 'B3', text: 'Muestra confirmación de guardado y un mensaje comprensible ante un dato obligatorio omitido o inválido.', source: 'V' }
    ],
    C: [
      { code: 'C1', text: 'Incluye modelo de datos de Mendix o ERD con Evento, Asistente y Tarea y sus relaciones, coherentes con la demo.', source: 'D y V' },
      { code: 'C2', text: 'Presenta un microflujo implementado; explica su entrada, decisión o validación y resultado en una función del prototipo.', source: 'D' },
      { code: 'C3', text: 'Documenta una prueba de persistencia: guarda un dato, recarga la vista o reabre el registro y recupera el mismo valor, con resultado y evidencia.', source: 'D' }
    ],
    D: [
      { code: 'D1', text: 'El backlog contiene historias de eventos, asistentes y tareas, con usuario, necesidad, beneficio y criterios de aceptación verificables.', source: 'D' },
      { code: 'D2', text: 'Las historias tienen estimación y prioridad; se explica la técnica de estimación y el criterio para priorizar.', source: 'D' },
      { code: 'D3', text: 'Relaciona historias con sprints, muestra resultados y al menos un ajuste justificado entre lo planeado y lo ejecutado.', source: 'D' }
    ],
    E: [
      { code: 'E1', text: 'Documenta una prueba de eventos, una de asistentes y una de tareas, con pasos, resultado esperado, resultado obtenido y evidencia en cada una.', source: 'D' },
      { code: 'E2', text: 'Muestra un error, su corrección y la repetición exitosa de la prueba. Si no hubo errores, acredita una revisión adicional con resultados verificables.', source: 'D' },
      { code: 'E3', text: 'Documenta una prueba de usuario y una de seguridad o validación de entradas, con resultados y una mejora aplicada o una conclusión justificada.', source: 'D' }
    ]
  },

  render20IndicatorsUI() {
    const isLocked = !!(this.currentEvaluationState && this.currentEvaluationState.isLocked);
    const disabledAttr = isLocked ? 'disabled' : '';

    ['A', 'B', 'C', 'D', 'E'].forEach(blockKey => {
      const container = document.getElementById(`indicators-block-${blockKey}`);
      if (!container) return;

      const items = this.INDICATORS_DEFINITION[blockKey];
      container.innerHTML = items.map(item => {
        const rawVal = (this.currentEvaluationState.indicators && this.currentEvaluationState.indicators[item.code]);
        const val = (rawVal !== undefined && rawVal !== null) ? rawVal : 0;

        return `
          <div class="indicator-row">
            <span class="indicator-code">${item.code}</span>
            <div class="indicator-text">${item.text}</div>
            <span class="indicator-source">${item.source}</span>
            <div class="indicator-score-toggle" style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end;">
              <input type="number" 
                     class="form-control indicator-number-input" 
                     id="input-ind-${item.code}" 
                     min="0" 
                     max="5" 
                     step="0.1" 
                     value="${val}" 
                     style="width: 75px; text-align: center; font-weight: 800; font-size: 0.9rem; padding: 0.25rem;"
                     oninput="App.onIndicatorInputChange('${item.code}', '${blockKey}', this.value)" 
                     ${disabledAttr}>
              <div style="display: flex; gap: 0.25rem;">
                <button type="button" class="btn-score ${val === 0 ? 'selected-0' : ''}" ${disabledAttr} onclick="App.setIndicatorValue('${item.code}', '${blockKey}', 0)">0</button>
                <button type="button" class="btn-score ${val === 5 ? 'selected-5' : ''}" ${disabledAttr} onclick="App.setIndicatorValue('${item.code}', '${blockKey}', 5)">5</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    });
  },

  onIndicatorInputChange(code, blockKey, value) {
    if (!this.currentEvaluationState || this.currentEvaluationState.isLocked) return;
    let numeric = parseFloat(value);
    if (isNaN(numeric) || numeric < 0) numeric = 0;
    if (numeric > 5) numeric = 5;

    this.currentEvaluationState.indicators[code] = numeric;
    this.onUpdateScoreCalculations();
  },

  setIndicatorValue(code, blockKey, value) {
    if (!this.currentEvaluationState || this.currentEvaluationState.isLocked) return;
    this.currentEvaluationState.indicators[code] = value;
    const inputEl = document.getElementById(`input-ind-${code}`);
    if (inputEl) inputEl.value = value;

    this.render20IndicatorsUI();
    this.onUpdateScoreCalculations();
  },

  onUpdateScoreCalculations() {
    if (!this.currentEvaluationState) return;

    const ind = this.currentEvaluationState.indicators || {};
    const sumBlock = (items) => items.reduce((acc, it) => acc + (parseFloat(ind[it.code]) || 0), 0);

    const subA = parseFloat(sumBlock(this.INDICATORS_DEFINITION.A).toFixed(2));
    const subB = parseFloat(sumBlock(this.INDICATORS_DEFINITION.B).toFixed(2));
    const subC = parseFloat(sumBlock(this.INDICATORS_DEFINITION.C).toFixed(2));
    const subD = parseFloat(sumBlock(this.INDICATORS_DEFINITION.D).toFixed(2));
    const subE = parseFloat(sumBlock(this.INDICATORS_DEFINITION.E).toFixed(2));

    // Validaciones de máximos por sección
    this.updateSectionBadge('A', subA, 40);
    this.updateSectionBadge('B', subB, 15);
    this.updateSectionBadge('C', subC, 15);
    this.updateSectionBadge('D', subD, 15);
    this.updateSectionBadge('E', subE, 15);

    const R = parseFloat((subA + subB + subC + subD + subE).toFixed(2));
    const contributionR = parseFloat((R * 0.90).toFixed(2));
    const G = parseFloat(document.getElementById('input-eval-G').value) || 0;
    const finalScore = parseFloat((contributionR + G).toFixed(2));

    document.getElementById('live-R-score').textContent = `${R} / 100`;
    document.getElementById('live-contribution-R').textContent = `${contributionR.toFixed(2)} / 90`;
    document.getElementById('live-display-G').textContent = `${G.toFixed(1)} / 10`;
    document.getElementById('live-final-score').textContent = `${finalScore.toFixed(2)} / 100`;
    document.getElementById('big-final-score-display').textContent = finalScore.toFixed(2);
  },

  updateSectionBadge(blockKey, current, max) {
    const badge = document.getElementById(`subtotal-badge-${blockKey}`);
    if (!badge) return;

    if (current > max) {
      badge.className = 'badge badge-danger';
      badge.textContent = `⚠️ Subtotal ${blockKey}: ${current} / ${max} (Excede el límite)`;
    } else {
      badge.className = 'badge badge-campus';
      badge.textContent = `Subtotal ${blockKey}: ${current} / ${max}`;
    }
  },

  saveCurrentProjectEvaluation(isLocking = false) {
    if (!this.selectedJudgeParticipantId) return;

    const ind = this.currentEvaluationState.indicators || {};
    const sumBlock = (items) => items.reduce((acc, it) => acc + (parseFloat(ind[it.code]) || 0), 0);

    const subA = sumBlock(this.INDICATORS_DEFINITION.A);
    const subB = sumBlock(this.INDICATORS_DEFINITION.B);
    const subC = sumBlock(this.INDICATORS_DEFINITION.C);
    const subD = sumBlock(this.INDICATORS_DEFINITION.D);
    const subE = sumBlock(this.INDICATORS_DEFINITION.E);

    // Validación de límites máximos
    if (subA > 40) { this.showToast(`La sección A excede el máximo permitido de 40 puntos (actual: ${subA.toFixed(1)}).`, 'danger'); return; }
    if (subB > 15) { this.showToast(`La sección B excede el máximo permitido de 15 puntos (actual: ${subB.toFixed(1)}).`, 'danger'); return; }
    if (subC > 15) { this.showToast(`La sección C excede el máximo permitido de 15 puntos (actual: ${subC.toFixed(1)}).`, 'danger'); return; }
    if (subD > 15) { this.showToast(`La sección D excede el máximo permitido de 15 puntos (actual: ${subD.toFixed(1)}).`, 'danger'); return; }
    if (subE > 15) { this.showToast(`La sección E excede el máximo permitido de 15 puntos (actual: ${subE.toFixed(1)}).`, 'danger'); return; }

    const G = parseFloat(document.getElementById('input-eval-G').value) || 0;
    const justification = document.getElementById('input-eval-justification').value.trim();

    if (isLocking && (!justification || justification.length < 10)) {
      this.showToast('La justificación de la valoración global G es obligatoria y fundamentada para marcar el proyecto como listo.', 'warning');
      return;
    }

    if (isLocking) {
      if (!confirm('¿Estás seguro de marcar este proyecto como LISTO? Una vez guardado, la rúbrica quedará BLOQUEADA y ya no podrás editar ningún campo.')) {
        return;
      }
    }

    const payload = {
      judgeId: this.session.judgeId,
      indicators: this.currentEvaluationState.indicators,
      G: G,
      justificationG: justification
    };

    const res = window.DataStore.saveEvaluation(this.selectedJudgeParticipantId, payload, isLocking);
    if (!res.success) {
      this.showToast(res.message, 'danger');
      return;
    }

    this.showToast(isLocking ? '🔒 ¡Proyecto calificado y bloqueado definitivamente!' : '💾 Borrador guardado exitosamente.', 'success');
    this.renderJudgePortal();
  },

  // -------------------------------------------------------------
  // RANKING NACIONAL OFICIAL (LISTA SOLO EL TOP 10)
  // -------------------------------------------------------------
  renderRanking() {
    this.loadData();
    const top10 = window.DataStore.getPublishedRanking();
    const podium = document.getElementById('ranking-podium-container');
    const tbody = document.getElementById('ranking-table-body');
    const tiebreakerBanner = document.getElementById('ranking-tiebreaker-banner');

    if (tiebreakerBanner) {
      tiebreakerBanner.style.display = (this.session && this.session.role === 'admin') ? 'block' : 'none';
    }
    this.updateRankingVisibilityButton();

    // Podio visual Top 3 (Sin subtotales, según especificación oficial)
    if (podium) {
      if (top10.length >= 3) {
        const top3 = top10.slice(0, 3);
        const medals = ['👑 1.er Lugar Nacional', '🥈 2.do Lugar Nacional', '🥉 3.er Lugar Nacional'];
        const borderColors = ['#00B04F', '#94A3B8', '#D97706'];

        podium.innerHTML = top3.map((p, idx) => `
          <div class="card" style="border-top: 5px solid ${borderColors[idx]}; text-align: center; padding: 1.5rem;">
            <div style="font-size: 2.5rem; margin-bottom: 0.3rem;">${idx === 0 ? '🥇' : (idx === 1 ? '🥈' : '🥉')}</div>
            <span class="badge badge-confirmed" style="margin-bottom: 0.5rem;">${medals[idx]}</span>
            <h3 style="font-size: 1.25rem; font-weight: 900;">${p.teamName}</h3>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${p.campus}</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--tec-green); margin: 0.6rem 0;">
              ${p.evaluation.finalScore.toFixed(2)}
            </div>
          </div>
        `).join('');
      } else {
        podium.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">El podio se activará en cuanto se hayan calificado al menos 3 proyectos y el Administrador genere el Ranking Nacional.</p>';
      }
    }

    // Tabla Completa (Solo 10 primeros lugares)
    if (tbody) {
      if (top10.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align: center; padding: 2rem; color: var(--text-muted);">El Ranking Nacional aún no ha sido generado por el Administrador. Presiona "Generar Ranking Nacional" desde el Panel del Administrador.</td></tr>';
        return;
      }

      tbody.innerHTML = top10.map((p, idx) => {
        const e = p.evaluation;
        const placeTag = idx === 0 ? '🥇 1.º' : (idx === 1 ? '🥈 2.º' : (idx === 2 ? '🥉 3.º' : `#${idx + 1}`));

        return `
          <tr>
            <td style="font-weight: 900; font-size: 1rem;">${placeTag}</td>
            <td style="font-weight: 700; color: var(--tec-green);">${p.folio}</td>
            <td style="font-weight: 800;">${p.teamName}</td>
            <td><span class="badge badge-campus">${p.campus}</span></td>
            <td>${e.subtotalA}</td>
            <td>${e.subtotalB}</td>
            <td>${e.subtotalC}</td>
            <td>${e.subtotalD}</td>
            <td>${e.subtotalE}</td>
            <td><strong>${e.R}</strong></td>
            <td>${e.contributionR.toFixed(2)}</td>
            <td>${e.G.toFixed(1)}</td>
            <td style="font-weight: 900; font-size: 1.15rem; color: var(--tec-green);">${e.finalScore.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    }
  },

  exportRankingCSV() {
    const top10 = window.DataStore.getPublishedRanking();
    let csv = 'Lugar,Folio,Equipo,Campus,Capitan,Subtotal_A_40,Subtotal_B_15,Subtotal_C_15,Subtotal_D_15,Subtotal_E_15,R_100,Aporte_R_90,G_10,Calificacion_Final\n';

    top10.forEach((p, idx) => {
      const e = p.evaluation;
      csv += `"${idx + 1}","${p.folio}","${p.teamName.replace(/"/g, '""')}","${p.campus}","${p.captain.firstName} ${p.captain.lastName}","${e.subtotalA}","${e.subtotalB}","${e.subtotalC}","${e.subtotalD}","${e.subtotalE}","${e.R}","${e.contributionR}","${e.G}","${e.finalScore}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tecmilenio_MendixAgileChallenge_Top10_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // -------------------------------------------------------------
  // CONTROL DE VISIBILIDAD DEL RANKING NACIONAL
  // -------------------------------------------------------------
  updateRankingVisibilityButton() {
    const btn = document.getElementById('btn-toggle-ranking-visibility');
    if (!btn) return;
    if (!this.session || this.session.role !== 'admin') {
      btn.style.display = 'none';
      return;
    }
    btn.style.display = 'inline-flex';
    const isPublic = window.DataStore.isRankingPublic();
    if (isPublic) {
      btn.className = 'btn btn-sm btn-tec';
      btn.innerHTML = '🌐 Ranking Público (Visible para Todos)';
      btn.title = 'Actualmente visible para todos los usuarios. Haz clic para ocultarlo del público.';
    } else {
      btn.className = 'btn btn-sm btn-secondary';
      btn.innerHTML = '🔒 Ranking Privado (Oculto al Público)';
      btn.title = 'Actualmente visible únicamente para Administrador. Haz clic para publicarlo.';
    }
  },

  toggleRankingVisibility() {
    if (!this.session || this.session.role !== 'admin') return;
    const newState = window.DataStore.toggleRankingVisibility();
    this.renderSessionState();
    this.updateRankingVisibilityButton();
    if (newState) {
      this.showToast('¡El Ranking Nacional ahora es VISIBLE para todos los visitantes!', 'success');
    } else {
      this.showToast('El Ranking Nacional ahora está OCULTO para el público (solo Administrador).', 'info');
    }
  },

  // -------------------------------------------------------------
  // MÓDULO DE RECONOCIMIENTOS OFICIALES (ADMINISTRADOR)
  // -------------------------------------------------------------
  currentCertCategory: 'captains',
  activeCertData: null,
  pendingEmailInfo: null,

  switchCertCategory(category) {
    this.currentCertCategory = category;
    const btns = {
      captains: document.getElementById('btn-cert-tab-captains'),
      judges: document.getElementById('btn-cert-tab-judges'),
      winners: document.getElementById('btn-cert-tab-winners')
    };
    const panels = {
      captains: document.getElementById('cert-panel-captains'),
      judges: document.getElementById('cert-panel-judges'),
      winners: document.getElementById('cert-panel-winners')
    };

    Object.keys(btns).forEach(cat => {
      if (btns[cat]) {
        btns[cat].className = cat === category ? 'btn btn-sm btn-tec' : 'btn btn-sm btn-secondary';
      }
      if (panels[cat]) {
        panels[cat].style.display = cat === category ? 'block' : 'none';
      }
    });

    if (category === 'captains') this.renderCertificatesCaptains();
    if (category === 'judges') this.renderCertificatesJudges();
    if (category === 'winners') this.renderCertificatesWinners();
  },

  renderCertificatesTab() {
    if (!this.session || this.session.role !== 'admin') return;
    this.loadData();
    this.switchCertCategory(this.currentCertCategory || 'captains');
  },

  renderCertificatesCaptains() {
    const tbody = document.getElementById('cert-captains-table-body');
    if (!tbody) return;
    this.loadData();

    const parts = this.data.participants || [];
    if (parts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay equipos registrados actualmente.</td></tr>';
      return;
    }

    tbody.innerHTML = parts.map(p => {
      const isSent = window.DataStore.isCertificateSent(p.id, 'captain');
      const statusBadge = isSent
        ? '<span class="badge badge-confirmed">✓ Enviado al Capitán</span>'
        : '<span class="badge badge-campus">⏳ Pendiente de Envío</span>';

      const membersList = (p.members || []).map(m => `${m.firstName} ${m.lastName}`).join(', ');
      const allMembers = `${p.captain.firstName} ${p.captain.lastName} (Capitán)` + (membersList ? `, ${membersList}` : '');

      return `
        <tr>
          <td style="font-weight: 700; color: var(--tec-green);">${p.folio}</td>
          <td style="font-weight: 800;">${p.teamName}</td>
          <td><span class="badge badge-campus">${p.campus}</span></td>
          <td>
            <strong>${p.captain.firstName} ${p.captain.lastName}</strong><br>
            <small style="color: var(--text-muted);">${p.captain.email}</small>
          </td>
          <td style="font-size: 0.8rem; max-width: 250px; color: var(--text-secondary);">${allMembers}</td>
          <td>${statusBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="App.openCertificatePreview('captain', '${p.id}')" title="Ver reconocimiento en alta resolución">
                👁️ Ver
              </button>
              <button class="btn btn-mendix btn-sm" onclick="App.downloadCertificate('captain', '${p.id}')" title="Descargar archivo de imagen PNG">
                📥 Descargar
              </button>
              <button class="btn btn-tec btn-sm" onclick="App.openEmailModal('captain', '${p.id}')" title="Enviar reconocimiento al correo del capitán">
                📧 Enviar Correo
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderCertificatesJudges() {
    const tbody = document.getElementById('cert-judges-table-body');
    if (!tbody) return;
    this.loadData();

    const judges = this.data.judges || [];
    if (judges.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay jueces registrados actualmente.</td></tr>';
      return;
    }

    tbody.innerHTML = judges.map(j => {
      const isSent = window.DataStore.isCertificateSent(j.id, 'judge');
      const statusBadge = isSent
        ? '<span class="badge badge-confirmed">✓ Enviado al Juez</span>'
        : '<span class="badge badge-campus">⏳ Pendiente de Envío</span>';

      return `
        <tr>
          <td style="font-weight: 700; font-family: monospace;">${j.payroll}</td>
          <td style="font-weight: 800;">${j.firstName} ${j.lastName}</td>
          <td><span class="badge badge-campus">${j.campus}</span></td>
          <td><small style="font-weight: 600;">${j.email}</small></td>
          <td>${statusBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="App.openCertificatePreview('judge', '${j.id}')" title="Ver reconocimiento de juez">
                👁️ Ver
              </button>
              <button class="btn btn-mendix btn-sm" onclick="App.downloadCertificate('judge', '${j.id}')" title="Descargar reconocimiento de juez">
                📥 Descargar
              </button>
              <button class="btn btn-tec btn-sm" onclick="App.openEmailModal('judge', '${j.id}')" title="Enviar reconocimiento al correo institucional del juez">
                📧 Enviar Correo
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderCertificatesWinners() {
    const container = document.getElementById('cert-winners-cards-container');
    if (!container) return;
    this.loadData();

    const ranked = window.DataStore.getOfficialRanking();
    if (ranked.length < 3) {
      container.innerHTML = `
        <div class="card" style="grid-column: 1/-1; text-align: center; padding: 2.5rem; background: var(--bg-subtle);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏆</div>
          <h3 style="font-weight: 800; margin-bottom: 0.5rem;">Esperando Calificaciones para Emitir Reconocimientos de Ganadores</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; max-width: 600px; margin: 0 auto 1.25rem auto;">
            Para emitir y enviar los reconocimientos oficiales con medalla de Primer, Segundo y Tercer Lugar Nacional, se requiere que los jueces completen las evaluaciones de al menos 3 proyectos.
          </p>
          <button class="btn btn-mendix btn-sm" onclick="App.generateOfficialRanking()">
            Calcular y Actualizar Ganadores
          </button>
        </div>
      `;
      return;
    }

    const top3 = ranked.slice(0, 3);
    const winnerConfigs = [
      {
        place: 1,
        title: 'Primer Lugar Nacional',
        badgeClass: 'badge-confirmed',
        borderColor: '#D97706',
        medalIcon: '🥇',
        medalImg: 'Medalla_1.png',
        keyType: 'winner_1'
      },
      {
        place: 2,
        title: 'Segundo Lugar Nacional',
        badgeClass: 'badge-campus',
        borderColor: '#64748B',
        medalIcon: '🥈',
        medalImg: 'Medalla_2.png',
        keyType: 'winner_2'
      },
      {
        place: 3,
        title: 'Tercer Lugar Nacional',
        badgeClass: 'badge-warning',
        borderColor: '#B45309',
        medalIcon: '🥉',
        medalImg: 'Medalla_3.png',
        keyType: 'winner_3'
      }
    ];

    container.innerHTML = top3.map((p, idx) => {
      const cfg = winnerConfigs[idx];
      const isSent = window.DataStore.isCertificateSent(p.id, cfg.keyType);
      const statusBadge = isSent
        ? '<span class="badge badge-confirmed">✓ Enviado a Ganadores</span>'
        : '<span class="badge badge-campus">⏳ Pendiente</span>';

      const members = (p.members || []).map(m => `${m.firstName} ${m.lastName}`).join(', ');
      const allMembers = `${p.captain.firstName} ${p.captain.lastName}` + (members ? ` · ${members}` : '');

      return `
        <div class="card" style="border-top: 6px solid ${cfg.borderColor}; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <span class="badge" style="background: rgba(0,0,0,0.06); font-weight: 800; font-size: 0.85rem;">
                ${cfg.medalIcon} ${cfg.title}
              </span>
              <img src="${cfg.medalImg}" alt="Medalla Oficial" style="height: 50px; width: 50px; object-fit: contain;" onerror="this.style.display='none'">
            </div>

            <h3 style="font-size: 1.35rem; font-weight: 900; color: var(--siemens-navy); margin-bottom: 0.2rem;">
              ${p.teamName}
            </h3>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              ${p.campus} • Folio: ${p.folio}
            </div>

            <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); margin: 0.75rem 0;">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">CALIFICACIÓN OFICIAL:</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--tec-green);">
                ${p.evaluation ? p.evaluation.finalScore.toFixed(2) : '100.00'} <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary);">/ 100</span>
              </div>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
              <strong>Capitán:</strong> ${p.captain.firstName} ${p.captain.lastName} (${p.captain.email})<br>
              <strong>Integrantes:</strong> ${allMembers}
            </div>

            <div style="margin-bottom: 1.25rem;">
              ${statusBadge}
            </div>
          </div>

          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="App.openCertificatePreview('${cfg.keyType}', '${p.id}')">
              👁️ Ver
            </button>
            <button class="btn btn-mendix btn-sm" style="flex: 1;" onclick="App.downloadCertificate('${cfg.keyType}', '${p.id}')">
              📥 Descargar
            </button>
            <button class="btn btn-tec btn-sm" style="flex: 1;" onclick="App.openEmailModal('${cfg.keyType}', '${p.id}')">
              📧 Enviar
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  getCertificateData(type, id) {
    this.loadData();
    const cert = {
      type,
      id,
      dateStr: '20 de noviembre de 2026',
      sign1Name: 'Shender María Avila Sansores',
      sign1Title: 'Coordinadora nacional de inteligencia artificial e innovación',
      sign2Name: 'Joaquín Amaro',
      sign2Title: 'Academic & Strategic Alliances Manager SIEMENS'
    };

    if (type === 'captain' || type.startsWith('winner_')) {
      const p = (this.data.participants || []).find(item => item.id === id);
      if (!p) return null;

      const membersList = (p.members || []).map(m => `${m.firstName} ${m.lastName}`);
      const allNames = [ `${p.captain.firstName} ${p.captain.lastName}`, ...membersList ];

      cert.recipientName = p.teamName;
      cert.recipientEmail = p.captain.email;
      cert.campusText = p.campus;
      cert.subDetails = allNames.slice(0, 4).join('  ·  ');
      cert.recipientPrefix = 'Se otorga al equipo:';

      if (type === 'captain') {
        cert.categoryText = 'PARTICIPACIÓN POR EQUIPO';
        cert.categoryColor = '#00B04F';
        cert.bodyText = 'Por su destacada participación en la primera edición del Mendix Agile Challenge Nacional, con una solución desarrollada en Siemens Mendix para la gestión de eventos corporativos mediante metodologías ágiles.';
        cert.medalImg = null;
      } else if (type === 'winner_1') {
        cert.categoryText = 'PRIMER LUGAR NACIONAL';
        cert.categoryColor = '#D97706';
        cert.bodyText = 'Por obtener el primer lugar en la primera edición del Mendix Agile Challenge Nacional, por la sobresaliente calidad de su proyecto y la impecable aplicación de metodologías ágiles con Siemens Mendix.';
        cert.medalImg = 'Medalla_1.png';
      } else if (type === 'winner_2') {
        cert.categoryText = 'SEGUNDO LUGAR NACIONAL';
        cert.categoryColor = '#64748B';
        cert.bodyText = 'Por obtener el segundo lugar en la primera edición del Mendix Agile Challenge Nacional, por la sobresaliente calidad de su proyecto y la impecable aplicación de metodologías ágiles con Siemens Mendix.';
        cert.medalImg = 'Medalla_2.png';
      } else if (type === 'winner_3') {
        cert.categoryText = 'TERCER LUGAR NACIONAL';
        cert.categoryColor = '#B45309';
        cert.bodyText = 'Por obtener el tercer lugar en la primera edición del Mendix Agile Challenge Nacional, por la sobresaliente calidad de su proyecto y la impecable aplicación de metodologías ágiles con Siemens Mendix.';
        cert.medalImg = 'Medalla_3.png';
      }
    } else if (type === 'judge') {
      const j = (this.data.judges || []).find(item => item.id === id);
      if (!j) return null;

      cert.recipientName = `${j.firstName} ${j.lastName}`;
      cert.recipientEmail = j.email;
      cert.campusText = j.campus;
      cert.subDetails = `Universidad Tecmilenio • ${j.campus} • Nómina: ${j.payroll}`;
      cert.recipientPrefix = 'Se otorga a:';
      cert.categoryText = 'PARTICIPACIÓN COMO JUEZ';
      cert.categoryColor = '#0070D2';
      cert.bodyText = 'Por su invaluable participación y compromiso como juez evaluador en la primera edición del Mendix Agile Challenge Nacional, aportando su rigor y experiencia profesional a la evaluación técnica de los proyectos participantes.';
      cert.medalImg = null;
    }

    return cert;
  },

  drawCertificate(canvas, certData) {
    return new Promise((resolve) => {
      const ctx = canvas.getContext('2d');
      const W = canvas.width;  // 2048
      const H = canvas.height; // 1365
      const centerX = W / 2;

      // 1. Cargar imágenes necesarias
      const loadImage = (src) => new Promise((res) => {
        if (!src) return res(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
      });

      // Usar assets embebidos (Base64) para evitar bloqueo CORS en file://
      const assets = (typeof CertAssets !== 'undefined') ? CertAssets : {};
      const medalSrc = certData.medalImg === 'Medalla_1.png' ? assets.MEDALLA_1
                     : certData.medalImg === 'Medalla_2.png' ? assets.MEDALLA_2
                     : certData.medalImg === 'Medalla_3.png' ? assets.MEDALLA_3
                     : certData.medalImg;

      Promise.all([
        loadImage(assets.LOGO_TEC    || 'Universidad_Tecmilenio.png'),
        loadImage(assets.LOGO_SIEMENS|| 'Siemens-Logo.wine.png'),
        loadImage(assets.LOGO_MENDIX || 'LogoMendixChallenge_1_Edition.png'),
        loadImage(medalSrc)
      ]).then(([logoTec, logoSiemens, logoMendix, medalImg]) => {
        // ── Fondo blanco limpio (igual que plantilla PPTX) ──
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, W, H);

        // Marco decorativo fino en verde TEC
        ctx.strokeStyle = '#00B04F';
        ctx.lineWidth = 10;
        ctx.strokeRect(22, 22, W - 44, H - 44);
        ctx.strokeStyle = '#0F524D';
        ctx.lineWidth = 3;
        ctx.strokeRect(36, 36, W - 72, H - 72);

        // ── Banda superior de fondo ──
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(36, 36, W - 72, 155);

        // ── LOGOS SUPERIORES ──
        // Logo Universidad Tecmilenio – izquierda
        if (logoTec) {
          ctx.drawImage(logoTec, 60, 48, 230, 90);
        } else {
          ctx.fillStyle = '#00B04F';
          ctx.font = 'bold 26px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('UNIVERSIDAD TECMILENIO', 70, 110);
        }

        // Logo Mendix Challenge – centro
        if (logoMendix) {
          ctx.drawImage(logoMendix, centerX - 155, 42, 310, 110);
        }

        // Logo Siemens – derecha
        if (logoSiemens) {
          ctx.drawImage(logoSiemens, W - 290, 55, 220, 80);
        } else {
          ctx.fillStyle = '#0B2545';
          ctx.font = 'bold 26px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('SIEMENS', W - 70, 110);
        }

        // Línea separadora debajo de logos
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, 200);
        ctx.lineTo(W - 60, 200);
        ctx.stroke();

        // ── MEDALLA (ganadores) – centrada en el área izquierda-central ──
        if (medalImg) {
          const medSize = 170;
          ctx.drawImage(medalImg, 90, 320, medSize, medSize);
        }

        // Textos del certificado
        ctx.textAlign = 'center';

        // Ajuste horizontal: si hay medalla, el texto se centra en el área derecha (medalla ocupa izquierda)
        const textCenterX = medalImg ? (90 + 170 + (W - (90 + 170)) / 2 + 90 + 170) / 2 + 60 : centerX;
        // Simplificado: siempre centrado en el canvas; medalla queda a la izquierda sin invadir
        const txCX = centerX;

        // 1. "PRIMERA EDICIÓN"
        ctx.fillStyle = '#5B6577';
        ctx.font = 'bold 26px "Liberation Sans", sans-serif';
        ctx.fillText('PRIMERA EDICIÓN  •  MENDIX AGILE CHALLENGE', txCX, 240);

        // 2. "RECONOCIMIENTO"
        ctx.fillStyle = '#0F524D';
        ctx.font = '900 72px "Georgia", "Times New Roman", serif';
        ctx.fillText('RECONOCIMIENTO', txCX, 325);

        // Línea decorativa bajo título
        ctx.strokeStyle = certData.categoryColor || '#00B04F';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(txCX - 300, 345);
        ctx.lineTo(txCX + 300, 345);
        ctx.stroke();

        // 3. Categoría
        ctx.fillStyle = certData.categoryColor || '#317521';
        ctx.font = 'bold 34px "Liberation Sans", sans-serif';
        ctx.fillText(certData.categoryText, txCX, 400);

        // 4. "Se otorga al equipo:" o "Se otorga a:"
        ctx.fillStyle = '#28354D';
        ctx.font = '500 28px "Liberation Sans", sans-serif';
        ctx.fillText(certData.recipientPrefix, txCX, 475);

        // 5. Nombre del galardonado
        ctx.fillStyle = '#0F524D';
        ctx.font = '900 56px "Liberation Sans", sans-serif';
        // Ajustar tamaño si el nombre es muy largo
        const nameMetrics = ctx.measureText(certData.recipientName);
        if (nameMetrics.width > W - 200) {
          ctx.font = '900 40px "Liberation Sans", sans-serif';
        }
        ctx.fillText(certData.recipientName, txCX, 548);

        // 6. Subdetalles (Integrantes o Cargo)
        if (certData.subDetails) {
          ctx.fillStyle = '#28354D';
          ctx.font = '600 23px "Liberation Sans", sans-serif';
          // Wrap si es muy largo
          const sdWords = certData.subDetails.split('  ·  ');
          if (sdWords.length > 2) {
            const half1 = sdWords.slice(0, Math.ceil(sdWords.length/2)).join('  ·  ');
            const half2 = sdWords.slice(Math.ceil(sdWords.length/2)).join('  ·  ');
            ctx.fillText(half1, txCX, 608);
            ctx.fillText(half2, txCX, 643);
          } else {
            ctx.fillText(certData.subDetails, txCX, 615);
          }
        }

        // 7. Párrafo de justificación (con word-wrap)
        ctx.fillStyle = '#5B6577';
        ctx.font = '24px "Liberation Sans", sans-serif';
        const words = certData.bodyText.split(' ');
        let line = '';
        let lineY = 710;
        const maxTextWidth = 1500;
        const lineHeight = 40;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && n > 0) {
            ctx.fillText(line.trim(), txCX, lineY);
            line = words[n] + ' ';
            lineY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), txCX, lineY);

        // 8. Campus & Fecha
        ctx.fillStyle = '#5B6577';
        ctx.font = 'bold 22px "Liberation Sans", sans-serif';
        ctx.fillText(`${certData.campusText}  •  Modalidad en línea,  ${certData.dateStr}`, txCX, lineY + 72);

        // 9. Firmas Institucionales
        const signY = 1155;

        // Firma Izquierda: Shender María Avila Sansores
        const signLeftX = 500;
        ctx.strokeStyle = '#5B6577';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(signLeftX - 230, signY);
        ctx.lineTo(signLeftX + 230, signY);
        ctx.stroke();

        ctx.fillStyle = '#0F524D';
        ctx.font = 'bold 24px "Liberation Sans", sans-serif';
        ctx.fillText(certData.sign1Name, signLeftX, signY + 38);

        ctx.fillStyle = '#5B6577';
        ctx.font = '20px "Liberation Sans", sans-serif';
        ctx.fillText(certData.sign1Title, signLeftX, signY + 68);

        // Firma Derecha: Joaquín Amaro
        const signRightX = W - 500;
        ctx.beginPath();
        ctx.moveTo(signRightX - 230, signY);
        ctx.lineTo(signRightX + 230, signY);
        ctx.stroke();

        ctx.fillStyle = '#0F524D';
        ctx.font = 'bold 24px "Liberation Sans", sans-serif';
        ctx.fillText(certData.sign2Name, signRightX, signY + 38);

        ctx.fillStyle = '#5B6577';
        ctx.font = '20px "Liberation Sans", sans-serif';
        // Cargo en dos líneas si es muy largo
        ctx.fillText('Academic & Strategic Alliances Manager', signRightX, signY + 68);
        ctx.fillText('SIEMENS', signRightX, signY + 92);

        resolve();
      });
    });
  },

  openCertificatePreview(type, targetId) {
    const certData = this.getCertificateData(type, targetId);
    if (!certData) return;

    this.activeCertData = certData;
    const canvas = document.getElementById('cert-canvas');
    const modal = document.getElementById('modal-certificate-preview');
    const titleEl = document.getElementById('cert-preview-title');
    const recipEl = document.getElementById('cert-preview-recipient-info');

    titleEl.textContent = `Reconocimiento Oficial: ${certData.categoryText}`;
    recipEl.innerHTML = `<strong>Otorgado a:</strong> ${certData.recipientName} (${certData.campusText}) &bull; Correo: <span style="color: var(--mendix-blue);">${certData.recipientEmail}</span>`;

    modal.classList.add('active');
    this.drawCertificate(canvas, certData);
  },

  closeCertificatePreview() {
    const modal = document.getElementById('modal-certificate-preview');
    if (modal) modal.classList.remove('active');
  },

  downloadCertificatePNG() {
    if (!this.activeCertData) return;
    const canvas = document.getElementById('cert-canvas');
    const dataUrl = canvas.toDataURL('image/png');
    const cleanName = this.activeCertData.recipientName.replace(/\s+/g, '_');
    const filename = `Reconocimiento_Mendix_${cleanName}.png`;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
    this.showToast(`Reconocimiento descargado con éxito: ${filename}`, 'success');
  },

  downloadCertificate(type, targetId) {
    const certData = this.getCertificateData(type, targetId);
    if (!certData) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 2048;
    tempCanvas.height = 1365;

    this.drawCertificate(tempCanvas, certData).then(() => {
      const dataUrl = tempCanvas.toDataURL('image/png');
      const cleanName = certData.recipientName.replace(/\s+/g, '_');
      const filename = `Reconocimiento_Mendix_${cleanName}.png`;

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.click();
      this.showToast(`Descarga completada: ${filename}`, 'success');
    });
  },

  printCertificateFromModal() {
    const canvas = document.getElementById('cert-canvas');
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.showToast('Permite las ventanas emergentes para imprimir el reconocimiento.', 'warning');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Reconocimiento Oficial</title>
        <style>
          @page { size: landscape; margin: 0; }
          body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #fff; }
          img { width: 100vw; height: auto; max-height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();" />
      </body>
      </html>
    `);
    printWindow.document.close();
  },

  sendCurrentCertificateEmail() {
    if (!this.activeCertData) return;
    this.closeCertificatePreview();
    this.openEmailModal(this.activeCertData.type, this.activeCertData.id);
  },

  openEmailModal(type, targetId) {
    const certData = this.getCertificateData(type, targetId);
    if (!certData) return;

    this.pendingEmailInfo = {
      type,
      targetId,
      email: certData.recipientEmail,
      name: certData.recipientName,
      certData
    };

    const modal = document.getElementById('modal-email-sender');
    const toEl = document.getElementById('email-sender-to');
    const subjEl = document.getElementById('email-sender-subject');
    const attachEl = document.getElementById('email-sender-attachment');
    const bodyEl = document.getElementById('email-sender-body');
    const progressEl = document.getElementById('email-send-progress-container');
    const btnSend = document.getElementById('btn-confirm-send-email');

    progressEl.style.display = 'none';
    btnSend.disabled = false;
    btnSend.textContent = '🚀 Confirmar y Enviar Correo';

    toEl.textContent = `${certData.recipientName} <${certData.recipientEmail}>`;
    subjEl.textContent = `🎓 Reconocimiento Oficial: ${certData.categoryText} • Mendix Agile Challenge 2026`;
    attachEl.textContent = `Reconocimiento_${certData.recipientName.replace(/\s+/g, '_')}.png`;

    bodyEl.value = `Estimado(a) ${certData.recipientName},

A nombre de Universidad Tecmilenio y Siemens Mendix, te hacemos llegar adjunto a este correo tu Reconocimiento Oficial por tu destacada participación en la primera edición del Mendix Agile Challenge Nacional 2026 en la categoría: ${certData.categoryText}.

Felicitamos tu esfuerzo, dedicación y compromiso con la excelencia tecnológica y las metodologías ágiles.

Atentamente,
Comité Organizador del Mendix Agile Challenge 2026
Universidad Tecmilenio & Siemens Mendix`;

    modal.classList.add('active');
  },

  closeEmailSenderModal() {
    const modal = document.getElementById('modal-email-sender');
    if (modal) modal.classList.remove('active');
  },

  executeEmailSend() {
    if (!this.pendingEmailInfo) return;
    const { type, targetId, email, name } = this.pendingEmailInfo;

    const progressEl = document.getElementById('email-send-progress-container');
    const progressBar = document.getElementById('email-progress-bar');
    const progressStatus = document.getElementById('email-progress-status');
    const btnSend = document.getElementById('btn-confirm-send-email');

    btnSend.disabled = true;
    progressEl.style.display = 'block';
    progressBar.style.width = '30%';
    progressStatus.textContent = `Conectando con el servidor de correo institucional para ${email}...`;

    setTimeout(() => {
      progressBar.style.width = '75%';
      progressStatus.textContent = `Adjuntando reconocimiento oficial en alta resolución...`;

      setTimeout(() => {
        progressBar.style.width = '100%';
        progressStatus.textContent = `¡Correo enviado satisfactoriamente!`;

        window.DataStore.markCertificateSent(targetId, type, email);
        this.renderCertificatesTab();

        setTimeout(() => {
          this.closeEmailSenderModal();
          this.showToast(`Reconocimiento enviado exitosamente al correo: ${email}`, 'success');
        }, 500);
      }, 500);
    }, 400);
  },

  sendBatchCertificates(category) {
    this.loadData();
    let recipients = [];

    if (category === 'captains') {
      recipients = (this.data.participants || []).map(p => ({
        id: p.id,
        type: 'captain',
        name: p.teamName,
        email: p.captain.email
      }));
    } else if (category === 'judges') {
      recipients = (this.data.judges || []).map(j => ({
        id: j.id,
        type: 'judge',
        name: `${j.firstName} ${j.lastName}`,
        email: j.email
      }));
    } else if (category === 'winners') {
      const top3 = window.DataStore.getOfficialRanking().slice(0, 3);
      recipients = top3.map((p, idx) => ({
        id: p.id,
        type: `winner_${idx + 1}`,
        name: p.teamName,
        email: p.captain.email
      }));
    }

    if (recipients.length === 0) {
      this.showToast('No hay destinatarios disponibles en esta categoría para enviar reconocimientos.', 'warning');
      return;
    }

    const confirmMsg = `¿Deseas enviar por correo los reconocimientos oficiales a todos los ${recipients.length} destinatarios de esta categoría?`;
    if (!confirm(confirmMsg)) return;

    let sentCount = 0;
    recipients.forEach(r => {
      window.DataStore.markCertificateSent(r.id, r.type, r.email);
      sentCount++;
    });

    this.renderCertificatesTab();
    this.showToast(`¡Se han enviado con éxito ${sentCount} reconocimientos oficiales por correo electrónico!`, 'success');
  },

  // -------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  showToast(msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '🛑';

    toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

window.App = App;
