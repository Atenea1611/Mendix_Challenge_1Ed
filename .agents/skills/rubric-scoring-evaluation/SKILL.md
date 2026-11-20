---
name: rubric-scoring-evaluation
description: Rúbrica oficial de 20 indicadores observables y valoración global G del Mendix Agile Challenge. Guía para calificar video (V) y documento (D), calcular puntuaciones finales y aplicar criterios de desempate.
---

# Cédula Oficial de Evaluación y Rúbrica: Mendix Agile Challenge

Cada proyecto es asignado a un único juez, quien entrega una sola cédula completa tras revisar el **Video de máximo 3 minutos** y el **Documento PDF** del proyecto.

---

## 1. Reglas de Calificación de Indicadores

- **Valoración binaria:** Anote **5** si se acredita plenamente todo el indicador y **0** si está ausente, incompleto o sin evidencia verificable.
- **Sin puntos parciales:** No se permiten valores intermedios (solo 0 o 5). No deben quedar casillas sin responder.
- **Fuentes:**
  - `V` = Evidencia requerida en Video.
  - `D` = Evidencia requerida en Documento PDF.
  - `D y V` = Requiere evidencia en ambas fuentes.
- **Neutralidad de formato:** La calidad de producción del video o el despliegue en nube no otorgan puntos adicionales.

---

## 2. Los 20 Indicadores Observables (Máximo 100 Puntos)

### Bloque A: Funcionalidad e Integración (40 Puntos Máximo)
| Clave | Indicador Observable | Fuente | Puntos |
| :---: | :--- | :---: | :---: |
| **A1** | Crea un evento con nombre y fecha; lo guarda y lo recupera en una consulta. | V | 0 o 5 |
| **A2** | Edita un dato del evento y muestra el cambio al consultarlo de nuevo. | V | 0 o 5 |
| **A3** | Registra un asistente, lo asocia a un evento y lo consulta dentro de ese evento. | V | 0 o 5 |
| **A4** | Crea una tarea vinculada a un evento, con responsable y fecha compromiso visibles. | V | 0 o 5 |
| **A5** | Cambia el estatus de una tarea y muestra el estado actualizado en su seguimiento. | V | 0 o 5 |
| **A6** | Genera un aviso o recordatorio con destinatario y contenido. Si es simulado, lo identifica expresamente. | V | 0 o 5 |
| **A7** | Muestra el evento creado en un calendario, agenda o listado organizado por fecha. | V | 0 o 5 |
| **A8** | Completa un recorrido con el mismo evento, sus asistentes y sus tareas vinculados, sin errores que impidan terminarlo. | V | 0 o 5 |
| **Subtotal A** | Suma de A1 a A8 | — | **0 a 40** |

### Bloque B: Experiencia de Uso (15 Puntos Máximo)
| Clave | Indicador Observable | Fuente | Puntos |
| :---: | :--- | :---: | :---: |
| **B1** | Permite entrar a eventos, asistentes y tareas y regresar al contexto del evento mediante controles visibles. | V | 0 o 5 |
| **B2** | Presenta textos legibles y acciones identificadas; usa nombres y controles consistentes en los tres módulos. | V | 0 o 5 |
| **B3** | Muestra confirmación de guardado y un mensaje comprensible ante un dato obligatorio omitido o inválido. | V | 0 o 5 |
| **Subtotal B** | Suma de B1 a B3 | — | **0 a 15** |

### Bloque C: Construcción Técnica y Datos (15 Puntos Máximo)
| Clave | Indicador Observable | Fuente | Puntos |
| :---: | :--- | :---: | :---: |
| **C1** | Incluye modelo de datos de Mendix o ERD con Evento, Asistente y Tarea y sus relaciones, coherentes con la demo. | D y V | 0 o 5 |
| **C2** | Presenta un microflujo implementado; explica su entrada, decisión o validación y resultado en una función del prototipo. | D | 0 o 5 |
| **C3** | Documenta una prueba de persistencia: guarda un dato, recarga la vista o reabre el registro y recupera el mismo valor, con resultado y evidencia. | D | 0 o 5 |
| **Subtotal C** | Suma de C1 a C3 | — | **0 a 15** |

### Bloque D: Aplicación de Metodologías Ágiles (15 Puntos Máximo)
| Clave | Indicador Observable | Fuente | Puntos |
| :---: | :--- | :---: | :---: |
| **D1** | El backlog contiene historias de eventos, asistentes y tareas, con usuario, necesidad, beneficio y criterios de aceptación verificables. | D | 0 o 5 |
| **D2** | Las historias tienen estimación y prioridad; se explica la técnica de estimación y el criterio para priorizar. | D | 0 o 5 |
| **D3** | Relaciona historias con sprints, muestra resultados y al menos un ajuste justificado entre lo planeado y lo ejecutado. | D | 0 o 5 |
| **Subtotal D** | Suma de D1 a D3 | — | **0 a 15** |

### Bloque E: Pruebas y Mejora (15 Puntos Máximo)
| Clave | Indicador Observable | Fuente | Puntos |
| :---: | :--- | :---: | :---: |
| **E1** | Documenta una prueba de eventos, una de asistentes y una de tareas, con pasos, resultado esperado, resultado obtenido y evidencia en cada una. | D | 0 o 5 |
| **E2** | Muestra un error, su corrección y la repetición exitosa de la prueba. Si no hubo errores, acredita una revisión adicional con resultados verificables. | D | 0 o 5 |
| **E3** | Documenta una prueba de usuario y una de seguridad o validación de entradas, con resultados y una mejora aplicada o una conclusión justificada. | D | 0 o 5 |
| **Subtotal E** | Suma de E1 a E3 | — | **0 a 15** |

---

## 3. Valoración Global del Juez ($G$)

El juez valora la utilidad, coherencia y madurez de la solución completa para la Gestión de Eventos Corporativos (GCS) asignando una nota de **0 a 10** (con un decimal opcional) y una **justificación obligatoria**.

| Rango de $G$ | Criterio de Juicio Global |
| :---: | :--- |
| **9.0 a 10.0** | Solución sólida, integrada y convincente; demuestra con claridad su utilidad para GCS y presenta limitaciones menores. |
| **7.0 a 8.9** | Solución útil y coherente; presenta limitaciones identificables que reducen su madurez. |
| **5.0 a 6.9** | Solución parcialmente convincente; las limitaciones afectan el uso o la integración del conjunto. |
| **0.0 a 4.9** | La evidencia ofrece poca certeza de una solución utilizable e integrada para GCS. |

---

## 4. Cálculo de la Calificación Final

$$\text{Puntaje de Indicadores } R = A + B + C + D + E \quad (\text{de 0 a 100})$$
$$\text{Aporte de Indicadores} = R \times 0.90 \quad (\text{de 0 a 90})$$
$$\text{CALIFICACIÓN FINAL} = (R \times 0.90) + G \quad (\text{de 0 a 100})$$

*Ejemplo Oficial:*
Si $R = 85$ y $G = 8.7$:
$$\text{Calificación Final} = (85 \times 0.90) + 8.7 = 76.5 + 8.7 = 85.2 \text{ puntos}$$

---

## 5. Criterio de Desempate
En caso de empate en la Calificación Final, se compara en este orden estricto:
$$\text{Mayor Subtotal A} \longrightarrow \text{Mayor Subtotal C} \longrightarrow \text{Mayor Subtotal E} \longrightarrow \text{Mayor Subtotal D} \longrightarrow \text{Mayor Subtotal B} \longrightarrow \text{Mayor Valoración Global G}$$
Si el empate persiste tras evaluar todos los pasos, se declara empate compartido de la posición.

