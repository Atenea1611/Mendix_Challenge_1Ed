---
name: mendix-agile-challenge
description: Procedimientos operativos, reglamento oficial, flujo de registro y lineamientos del certamen nacional Mendix Agile Challenge de Universidad Tecmilenio y Siemens.
---

# Procedimientos Oficiales: Mendix Agile Challenge (Tecmilenio)

El certamen nacional **Mendix Agile Challenge** de **Universidad Tecmilenio** y **Siemens** reta a los alumnos a aplicar metodologías ágiles y construir un prototipo funcional en Siemens Mendix para resolver un caso de **Gestión de Eventos Corporativos (GCS)**.

---

## 1. Roles y Accesos en la Plataforma

| Rol | Credenciales / Acceso | Capacidades Principales |
| :--- | :--- | :--- |
| **Administrador General** | `admin@tecmilenio.mx` / `adminTEC` | Ver y eliminar todos los registros (participantes y jueces), ejecutar asignación automática equitativa con restricción de campus, monitorear jueces pendientes y consultar ranking total. |
| **Juez Evaluador** | Correo institucional + Contraseña (elegida en su registro) | Visualizar únicamente los participantes asignados, calificar los 20 indicadores y valor global $G$, guardar borradores y confirmar definitivamente sus evaluaciones. |
| **Participante / Equipo** | Formulario público de registro | Registrar equipo, integrantes, aval del profesor en PDF, documento PDF del proyecto y enlace al video de 3 minutos. Obtiene folio único `TEC-MAC-2026-XXXX`. |

---

## 2. Reglas de Validación de Registro

### Participantes:
- **Nombre del equipo** y **Nombre del campus** Tecmilenio.
- **Profesor Asesor:** Nombres y Apellidos.
- **Capitán:** Nombres, Apellidos, Matrícula y Correo institucional.
- **Integrantes (1 a 3 alumnos):** Nombres, Apellidos, Matrícula y Correo institucional.
- **Carga de Archivos y Enlaces:**
  - Aval del profesor (PDF).
  - Documento del proyecto (PDF).
  - Enlace al video de máximo 3 minutos (URL pública).
- **Reglas de Integridad:**
  - **Matrículas estrictamente únicas:** Ningún estudiante puede estar registrado en más de un equipo.
  - **Autoguardado obligatorio:** El formulario guarda el progreso en `localStorage` ante desconexiones.
  - Al completar el registro, el sistema genera automáticamente un **Código Único de Participante / Folio**.

### Jueces:
- Nombres, Apellidos, Nómina, Campus Tecmilenio, Correo institucional y Contraseña.
- **Nómina y correo institucional únicos.**
- Autoguardado automático en el formulario de creación de cuenta de juez.

---

## 3. Asignación de Proyectos a Jueces
1. **Regla de Conflicto de Campus:** **Un juez nunca puede evaluar a un participante o equipo de su mismo campus.**
2. **Distribución Equitativa:** El número total de proyectos se reparte en partes iguales entre los jueces disponibles (con una diferencia máxima de 1 proyecto entre jueces).
3. **Revisión Única:** Cada proyecto es revisado por un único juez titular.
4. **Capacidad de Ajuste:** El administrador puede editar manualmente la asignación en caso de contingencias.

---

## 4. Fórmula Oficial de Calificación y Desempate
$$\text{Calificación Final} = (R \times 0.90) + G$$
- $R$ = Suma de los 20 indicadores observables (0 o 5 pts) = hasta 100 pts (aporta 90% del total).
- $G$ = Valoración global propia del juez (0 a 10 puntos, con un decimal y justificación obligatoria).

### Criterio Oficial de Desempate:
En caso de empate en la calificación final, la coordinación compara los subtotales en este orden estricto:
1. **Subtotal A** (Funcionalidad e integración)
2. **Subtotal C** (Construcción técnica y datos)
3. **Subtotal E** (Pruebas y mejora)
4. **Subtotal D** (Aplicación de metodologías ágiles)
5. **Subtotal B** (Experiencia de uso)
6. **Valoración Global G**
En cada paso prevalece el valor mayor. No se solicita una segunda revisión.
