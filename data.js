/**
 * Mendix Agile Challenge - Universidad Tecmilenio & Siemens
 * Capa de Datos, Autenticación, Asignación Equitativa y Persistencia
 */

const STORAGE_KEY = 'MENDIX_TECMILENIO_DATA_V2';
const DRAFT_PARTICIPANT_KEY = 'MAC_DRAFT_PARTICIPANT';
const DRAFT_JUDGE_KEY = 'MAC_DRAFT_JUDGE';
const SESSION_KEY = 'MAC_ACTIVE_SESSION';

// Catálogo oficial de Campus Tecmilenio (27 Campus Nacionales)
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

// Datos iniciales de demostración
const INITIAL_DATA = {
  challenge: {
    name: 'Mendix Agile Challenge',
    institution: 'Universidad Tecmilenio',
    partner: 'Siemens Mendix',
    caseStudy: 'Gestión de Eventos Corporativos (GCS)',
    edition: 'Concurso Nacional 2026',
    status: 'Fase de Evaluación',
    deadline: '2026-11-20'
  },
  admin: {
    email: 'admin@tecmilenio.mx',
    password: 'adminTEC',
    name: 'Coordinación Nacional Tecmilenio'
  },
  judges: [
    {
      id: 'judge-1',
      firstName: 'Dr. Roberto',
      lastName: 'García Treviño',
      payroll: 'L00845120',
      campus: 'Campus Las Torres',
      email: 'roberto.garcia@tecmilenio.mx',
      password: 'juezTEC2026',
      assignedParticipants: ['part-2', 'part-4'],
      confirmed: false
    },
    {
      id: 'judge-2',
      firstName: 'Mtra. Laura',
      lastName: 'Sánchez Morales',
      payroll: 'L00912450',
      campus: 'Campus Ferrería',
      email: 'laura.sanchez@tecmilenio.mx',
      password: 'juezTEC2026',
      assignedParticipants: ['part-1', 'part-5'],
      confirmed: false
    },
    {
      id: 'judge-3',
      firstName: 'Ing. Carlos',
      lastName: 'Navarro Ruiz',
      payroll: 'L00734890',
      campus: 'Campus Guadalajara',
      email: 'carlos.navarro@tecmilenio.mx',
      password: 'juezTEC2026',
      assignedParticipants: ['part-3', 'part-6'],
      confirmed: false
    }
  ],
  participants: [
    {
      id: 'part-1',
      folio: 'TEC-MAC-2026-7821',
      teamName: 'Innovatech GCS',
      campus: 'Campus Las Torres',
      professor: {
        firstName: 'Ing. Fernando',
        lastName: 'Alonso Garza'
      },
      captain: {
        firstName: 'Ana Sofía',
        lastName: 'Garza Morales',
        studentId: 'AL02984120',
        email: 'ana.garza@tecmilenio.mx'
      },
      members: [
        { firstName: 'Mateo', lastName: 'Rincón Salazar', studentId: 'AL02984121', email: 'mateo.rincon@tecmilenio.mx' },
        { firstName: 'Valeria', lastName: 'Cruz Peña', studentId: 'AL02984122', email: 'valeria.cruz@tecmilenio.mx' },
        { firstName: 'Daniel', lastName: 'Ortiz Luna', studentId: 'AL02984123', email: 'daniel.ortiz@tecmilenio.mx' }
      ],
      professorApprovalFile: 'Plantilla_AvalDocente.pdf',
      professorApprovalFileName: 'Aval_Docente_ProfAlonso.pdf',
      projectDocFile: 'Manual_Etapa_Docente_Mendix_Agile_Challenge.pdf',
      projectDocFileName: 'Proyecto_Innovatech_GCS_Mendix.pdf',
      videoUrl: 'https://youtu.be/demo-innovatech-gcs-3min',
      assignedJudgeId: 'judge-2',
      registeredAt: '2026-11-05T14:30:00Z',
      evaluation: {
        evaluatedBy: 'judge-2',
        evaluatedAt: '2026-11-12T10:00:00Z',
        isLocked: true,
        isDraft: false,
        indicators: {
          A1: 5, A2: 5, A3: 5, A4: 5, A5: 5, A6: 5, A7: 5, A8: 5, // A = 40
          B1: 5, B2: 5, B3: 5,                                     // B = 15
          C1: 5, C2: 5, C3: 5,                                     // C = 15
          D1: 5, D2: 5, D3: 5,                                     // D = 15
          E1: 5, E2: 5, E3: 0                                      // E = 10
        },
        subtotalA: 40,
        subtotalB: 15,
        subtotalC: 15,
        subtotalD: 15,
        subtotalE: 10,
        R: 95,            // R = 40+15+15+15+10 = 95
        contributionR: 85.5, // 95 * 0.90 = 85.5
        G: 9.2,           // Valoración global propia del juez
        finalScore: 94.70, // 85.5 + 9.2 = 94.70
        justificationG: 'Solución sólida, integrada y convincente para la gestión de eventos corporativos. La interacción entre asistentes y tareas de eventos es fluida con excelente modelo de datos en Mendix.'
      }
    },
    {
      id: 'part-2',
      folio: 'TEC-MAC-2026-4419',
      teamName: 'AgileFlow Monterrey',
      campus: 'Campus Cumbres',
      professor: {
        firstName: 'Dra. Elena',
        lastName: 'Silva Ramos'
      },
      captain: {
        firstName: 'Rodrigo',
        lastName: 'Morales Cano',
        studentId: 'AL02871145',
        email: 'rodrigo.morales@tecmilenio.mx'
      },
      members: [
        { firstName: 'Camila', lastName: 'Pardo Benítez', studentId: 'AL02871146', email: 'camila.pardo@tecmilenio.mx' },
        { firstName: 'Samuel', lastName: 'León Castillo', studentId: 'AL02871147', email: 'samuel.leon@tecmilenio.mx' }
      ],
      professorApprovalFile: 'Plantilla_AvalDocente.pdf',
      professorApprovalFileName: 'Aval_DraSilva_AgileFlow.pdf',
      projectDocFile: 'Manual_Etapa_Docente_Mendix_Agile_Challenge.pdf',
      projectDocFileName: 'Doc_AgileFlow_GCS_Mendix.pdf',
      videoUrl: 'https://youtu.be/agileflow-eventos-mendix',
      assignedJudgeId: 'judge-1',
      registeredAt: '2026-11-06T11:20:00Z',
      evaluation: {
        evaluatedBy: 'judge-1',
        evaluatedAt: '2026-11-12T11:15:00Z',
        isLocked: true,
        isDraft: false,
        indicators: {
          A1: 5, A2: 5, A3: 5, A4: 5, A5: 5, A6: 5, A7: 5, A8: 5, // A = 40
          B1: 5, B2: 5, B3: 5,                                     // B = 15
          C1: 5, C2: 5, C3: 5,                                     // C = 15
          D1: 5, D2: 5, D3: 5,                                     // D = 15
          E1: 5, E2: 5, E3: 5                                      // E = 15
        },
        subtotalA: 40,
        subtotalB: 15,
        subtotalC: 15,
        subtotalD: 15,
        subtotalE: 15,
        R: 100,
        contributionR: 90.0,
        G: 9.6,
        finalScore: 99.60,
        justificationG: 'Solución excepcional. Acredita la totalidad de los 20 indicadores observables con evidencia irrefutable en video y documento técnico. Gran madurez en el uso de microflujos de persistencia.'
      }
    },
    {
      id: 'part-3',
      folio: 'TEC-MAC-2026-9052',
      teamName: 'CDMX Nexus Eventos',
      campus: 'Campus Ferrería',
      professor: {
        firstName: 'Mtro. Javier',
        lastName: 'Navarro Soto'
      },
      captain: {
        firstName: 'Lucía',
        lastName: 'Fernández Ríos',
        studentId: 'AL03104590',
        email: 'lucia.fernandez@tecmilenio.mx'
      },
      members: [
        { firstName: 'Esteban', lastName: 'Domínguez Soto', studentId: 'AL03104591', email: 'esteban.dominguez@tecmilenio.mx' },
        { firstName: 'Mariana', lastName: 'Reyes Vega', studentId: 'AL03104592', email: 'mariana.reyes@tecmilenio.mx' }
      ],
      professorApprovalFile: 'Plantilla_AvalDocente.pdf',
      professorApprovalFileName: 'Aval_MtroNavarro_Ferreria.pdf',
      projectDocFile: 'Manual_Etapa_Docente_Mendix_Agile_Challenge.pdf',
      projectDocFileName: 'Proyecto_CDMXNexus_GCS.pdf',
      videoUrl: 'https://youtu.be/cdmx-nexus-gcs-mendix',
      assignedJudgeId: 'judge-3',
      registeredAt: '2026-11-07T09:10:00Z',
      evaluation: {
        evaluatedBy: 'judge-3',
        evaluatedAt: '2026-11-12T12:00:00Z',
        isLocked: true,
        isDraft: false,
        indicators: {
          A1: 5, A2: 5, A3: 5, A4: 5, A5: 5, A6: 5, A7: 5, A8: 5, // A = 40
          B1: 5, B2: 5, B3: 5,                                     // B = 15
          C1: 5, C2: 5, C3: 0,                                     // C = 10
          D1: 5, D2: 5, D3: 5,                                     // D = 15
          E1: 5, E2: 5, E3: 5                                      // E = 15
        },
        subtotalA: 40,
        subtotalB: 15,
        subtotalC: 10,
        subtotalD: 15,
        subtotalE: 15,
        R: 95,
        contributionR: 85.5,
        G: 8.8,
        finalScore: 94.30,
        justificationG: 'Solución muy completa y funcional. Presenta limitaciones menores en la documentación formal de la prueba de persistencia en documento, pero la demo en video es de gran calidad.'
      }
    },
    {
      id: 'part-4',
      folio: 'TEC-MAC-2026-1188',
      teamName: 'Puebla Event Agile',
      campus: 'Campus Puebla',
      professor: {
        firstName: 'Lic. Claudia',
        lastName: 'Méndez Flores'
      },
      captain: {
        firstName: 'Jorge',
        lastName: 'Benítez Lara',
        studentId: 'AL02558912',
        email: 'jorge.benitez@tecmilenio.mx'
      },
      members: [
        { firstName: 'David', lastName: 'Sánchez Ruiz', studentId: 'AL02558913', email: 'david.sanchez@tecmilenio.mx' },
        { firstName: 'Lorena', lastName: 'Meza Toledo', studentId: 'AL02558914', email: 'lorena.meza@tecmilenio.mx' }
      ],
      professorApprovalFile: 'Plantilla_AvalDocente.pdf',
      professorApprovalFileName: 'Aval_Puebla_ProfMendez.pdf',
      projectDocFile: 'Manual_Etapa_Docente_Mendix_Agile_Challenge.pdf',
      projectDocFileName: 'Puebla_EventAgile_GCS.pdf',
      videoUrl: 'https://youtu.be/puebla-event-agile-demo',
      assignedJudgeId: 'judge-1',
      registeredAt: '2026-11-08T16:45:00Z',
      evaluation: null // Pendiente
    },
    {
      id: 'part-5',
      folio: 'TEC-MAC-2026-6320',
      teamName: 'Occidente Mendix Crew',
      campus: 'Campus Guadalajara',
      professor: {
        firstName: 'Ing. Héctor',
        lastName: 'Valenzuela Gómez'
      },
      captain: {
        firstName: 'Fabiola',
        lastName: 'Ríos Cárdenas',
        studentId: 'AL03019822',
        email: 'fabiola.rios@tecmilenio.mx'
      },
      members: [
        { firstName: 'Héctor', lastName: 'Carranza Lozano', studentId: 'AL03019823', email: 'hector.carranza@tecmilenio.mx' }
      ],
      professorApprovalFile: 'Plantilla_AvalDocente.pdf',
      professorApprovalFileName: 'Aval_Valenzuela_Gdl.pdf',
      projectDocFile: 'Manual_Etapa_Docente_Mendix_Agile_Challenge.pdf',
      projectDocFileName: 'Occidente_Mendix_GCS.pdf',
      videoUrl: 'https://youtu.be/occidente-gcs-video',
      assignedJudgeId: 'judge-2',
      registeredAt: '2026-11-09T10:15:00Z',
      evaluation: null // Pendiente
    },
    {
      id: 'part-6',
      folio: 'TEC-MAC-2026-8874',
      teamName: 'Toluca Sprint Builders',
      campus: 'Campus Toluca',
      professor: {
        firstName: 'Mtra. Silvia',
        lastName: 'Arriaga Peña'
      },
      captain: {
        firstName: 'Óscar',
        lastName: 'Valenzuela Mora',
        studentId: 'AL02941566',
        email: 'oscar.valenzuela@tecmilenio.mx'
      },
      members: [
        { firstName: 'Andrea', lastName: 'Cuevas Solís', studentId: 'AL02941567', email: 'andrea.cuevas@tecmilenio.mx' }
      ],
      professorApprovalFile: 'Plantilla_AvalDocente.pdf',
      professorApprovalFileName: 'Aval_Toluca_Arriaga.pdf',
      projectDocFile: 'Manual_Etapa_Docente_Mendix_Agile_Challenge.pdf',
      projectDocFileName: 'Toluca_Sprint_GCS.pdf',
      videoUrl: 'https://youtu.be/toluca-mendix-gcs',
      assignedJudgeId: 'judge-3',
      registeredAt: '2026-11-10T12:00:00Z',
      evaluation: null // Pendiente
    }
  ],
  rankingGenerated: false,
  publishedRankingTop10: null,
  rankingPubliclyVisible: false,
  sentCertificates: {}
};

