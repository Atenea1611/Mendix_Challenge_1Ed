---
name: platform-web-dev
description: Arquitectura frontend, persistencia local, autoguardado, autenticación de roles y validaciones del portal web del Mendix Agile Challenge.
---

# Arquitectura y Desarrollo de la Plataforma Web: Mendix Agile Challenge

Este documento define la estructura y mejores prácticas para el desarrollo y mantenimiento del portal web del concurso nacional de Universidad Tecmilenio.

---

## 1. Módulos y Flujos de Usuario

```mermaid
flowchart TD
    Home["Página de Inicio (Home)"] --> RegisterBtn["Botón 'Regístrate' (Participantes)"]
    Home --> LoginTab["Pestaña 'Iniciar Sesión'"]
    
    RegisterBtn --> PartForm["Formulario de Registro de Equipo (Autoguardado)"]
    PartForm --> UniqueCode["Generación de Código Único (TEC-MAC-2026-XXXX)"]
    
    LoginTab --> AdminCheck{"¿Credenciales?"}
    AdminCheck -->|admin@tecmilenio.mx| AdminView["Panel de Administrador"]
    AdminCheck -->|Correo de Juez| JudgeView["Panel de Juez"]
    LoginTab --> JudgeReg["Enlace 'Crear Cuenta de Juez'"]
    JudgeReg --> JudgeForm["Formulario de Juez (Autoguardado)"]
    
    AdminView --> ManageAll["Ver/Eliminar Registros"]
    AdminView --> AutoAssign["Asignación Equitativa (Excluye mismo campus)"]
    AdminView --> PendingJudges["Monitoreo de Jueces Pendientes"]
    AdminView --> FullRanking["Ranking Nacional Oficial (Desempates A,C,E,D,B,G)"]
    
    JudgeView --> AssignedList["Proyectos Asignados Exclusivos"]
    JudgeView --> Rubric20["Cédula de 20 Indicadores (0 o 5) + Valor Global G"]
    JudgeView --> ConfirmBtn["Confirmar y Bloquear Evaluación"]
```

---

## 2. Esquema de Datos (`data.js`)

- `participants`: Lista de equipos inscritos.
  - `folio`: Código único (ej: `TEC-MAC-2026-7821`).
  - `teamName`: Nombre del equipo.
  - `campus`: Campus Tecmilenio.
  - `professor`: `{ firstName, lastName }`.
  - `captain`: `{ firstName, lastName, studentId, email }`.
  - `members`: Array de integrantes con matrícula y correo.
  - `professorApprovalFile`: Nombre y metadatos del aval PDF.
  - `projectDocFile`: Nombre y metadatos del documento PDF del proyecto.
  - `videoUrl`: Enlace al video de 3 minutos.
  - `assignedJudgeId`: ID del juez asignado (o `null`).
  - `evaluation`: Objeto con las respuestas a los 20 indicadores, sub-totales A, B, C, D, E, valor global $G$, justificación, puntuación final y estatus (`draft` o `confirmed`).
- `judges`: Lista de jueces registrados.
  - `id`: Identificador único.
  - `firstName`, `lastName`.
  - `payroll`: Nómina única.
  - `campus`: Campus Tecmilenio.
  - `email`: Correo institucional (usuario).
  - `password`: Contraseña.
  - `status`: `pending` o `completed`.
- `admin`: Credenciales fijas por defecto: `admin@tecmilenio.mx` / `adminTEC`.

---

## 3. Autoguardado en LocalStorage

Para prevenir pérdida de información por cortes de conexión:
- Cada cambio en los campos de los formularios de participante (`MAC_DRAFT_PARTICIPANT`) o juez (`MAC_DRAFT_JUDGE`) se almacena automáticamente en `localStorage`.
- Al reabrir el formulario, se detecta el borrador guardado y se ofrece restaurar los campos de forma transparente.
- Tras el envío exitoso, el borrador temporal se limpia automáticamente.

