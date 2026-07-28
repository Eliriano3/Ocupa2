# Ocupa2 — División de tareas por integrante

Proyecto Final · ITLA · Desarrollo de Apps · Periodo 2-2026
API base: `https://ocupa2.ia3x.com/apix` · Swagger: `https://ocupa2.ia3x.com/apix/docs`
Todos los endpoints privados requieren header `Authorization: Bearer <token>`.

---

## BLOQUE 1 — Núcleo, sesión y autenticación
**Eduardo Rafael Liriano Baez · 2023-1017**

**Base del proyecto**
- [ ] Crear el repositorio y agregar a los 5 integrantes como colaboradores
- [ ] Proyecto base, estructura de carpetas y ramas
- [ ] Cliente HTTP central apuntando a `https://ocupa2.ia3x.com/apix`
- [ ] Envío automático del token `Bearer` en cada petición
- [ ] Manejo central de errores del API (401, 402, 409, 422, sin conexión)
- [ ] Guardado seguro del token y sesión que persista al cerrar y abrir la app
- [ ] Navegación: el menú cambia según haya sesión iniciada, habilitando los módulos privados
- [ ] Componentes compartidos: input, botón, loader, estado vacío, mensaje de error
- [ ] Servicio de subida de imágenes reutilizable · `POST /uploads` (imagen en base64 → devuelve URL pública; máx 8 MB; JPG/PNG/WEBP/GIF)
- [ ] Servicio de ubicación: permisos + obtener latitud/longitud
- [ ] Generación del APK y verificación de que instala en un celular ajeno

**Pantallas**
- [ ] Registro · `POST /auth/register` (correo, nombre, apellido, clave, matrícula de referido → devuelve token)
- [ ] Login · `POST /auth/login` (correo + clave → devuelve token)
- [ ] Olvidé mi clave · `POST /auth/forgot-password` (correo + matrícula de referido → envía clave temporal por correo)
- [ ] Cambiar clave · `PUT /me/password`
- [ ] Cargar datos de la cuenta autenticada · `GET /me`
- [ ] Validaciones de formulario: correo, clave (mín. 6), campos requeridos
- [ ] Mostrar mensajes claros para 409 (correo ya registrado) y 422 (matrícula no válida)

**Entrega**
- [ ] Publicación del equipo en el Foro del Proyecto Final
- [ ] Subir el APK y generar el link de descarga

---

## BLOQUE 2 — Publicar oferta y pagos
**Josue Fondeur Román · 2024-0193**

**Pago**
- [ ] Pantalla de cobro de 1 USD con tarjeta · `POST /payments` (cardNumber, cvv, expMonth, expYear)
- [ ] Tarjetas de prueba: aprobada `4242424242424242`, rechazada `4000000000000002`
- [ ] Guardar el `paymentId` aprobado para usarlo al publicar; manejar el rechazo (402)
- [ ] Pantalla "Mis pagos" · `GET /me/payments`

**Publicar oferta** · `POST /offers`
- [ ] Cargar tipos de trabajo · `GET /job-types`
- [ ] Campos del formulario: jobTypeKey, contractType (`temporal` / `fijo` / `horas`), descripción, dirección, ubicación (lat/lng), foto (obligatoria, URL de `/uploads`), fecha límite (deadline)
- [ ] Bloquear la publicación si no hay `paymentId` aprobado o falta la foto (402 / 422)
- [ ] Renderizar los campos personalizados del tipo de trabajo elegido y enviarlos en `customAnswers` (ej. `categoria_licencia`)

**Preguntas para el aplicante** (campo `questions` de la oferta)
- [ ] Constructor de preguntas: agregar y quitar preguntas de tipo `text`, `date`, `select`, `check`
- [ ] Marcar preguntas como requeridas y definir las `options` en `select` y `check`

**Mis ofertas publicadas**
- [ ] Listado de mis ofertas · `GET /me/offers`
- [ ] Desactivar una oferta · `POST /offers/{id}/deactivate`

**Compartido**
- [ ] Escribir el motor de campos dinámicos (`text` / `number` / `date` / `select` / `check`) y entregárselo a Rosmeris para el formulario de aplicación

---

## BLOQUE 3 — Aplicantes y contratos
**Hanier Peguero · 2024-0012**

**Gestión de aplicantes** (solo el dueño de la oferta)
- [ ] Ver la lista de aplicantes de una oferta · `GET /offers/{id}/applications`
- [ ] Ver el comentario y las respuestas de cada aplicante
- [ ] Calificar (rating 1–5), descartar, marcar finalista y elegir ganador · `PATCH /applications/{id}` con `status` = `applied` / `discarded` / `finalist` / `winner`
- [ ] Al elegir ganador se crea automáticamente un contrato (opcionalmente enviar salary, startDate, duration)

