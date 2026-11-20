# Puesta en marcha del portal compartido

Esta versión necesita **Node.js 24 o posterior y un disco persistente**. Abrir `index.html`, ejecutar un servidor de archivos o publicar únicamente los archivos estáticos ya no permite registrar o evaluar: los datos oficiales y las sesiones viven en el servidor.

## Ejecutar en una computadora

1. Instalar Node.js 24 o posterior y descargar la rama de esta versión.
2. Copiar `.env.example` a `.env`.
3. Escribir en `.env` una contraseña de administración de entre 12 y 128 caracteres y un `JUDGE_INVITE_CODE` aleatorio de al menos 16 caracteres. No reutilizar las contraseñas de demostración anteriores ni subir `.env` a GitHub.
4. Ejecutar `npm start` desde la carpeta del proyecto. No es necesario instalar paquetes.
5. Abrir `http://localhost:8080`. Entrar con el correo y la contraseña configurados. Compartir el código de invitación exclusivamente con los jueces autorizados.

En Windows, `serve.ps1` ejecuta el mismo servidor. El correo del administrador se establece al crear la base. Editar ADMIN_EMAIL o ADMIN_PASSWORD después no cambia una cuenta existente.

## Publicar para todo el concurso

Se requiere un alojamiento que ejecute un proceso Node.js permanente, un volumen persistente y HTTPS. Configurar `PUBLIC_ORIGIN` con el origen exacto del portal, por ejemplo `https://concurso.ejemplo.mx`, sin ruta ni diagonal final. Configurar `HOST=0.0.0.0` cuando lo requiera el alojamiento y `PORT` con el puerto asignado. El proxy debe atender HTTPS y reenviar al proceso Node.

`DATA_DIR` debe apuntar al volumen persistente. Ejecutar **una sola instancia** del servidor. No desplegar SQLite sobre un disco temporal, GitHub Pages o funciones sin estado. Un despliegue estático de Netlify por sí solo no ejecuta este servidor. Para usar exclusivamente funciones y varias instancias se requiere otro adaptador de base de datos compartida.

No publicar el puerto interno directamente ni activar `TRUST_PROXY=1` salvo que un proxy de confianza reemplace `X-Forwarded-For`. El límite por dirección protege el inicio de sesión y el registro; tras 10 intentos de acceso se espera 15 minutos. Con un proxy, dejar TRUST_PROXY=0 puede agrupar los límites de distintos visitantes en una sola dirección.

## Datos, evaluación y correos

- La base comienza **vacía**, sin equipos, jueces ni evaluaciones ficticias. No importa automáticamente registros de `localStorage`; los datos de la versión anterior deben respaldarse y revisarse por separado antes de cualquier migración. No se borran los datos antiguos del navegador.
- Un registro se confirma después de guardar la transacción. Las matrículas se comprueban en el conjunto compartido y el folio utiliza UUID. Ambos PDF son obligatorios y admiten hasta 5 MB cada uno.
- Los borradores de formulario permanecen en el navegador y no incluyen contraseñas ni archivos. Los PDF se vuelven a seleccionar después de recargar. Los borradores de evaluación se guardan en el servidor con el botón correspondiente.
- Solo el juez asignado puede evaluar. La rúbrica documentada admite **0 o 5** por indicador y G de 0 a 10, con un decimal. El servidor calcula todos los totales. Una evaluación confirmada queda bloqueada, incluso si el cliente intenta forzar su desbloqueo.
- La asignación automática conserva los jueces de equipos ya evaluados. No se elimina un juez con evaluaciones ni un equipo con evaluación confirmada.
- El ranking solo se genera cuando todos los equipos tienen evaluación confirmada. Generar y hacer público son pasos separados. Se aplica el desempate A → C → E → D → B → G. Si persiste un empate completo que afecte el Top 10, el portal solicita a administración el orden de folios y la justificación del dictamen del comité. Guarda el dictamen con fecha y responsable antes de generar el ranking; no inventa un ganador por orden de registro. Registrar nuevos equipos o cambiar asignaciones invalida la publicación y los dictámenes anteriores.
- Los visitantes ven nombres de equipos, campus y resultados publicados; no ven correos, matrículas, PDF ni justificaciones internas.
- **El correo automático está deshabilitado**: no existe un proveedor configurado ni se registra un envío ficticio. Se puede descargar el PNG o imprimir el reconocimiento para enviarlo manualmente. Conectar un proveedor de correo es un paso pendiente, independiente del registro y la evaluación.

## Respaldo y recuperación

La base y las sesiones se guardan en `DATA_DIR/challenge.sqlite`. Respaldar el directorio con el proceso detenido, incluyendo los archivos auxiliares si existen; alternativamente usar la API de respaldo en línea de SQLite. Proteger el respaldo como información personal y probar su restauración antes del concurso. No borrar la base para cambiar una contraseña. Las sesiones expiran a las ocho horas; cerrar sesión elimina el acceso en el servidor.

## Comprobaciones

Ejecutar `npm test`. Las pruebas crean bases temporales y verifican registro compartido, persistencia tras reiniciar, acceso por rol y equipo, conflictos de campus, matrículas duplicadas simultáneas, PDF inválidos, calificaciones, bloqueo, ranking privado y público, solicitudes de otros orígenes y reversión ante un fallo de escritura. También verifican el puente del navegador y el manejo de errores sin borrar borradores.

Los recursos gráficos y los reconocimientos existentes permanecen en el repositorio. Los logotipos y las medallas se cargan desde sus PNG, sin descargar el archivo JavaScript de imágenes embebidas de aproximadamente 9 MB al abrir el portal.
