# Mendix Agile Challenge — Tecmilenio y Siemens Mendix

Portal de registro, asignación de jueces, evaluación, ranking y reconocimientos del concurso nacional.

**Esta versión utiliza un servidor Node.js 24 y SQLite persistente.** Los registros y las evaluaciones se comparten entre usuarios; los roles y los permisos se verifican en el servidor.

Consulta [la guía de puesta en marcha](README_SERVER.md) para configurar las credenciales, ejecutar el portal y publicarlo con HTTPS. El correo automático permanece deshabilitado hasta conectar un proveedor; no se muestran confirmaciones ficticias.

```sh
npm start
npm test
```

Antes de iniciar, copia [.env.example](.env.example) a `.env` y configura una contraseña nueva y el código de invitación para jueces.

El código principal está en [app.js](app.js), [data.js](data.js), [server/index.cjs](server/index.cjs) y [server/model.cjs](server/model.cjs). La rúbrica utiliza 20 indicadores de 0 o 5 puntos y la fórmula `(R × 0.90) + G`.

Las definiciones de agentes y procedimientos se conservan en [.agents/agents](.agents/agents) y [.agents/skills](.agents/skills). Las referencias antiguas a contraseñas de demostración o almacenamiento local no describen el sistema de autenticación de esta versión.

