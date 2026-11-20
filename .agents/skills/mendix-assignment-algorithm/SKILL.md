---
name: mendix-assignment-algorithm
description: Algoritmo de asignación automática y equitativa de participantes a jueces para el Mendix Agile Challenge, garantizando la restricción estricta de no conflicto por campus.
---

# Algoritmo de Asignación Equitativa de Jurados: Mendix Agile Challenge

Este documento formaliza el algoritmo para asignar de forma imparcial y balanceada los proyectos de los equipos participantes a los jueces registrados en la plataforma.

---

## 1. Restricciones y Reglas de Negocio

1. **Restricción Dura (Hard Constraint):**
   $$\forall \text{ asignación }(P_i, J_k), \quad \text{Campus}(P_i) \neq \text{Campus}(J_k)$$
   Un juez **jamás** puede ser asignado a evaluar a un equipo que pertenezca a su mismo campus de Universidad Tecmilenio.

2. **Revisión Única:**
   Cada participante $P_i$ es evaluado por exactamente un juez $J_k$.

3. **Carga Equitativa:**
   Sea $N$ el número total de participantes y $M$ el número de jueces disponibles. La carga objetivo $C$ por juez es:
   $$C_{base} = \lfloor N / M \rfloor, \quad \text{con } (N \pmod M) \text{ jueces recibiendo } C_{base} + 1$$
   La diferencia máxima de proyectos asignados entre cualquier par de jueces debe ser $\le 1$.

---

## 2. Pseudocódigo del Algoritmo de Asignación

```javascript
function assignParticipantsToJudges(participants, judges) {
  if (!judges || judges.length === 0) throw new Error("No hay jueces registrados.");
  if (!participants || participants.length === 0) return [];

  // 1. Limpiar asignaciones previas
  const judgeAssignments = new Map();
  judges.forEach(j => judgeAssignments.set(j.id, []));

  // 2. Ordenar participantes priorizando los de campus más comunes (mayor restricción)
  const campusCounts = {};
  participants.forEach(p => {
    campusCounts[p.campus] = (campusCounts[p.campus] || 0) + 1;
  });

  const sortedParticipants = [...participants].sort((a, b) => {
    return campusCounts[b.campus] - campusCounts[a.campus];
  });

  // 3. Asignación voraz balanceada
  for (const p of sortedParticipants) {
    // Filtrar jueces elegibles (distinto campus)
    const eligibleJudges = judges.filter(j => j.campus !== p.campus);

    if (eligibleJudges.length === 0) {
      throw new Error(`Conflicto de asignación: No hay jueces elegibles fuera del campus ${p.campus}.`);
    }

    // Elegir el juez con menor carga actual
    eligibleJudges.sort((j1, j2) => {
      const count1 = judgeAssignments.get(j1.id).length;
      const count2 = judgeAssignments.get(j2.id).length;
      return count1 - count2;
    });

    const chosenJudge = eligibleJudges[0];
    judgeAssignments.get(chosenJudge.id).push(p.id);
  }

  return judgeAssignments;
}
```

---

## 3. Monitoreo y Notificación de Avance

- **Jueces Pendientes:** El sistema identifica a cualquier juez que tenga asignaciones y cuya cédula no se encuentre en estado `confirmed`.
- **Bloqueo de Confirmación:** Un juez solo puede confirmar cuando el $100\%$ de sus proyectos asignados cuente con cédula completa (los 20 indicadores calificados con 0 o 5 y valoración $G$ justificada).
- **Ajuste Manual:** El administrador puede reasignar un proyecto individualmente mediante un selector desplegable en caso de imprevistos con algún evaluador.