// ==============================================================
// GESTOR DE DATOS Y LÓGICA DE NEGOCIO (DataStore)
// ==============================================================
const DataStore = {
  get() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.rankingPubliclyVisible === undefined) parsed.rankingPubliclyVisible = false;
        if (!parsed.sentCertificates) parsed.sentCertificates = {};
        // Sanitizar nombres de campus heredados
        if (parsed.judges) {
          parsed.judges.forEach(j => {
            if (j.campus) j.campus = j.campus.replace(' (Monterrey)', '').replace(' (CDMX)', '');
          });
        }
        if (parsed.participants) {
          parsed.participants.forEach(p => {
            if (p.campus) p.campus = p.campus.replace(' (Monterrey)', '').replace(' (CDMX)', '');
          });
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error al leer de localStorage, usando iniciales:', e);
    }
    this.save(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
      return false;
    }
  },

  reset() {
    this.save(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  },

  // Sesión Activa
  getSession() {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  },

  setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  // Autenticación
  login(email, password) {
    const data = this.get();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Verificar Administrador
    if (cleanEmail === data.admin.email.toLowerCase() && cleanPass === data.admin.password) {
      const session = {
        role: 'admin',
        email: data.admin.email,
        name: data.admin.name
      };
      this.setSession(session);
      return { success: true, session };
    }

    // 2. Verificar Juez
    const judge = data.judges.find(j => j.email.toLowerCase() === cleanEmail && j.password === cleanPass);
    if (judge) {
      const session = {
        role: 'judge',
        judgeId: judge.id,
        email: judge.email,
        name: `${judge.firstName} ${judge.lastName}`,
        campus: judge.campus,
        payroll: judge.payroll
      };
      this.setSession(session);
      return { success: true, session };
    }

    return { success: false, message: 'Usuario o contraseña incorrectos. Verifica tus credenciales.' };
  },

  // Registro de Jueces
  registerJudge(judgeData) {
    const data = this.get();
    const cleanPayroll = judgeData.payroll.trim().toUpperCase();
    const cleanEmail = judgeData.email.trim().toLowerCase();

    // Regla: Nómina y correo únicos
    const duplicatePayroll = data.judges.find(j => j.payroll.toUpperCase() === cleanPayroll);
    if (duplicatePayroll) {
      return { success: false, message: `La nómina ${cleanPayroll} ya está registrada para otro juez.` };
    }

    const duplicateEmail = data.judges.find(j => j.email.toLowerCase() === cleanEmail) || (data.admin.email.toLowerCase() === cleanEmail);
    if (duplicateEmail) {
      return { success: false, message: `El correo institucional ${cleanEmail} ya está en uso.` };
    }

    const newJudge = {
      id: 'judge-' + Date.now(),
      firstName: judgeData.firstName.trim(),
      lastName: judgeData.lastName.trim(),
      payroll: cleanPayroll,
      campus: judgeData.campus,
      email: cleanEmail,
      password: judgeData.password.trim(),
      assignedParticipants: [],
      confirmed: false
    };

    data.judges.push(newJudge);
    this.save(data);
    this.clearDraftJudge();

    return { success: true, judge: newJudge };
  },

  // Registro de Participantes con guardado de archivos
  registerParticipant(partData) {
    const data = this.get();

    // Recolectar matrículas del equipo para validar unicidad
    const newStudentIds = [partData.captain.studentId.trim().toUpperCase()];
    if (partData.members && Array.isArray(partData.members)) {
      partData.members.forEach(m => {
        if (m.studentId && m.studentId.trim()) {
          newStudentIds.push(m.studentId.trim().toUpperCase());
        }
      });
    }

    // Validar duplicados internos en el mismo formulario
    const uniqueIdsSet = new Set(newStudentIds);
    if (uniqueIdsSet.size !== newStudentIds.length) {
      return { success: false, message: 'Existen matrículas repetidas dentro del mismo equipo.' };
    }

    // Validar unicidad contra toda la base de datos existente
    for (const existing of data.participants) {
      const existingIds = [existing.captain.studentId.toUpperCase()];
      if (existing.members) {
        existing.members.forEach(m => existingIds.push(m.studentId.toUpperCase()));
      }
      for (const id of newStudentIds) {
        if (existingIds.includes(id)) {
          return {
            success: false,
            message: `La matrícula ${id} ya está registrada en el equipo "${existing.teamName}". Las matrículas de los alumnos son únicas.`
          };
        }
      }
    }

    // Generar código único de participante (Folio)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const folio = `TEC-MAC-2026-${randomSuffix}`;

    const newParticipant = {
      id: 'part-' + Date.now(),
      folio: folio,
      teamName: partData.teamName.trim(),
      campus: partData.campus,
      professor: {
        firstName: partData.professor.firstName.trim(),
        lastName: partData.professor.lastName.trim()
      },
      captain: {
        firstName: partData.captain.firstName.trim(),
        lastName: partData.captain.lastName.trim(),
        studentId: partData.captain.studentId.trim().toUpperCase(),
        email: partData.captain.email.trim().toLowerCase()
      },
      members: (partData.members || []).map(m => ({
        firstName: m.firstName.trim(),
        lastName: m.lastName.trim(),
        studentId: m.studentId.trim().toUpperCase(),
        email: m.email.trim().toLowerCase()
      })),
      professorApprovalFile: partData.professorApprovalFile || 'Plantilla_AvalDocente.pdf',
      professorApprovalFileName: partData.professorApprovalFileName || 'Aval_Docente.pdf',
      professorApprovalFileDataUrl: partData.professorApprovalFileDataUrl || null,
      projectDocFile: partData.projectDocFile || 'Manual_Etapa_Docente_Mendix_Agile_Challenge.pdf',
      projectDocFileName: partData.projectDocFileName || 'Documento_Proyecto.pdf',
      projectDocFileDataUrl: partData.projectDocFileDataUrl || null,
      videoUrl: partData.videoUrl.trim(),
      assignedJudgeId: null,
      registeredAt: new Date().toISOString(),
      evaluation: null
    };

    data.participants.push(newParticipant);
    this.save(data);
    this.clearDraftParticipant();

    return { success: true, participant: newParticipant };
  },

  // Eliminar Participante o Juez (Solo Admin)
  deleteParticipant(id) {
    const data = this.get();
    data.participants = data.participants.filter(p => p.id !== id);
    data.judges.forEach(j => {
      j.assignedParticipants = (j.assignedParticipants || []).filter(pid => pid !== id);
    });
    // Si estaba en el ranking publicado, actualizar
    if (data.publishedRankingTop10) {
      data.publishedRankingTop10 = data.publishedRankingTop10.filter(p => p.id !== id);
    }
    this.save(data);
    return true;
  },

  deleteJudge(id) {
    const data = this.get();
    data.judges = data.judges.filter(j => j.id !== id);
    data.participants.forEach(p => {
      if (p.assignedJudgeId === id) p.assignedJudgeId = null;
    });
    this.save(data);
    return true;
  },

  // ============================================================
  // ASIGNACIÓN AUTOMÁTICA EQUITATIVA SIN CONFLICTO DE CAMPUS
  // ============================================================
  runAutoAssignment() {
    const data = this.get();
    const judges = data.judges;
    const participants = data.participants;

    if (!judges || judges.length === 0) {
      return { success: false, message: 'No hay jueces registrados en el sistema.' };
    }
    if (!participants || participants.length === 0) {
      return { success: false, message: 'No hay participantes registrados para asignar.' };
    }

    const judgeAssignmentMap = {};
    judges.forEach(j => {
      judgeAssignmentMap[j.id] = [];
    });

    const campusFrequencies = {};
    participants.forEach(p => {
      campusFrequencies[p.campus] = (campusFrequencies[p.campus] || 0) + 1;
    });

    const sortedParticipants = [...participants].sort((a, b) => {
      return (campusFrequencies[b.campus] || 0) - (campusFrequencies[a.campus] || 0);
    });

    const unassigned = [];

    for (const p of sortedParticipants) {
      const eligibleJudges = judges.filter(j => j.campus !== p.campus);

      if (eligibleJudges.length === 0) {
        unassigned.push(p);
        continue;
      }

      eligibleJudges.sort((j1, j2) => {
        return judgeAssignmentMap[j1.id].length - judgeAssignmentMap[j2.id].length;
      });

      const selectedJudge = eligibleJudges[0];
      judgeAssignmentMap[selectedJudge.id].push(p.id);
      p.assignedJudgeId = selectedJudge.id;
    }

    judges.forEach(j => {
      j.assignedParticipants = judgeAssignmentMap[j.id];
      j.confirmed = false;
    });

    this.save(data);

    if (unassigned.length > 0) {
      return {
        success: true,
        warning: true,
        message: `Asignación completada con ${unassigned.length} proyectos sin asignar debido a conflicto de campus con los jueces disponibles.`,
        assignedCount: participants.length - unassigned.length
      };
    }

    return {
      success: true,
      message: `¡Asignación equitativa completada con éxito! Se distribuyeron ${participants.length} participantes entre ${judges.length} jueces respetando la restricción de campus.`
    };
  },

  setManualAssignment(participantId, judgeId) {
    const data = this.get();
    const p = data.participants.find(part => part.id === participantId);
    if (!p) return { success: false, message: 'Participante no encontrado' };

    if (judgeId) {
      const j = data.judges.find(jue => jue.id === judgeId);
      if (!j) return { success: false, message: 'Juez no encontrado' };

      if (j.campus === p.campus) {
        return {
          success: false,
          message: `Conflicto de Campus: El juez ${j.firstName} ${j.lastName} pertenece a ${j.campus}, igual que el equipo.`
        };
      }

      if (p.assignedJudgeId && p.assignedJudgeId !== judgeId) {
        const oldJ = data.judges.find(jue => jue.id === p.assignedJudgeId);
        if (oldJ) {
          oldJ.assignedParticipants = (oldJ.assignedParticipants || []).filter(pid => pid !== p.id);
        }
      }

      p.assignedJudgeId = judgeId;
      if (!j.assignedParticipants.includes(p.id)) {
        j.assignedParticipants.push(p.id);
      }
    } else {
      if (p.assignedJudgeId) {
        const oldJ = data.judges.find(jue => jue.id === p.assignedJudgeId);
        if (oldJ) {
          oldJ.assignedParticipants = (oldJ.assignedParticipants || []).filter(pid => pid !== p.id);
        }
      }
      p.assignedJudgeId = null;
    }

    this.save(data);
    return { success: true };
  },

  // ============================================================
  // EVALUACIÓN DE PROYECTO (RÚBRICA CON CAMPOS LIBRES Y DECIMALES)
  // ============================================================
  saveEvaluation(participantId, evalInput, isLocked = false) {
    const data = this.get();
    const p = data.participants.find(part => part.id === participantId);
    if (!p) return { success: false, message: 'Participante no encontrado' };

    // Si ya estaba bloqueado, no permitir modificaciones
    if (p.evaluation && p.evaluation.isLocked && !evalInput.forceUnlock) {
      return { success: false, message: 'Este proyecto ya se encuentra confirmado y bloqueado para edición.' };
    }

    const ind = evalInput.indicators || {};
    
    // Subtotales con decimales
    const subA = parseFloat(((ind.A1||0) + (ind.A2||0) + (ind.A3||0) + (ind.A4||0) + (ind.A5||0) + (ind.A6||0) + (ind.A7||0) + (ind.A8||0)).toFixed(2));
    const subB = parseFloat(((ind.B1||0) + (ind.B2||0) + (ind.B3||0)).toFixed(2));
    const subC = parseFloat(((ind.C1||0) + (ind.C2||0) + (ind.C3||0)).toFixed(2));
    const subD = parseFloat(((ind.D1||0) + (ind.D2||0) + (ind.D3||0)).toFixed(2));
    const subE = parseFloat(((ind.E1||0) + (ind.E2||0) + (ind.E3||0)).toFixed(2));

    // Validar límites máximos por sección
    if (subA > 40) return { success: false, message: `La Sección A excede el máximo permitido de 40 puntos (Suma actual: ${subA}).` };
    if (subB > 15) return { success: false, message: `La Sección B excede el máximo permitido de 15 puntos (Suma actual: ${subB}).` };
    if (subC > 15) return { success: false, message: `La Sección C excede el máximo permitido de 15 puntos (Suma actual: ${subC}).` };
    if (subD > 15) return { success: false, message: `La Sección D excede el máximo permitido de 15 puntos (Suma actual: ${subD}).` };
    if (subE > 15) return { success: false, message: `La Sección E excede el máximo permitido de 15 puntos (Suma actual: ${subE}).` };

    const R = parseFloat((subA + subB + subC + subD + subE).toFixed(2)); // 0 a 100
    const contributionR = parseFloat((R * 0.90).toFixed(2)); // 0 a 90
    const G = parseFloat(evalInput.G) || 0; // 0 a 10
    const finalScore = parseFloat((contributionR + G).toFixed(2));

    p.evaluation = {
      evaluatedBy: evalInput.judgeId,
      evaluatedAt: new Date().toISOString(),
      indicators: ind,
      subtotalA: subA,
      subtotalB: subB,
      subtotalC: subC,
      subtotalD: subD,
      subtotalE: subE,
      R: R,
      contributionR: contributionR,
      G: G,
      finalScore: finalScore,
      justificationG: evalInput.justificationG || '',
      isDraft: !isLocked,
      isLocked: isLocked
    };

    this.save(data);
    return { success: true, evaluation: p.evaluation };
  },

  // ============================================================
  // RANKING OFICIAL Y GENERACIÓN DEL TOP 10
  // Desempate: Mayor Calificación Final -> Mayor A -> Mayor C -> Mayor E -> Mayor D -> Mayor B -> Mayor G
  // ============================================================
  getOfficialRanking() {
    const data = this.get();
    const evaluatedParticipants = data.participants.filter(p => p.evaluation && p.evaluation.finalScore !== undefined);

    const sorted = [...evaluatedParticipants].sort((p1, p2) => {
      const e1 = p1.evaluation;
      const e2 = p2.evaluation;

      // 1. Calificación Final
      if (e2.finalScore !== e1.finalScore) return e2.finalScore - e1.finalScore;
      // 2. Subtotal A
      if (e2.subtotalA !== e1.subtotalA) return e2.subtotalA - e1.subtotalA;
      // 3. Subtotal C
      if (e2.subtotalC !== e1.subtotalC) return e2.subtotalC - e1.subtotalC;
      // 4. Subtotal E
      if (e2.subtotalE !== e1.subtotalE) return e2.subtotalE - e1.subtotalE;
      // 5. Subtotal D
      if (e2.subtotalD !== e1.subtotalD) return e2.subtotalD - e1.subtotalD;
      // 6. Subtotal B
      if (e2.subtotalB !== e1.subtotalB) return e2.subtotalB - e1.subtotalB;
      // 7. Valoración Global G
      return e2.G - e1.G;
    });

    return sorted;
  },

  // Generar Ranking Nacional Oficial: Vacia y lista solo los 10 primeros lugares con mayores puntajes
  generateOfficialRanking() {
    const data = this.get();
    const fullSorted = this.getOfficialRanking();
    
    // Tomar únicamente los primeros 10 lugares
    const top10 = fullSorted.slice(0, 10);

    data.publishedRankingTop10 = top10;
    data.rankingGenerated = true;
    data.rankingGeneratedAt = new Date().toISOString();

    this.save(data);
    return { success: true, count: top10.length, top10 };
  },

  getPublishedRanking() {
    const data = this.get();
    if (data.rankingGenerated && data.publishedRankingTop10) {
      return data.publishedRankingTop10;
    }
    // Si aún no se genera explícitamente pero hay calificados, mostrar top 10 del ranking
    return this.getOfficialRanking().slice(0, 10);
  },

  // Monitoreo: Jueces con evaluaciones pendientes
  getPendingJudges() {
    const data = this.get();
    return data.judges.filter(j => {
      const assigned = j.assignedParticipants || [];
      if (assigned.length === 0) return false;

      // Un juez es pendiente si alguno de sus proyectos asignados no está calificado o no está bloqueado
      const allReady = assigned.every(pid => {
        const p = data.participants.find(part => part.id === pid);
        return p && p.evaluation && p.evaluation.isLocked;
      });

      return !allReady;
    });
  },

  // ============================================================
  // AUTOGUARDADO EN LOCALSTORAGE (DRAFTS)
  // ============================================================
  saveDraftParticipant(formData) {
    try {
      localStorage.setItem(DRAFT_PARTICIPANT_KEY, JSON.stringify(formData));
    } catch (e) {}
  },

  getDraftParticipant() {
    try {
      const s = localStorage.getItem(DRAFT_PARTICIPANT_KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  },

  clearDraftParticipant() {
    localStorage.removeItem(DRAFT_PARTICIPANT_KEY);
  },

  saveDraftJudge(formData) {
    try {
      localStorage.setItem(DRAFT_JUDGE_KEY, JSON.stringify(formData));
    } catch (e) {}
  },

  getDraftJudge() {
    try {
      const s = localStorage.getItem(DRAFT_JUDGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  },

  clearDraftJudge() {
    localStorage.removeItem(DRAFT_JUDGE_KEY);
  },

  // ============================================================
  // VISIBILIDAD DEL RANKING NACIONAL
  // ============================================================
  isRankingPublic() {
    const data = this.get();
    return !!data.rankingPubliclyVisible;
  },

  setRankingPublic(isVisible) {
    const data = this.get();
    data.rankingPubliclyVisible = !!isVisible;
    this.save(data);
    return data.rankingPubliclyVisible;
  },

  toggleRankingVisibility() {
    const current = this.isRankingPublic();
    return this.setRankingPublic(!current);
  },

  // ============================================================
  // GESTIÓN DE RECONOCIMIENTOS OFICIALES
  // ============================================================
  getSentCertificates() {
    const data = this.get();
    return data.sentCertificates || {};
  },

  markCertificateSent(recipientId, type, recipientEmail) {
    const data = this.get();
    if (!data.sentCertificates) data.sentCertificates = {};
    const key = `${type}_${recipientId}`;
    data.sentCertificates[key] = {
      recipientId,
      type,
      recipientEmail,
      sentAt: new Date().toISOString()
    };
    this.save(data);
    return data.sentCertificates[key];
  },

  isCertificateSent(recipientId, type) {
    const certs = this.getSentCertificates();
    return !!certs[`${type}_${recipientId}`];
  }
};

window.DataStore = DataStore;
window.TECMILENIO_CAMPUS = TECMILENIO_CAMPUS;