**Contratos**
- [ ] Lista de mis contratos · `GET /me/contracts` (filtro por estado: `active` / `inactive`)
- [ ] Detalle del contrato con comentarios y fotos · `GET /contracts/{id}`
- [ ] Fijar términos (solo contratante) · `PUT /contracts/{id}/terms` (salary, currency, startDate, duration)
- [ ] Aceptar contrato (solo contratado) · `POST /contracts/{id}/accept`
- [ ] Rechazar contrato (solo contratado) · `POST /contracts/{id}/reject`
- [ ] Comentar en el contrato · `POST /contracts/{id}/comments`
- [ ] Subir foto con descripción · `POST /contracts/{id}/photos`
- [ ] Cancelar el contrato con justificación · `POST /contracts/{id}/cancel`

**Compartido**
- [ ] Coordinar con Rosmeris el enlace desde "Mis aplicaciones" (estado ganador) hacia el detalle del contrato

---

## BLOQUE 4 — Explorar, aplicar y me gusta
**Rosmeris Jimenez De La Cruz · 2024-1779**

**Explorar ofertas** · `GET /offers`
- [ ] Listado de ofertas activas
- [ ] Filtros por tipo de trabajo (`jobTypeKey`) y tipo de contrato (`contractType`)
- [ ] Manejo de lista vacía, cargando y error de red

**Mapa**
- [ ] Configurar la API key de Google Maps
- [ ] Mostrar las ofertas en el mapa por latitud/longitud
- [ ] Al tocar un marcador, ver los detalles de la oferta

**Detalle de oferta** · `GET /offers/{id}`
- [ ] Mostrar tipo de trabajo, contrato, ubicación, dirección, pago, descripción, foto y fecha límite
- [ ] La identidad del publicante permanece oculta (solo visible para el ganador)

**Aplicar** · `POST /offers/{id}/apply`
- [ ] Formulario con comentario explicando por qué es apto
- [ ] Responder las preguntas de la oferta renderizadas dinámicamente según su tipo (usar el motor de Josue), enviándolas en `answers`
- [ ] Manejar el caso de aplicación duplicada (409)

**Mis aplicaciones** · `GET /me/applications`
- [ ] Listado de ofertas a las que apliqué con su estado
- [ ] Mostrar la identidad del publicante solo cuando el estado es ganador, con enlace al contrato

**Me gusta**
- [ ] Dar me gusta · `POST /offers/{id}/like`
- [ ] Quitar me gusta · `DELETE /offers/{id}/like`
- [ ] Lista de ofertas con me gusta · `GET /me/likes`

**Entrega**
- [ ] Documento PDF con matrícula, nombre completo y fotografía de cada integrante
- [ ] Link del repositorio + código QR
- [ ] Link de descarga del APK + código QR
- [ ] Link del video + código QR

---

## BLOQUE 5 — Contenido, foro, perfil y experiencias
**Katerin Cordero Cubilete · 2024-1575**

**Inicio**
- [ ] Slider con imágenes y mensajes de bienvenida

**Noticias** · `GET /news` (público)
- [ ] Listado de noticias de empleo (título, foto, resumen)
- [ ] Pantalla de detalle / enlace al artículo original

**Videos** · `GET /videos` (público)
- [ ] Listado de videos de YouTube
- [ ] Reproducción dentro de la app usando el `youtubeId`

**Acerca de**
- [ ] Foto, nombre y matrícula de los 5 integrantes
- [ ] Teléfono con opción de llamar funcionando
- [ ] Link de Telegram funcionando

**Foro**
- [ ] Lista de temas · `GET /forum/topics`
- [ ] Crear un tema (título + descripción) · `POST /forum/topics`
- [ ] Detalle del tema con sus comentarios · `GET /forum/topics/{id}`
- [ ] Comentar en un tema · `POST /forum/topics/{id}/comments`

**Mi perfil y experiencias**
- [ ] Ver los datos de mi perfil · `GET /me`
- [ ] Lista de mis experiencias · `GET /me/experiences`
- [ ] Agregar experiencia (título, descripción, tipo de trabajo, imagen de certificado vía `/uploads`) · `POST /me/experiences`
- [ ] Eliminar experiencia · `DELETE /me/experiences/{id}`

**Entrega**
- [ ] Ícono de la aplicación con las caras o avatares de los 5 integrantes
- [ ] Guion del video de presentación

---

## Video de presentación
**Los 5 integrantes**

- [ ] Mostrar el funcionamiento completo de la aplicación
- [ ] Cada integrante aparece en el video
- [ ] Cada integrante explica qué parte del proyecto realizó
- [ ] Subir el video y generar el link
