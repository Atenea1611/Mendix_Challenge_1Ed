# Mendix Agile Challenge - Universidad Tecmilenio & Siemens Mendix

Plataforma oficial de administración y conjunto de **Agentes Personalizados (Custom Agents)** y **Habilidades (Skills)** para Google Antigravity, desarrollada para el certamen nacional en línea **Mendix Agile Challenge** de **Universidad Tecmilenio** en colaboración con **Siemens Mendix**.

El concurso reta a los estudiantes a aplicar metodologías ágiles y construir un prototipo funcional en Siemens Mendix para resolver un caso de **Gestión de Eventos Corporativos (GCS)** con módulos de Eventos, Asistentes y Tareas.

---

## 🤖 1. Agentes Personalizados Instalados en `.agents/agents/`

Siguiendo las especificaciones de [Introducing custom agents | Google Antigravity Blog](https://antigravity.google/blog/introducing-custom-agents):

| Nombre del Agente | Archivo | Rol y Responsabilidad Principal |
| :--- | :--- | :--- |
| **`mendix-agile-challenge`** | [`.agents/agents/mendix-agile-challenge.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/agents/mendix-agile-challenge.md) | **Coordinador General:** Supervisa el certamen nacional, calendario de sprints, dictámenes de jurado y resolución de controversias. |
| **`mendix-evaluator-judge`** | [`.agents/agents/mendix-evaluator-judge.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/agents/mendix-evaluator-judge.md) | **Juez Técnico de Rúbrica:** Aplica con rigor binario (0 o 5 pts) los 20 indicadores observables y la valoración global $G$ fundamentada. |
| **`mendix-assignment-manager`** | [`.agents/agents/mendix-assignment-manager.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/agents/mendix-assignment-manager.md) | **Gestor de Asignación y Campus:** Garantiza que ningún juez evalúe a participantes de su propio campus y reparte la carga equitativamente. |
| **`agile-scrum-coach`** | [`.agents/agents/agile-scrum-coach.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/agents/agile-scrum-coach.md) | **Coach Ágil y Scrum Master:** Asesora a los equipos en la redacción de historias Gherkin, planeación de sprints y matrices de pruebas. |
| **`mendix-platform-admin`** | [`.agents/agents/mendix-platform-admin.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/agents/mendix-platform-admin.md) | **Ingeniero Web y Persistencia:** Administra el código del portal web (`app.js`, `data.js`), autoguardado, sesiones y respaldos. |

---

## 📚 2. Habilidades de Proyecto en `.agents/skills/`

| Habilidad | Ubicación | Descripción |
| :--- | :--- | :--- |
| **`mendix-agile-challenge`** | [`.agents/skills/mendix-agile-challenge/SKILL.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/skills/mendix-agile-challenge/SKILL.md) | Procedimientos operativos estándar, reglamento y lineamientos del concurso nacional Tecmilenio. |
| **`rubric-scoring-evaluation`** | [`.agents/skills/rubric-scoring-evaluation/SKILL.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/skills/rubric-scoring-evaluation/SKILL.md) | Cédula oficial de 20 indicadores (A1-A8, B1-B3, C1-C3, D1-D3, E1-E3), fórmula $(R \times 0.90) + G$ y reglas de desempate. |
| **`mendix-assignment-algorithm`** | [`.agents/skills/mendix-assignment-algorithm/SKILL.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/skills/mendix-assignment-algorithm/SKILL.md) | Algoritmo de distribución equitativa de proyectos a jueces con exclusión estricta de mismo campus. |
| **`agile-challenge-facilitation`** | [`.agents/skills/agile-challenge-facilitation/SKILL.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/skills/agile-challenge-facilitation/SKILL.md) | Caso de negocio de Gestión de Eventos Corporativos (GCS) en Mendix, Product Backlog y protocolos de prueba. |
| **`platform-web-dev`** | [`.agents/skills/platform-web-dev/SKILL.md`](file:///c:/Users/L03563109/Desktop/MendixChallenge/.agents/skills/platform-web-dev/SKILL.md) | Arquitectura frontend, persistencia en localStorage, autoguardado y control de acceso. |

---

## 💻 3. Características del Sitio Web de Administración

- **Página de Inicio & Convocatoria:** Información detallada del certamen nacional, reto GCS, requisitos y accesos directos.
- **Registro de Equipos con Autoguardado:**
  - Formulario con validación estricta de **matrículas únicas de alumnos**.
  - **Autoguardado en tiempo real en `localStorage`** para proteger el avance de los participantes ante desconexiones.
  - Carga de Aval del Profesor (PDF), Documento del Proyecto (PDF) y URL del video de 3 minutos.
  - Generación automática de **Código Único de Participante / Folio** (`TEC-MAC-2026-XXXX`).
- **Autenticación con Roles:**
  - **Administrador por defecto:** `admin@tecmilenio.mx` / `adminTEC`.
  - **Acceso para Jueces:** Correo institucional y contraseña.
  - **Creación de Cuenta de Juez:** Registro con nómina y correo institucional únicos y autoguardado.
- **Panel del Administrador:**
  - Padrón de participantes con edición manual de asignación.
  - Padrón de jueces con monitoreo de estatus.
  - **Asignación Automática Equitativa:** Aplica la regla: **Un juez no puede revisar a un equipo de su mismo campus**.
  - **Monitoreo de Jueces Pendientes:** Alerta visual de los jueces que aún tienen cédulas por completar.
- **Portal del Juez:**
  - Muestra únicamente sus proyectos asignados.
  - Cédula completa con los **20 indicadores observables (0 o 5 pts)** agrupados en A (Funcionalidad), B (Uso), C (Técnica), D (Ágil), E (Pruebas).
  - Cálculo instantáneo: $R$, aporte $R \times 0.90$, valoración global $G$ (0 a 10 con 1 decimal) y justificación obligatoria.
  - Botón de **Confirmar y Bloquear Evaluación** habilitado tras completar todos sus proyectos asignados.
- **Ranking Nacional Oficial:**
  - Podio interactivo de 1.º, 2.º y 3.er Lugar.
  - Tabla con desglose completo y **algoritmo oficial de desempate ($A \rightarrow C \rightarrow E \rightarrow D \rightarrow B \rightarrow G$)**.
  - Exportación a CSV e impresión directa de cédula.

---

## 🚀 4. Instrucciones de Uso

Abre directamente [`index.html`](file:///c:/Users/L03563109/Desktop/MendixChallenge/index.html) en tu navegador web o ejecuta en PowerShell:
```powershell
.\serve.ps1
```
