# Informe de Seguridad — BDP System

**Plataforma:** Sistema de gestión interna BDP System
**Preparado para:** Ing. Roberto Juárez
**Preparado por:** « Flores Vazquez Bryan Aldrich » — Desarrollador y responsable de seguridad de la plataforma
**Fecha:** 10 de julio de 2026
**Clasificación:** Documento informativo — apto para revisión por su equipo técnico

---

## Una nota personal, antes de los detalles

Estimado Ingeniero Juárez:

Sé que confiar la operación de su empresa a un sistema de software implica, en el fondo, una pregunta muy simple: **"¿estoy tranquilo con esto?"**. Este documento existe para responderla con honestidad y con evidencia, no con promesas.

Escribí este informe pensando en dos lectores a la vez. Por un lado, en usted: quiero que pueda leerlo de principio a fin y entender, en lenguaje claro, qué se hizo para proteger su información y por qué puede operar con confianza. Por el otro, en cualquier persona técnica de su confianza a quien decida mostrárselo: para ellos incluí, en cada sección, el detalle concreto que van a querer verificar.

No voy a decirle que el sistema es "100% invulnerable" —nadie serio lo diría de ningún sistema en el mundo—. Lo que sí voy a mostrarle es que la plataforma fue revisada a fondo, que cada punto débil que se encontró fue corregido, y que hoy sigue las mismas prácticas de seguridad que usan las organizaciones que se toman esto en serio. Al terminar de leer, mi objetivo es que entre al sistema con la tranquilidad de que **es muy poco probable que algo salga mal, y de que si algo cambiara, hay quien lo está cuidando.**

---

## Cómo leer este documento

- Los **recuadros "En términos simples"** están escritos para cualquier lector. Si solo lee eso, ya se lleva la idea completa.
- Los **bloques "Detalle técnico"** están para su equipo. Usan la terminología estándar de la industria para que puedan validarlos.

No hace falta ser informático para entender el mensaje general. Y quien sepa del tema, encontrará sustancia real para revisar.

---

## Resumen ejecutivo

Durante las últimas semanas se realizó una **revisión de seguridad integral** de BDP System, dividida en tres etapas: los archivos y datos sensibles, la identidad y el acceso de los usuarios, y el servidor donde vive la aplicación. En cada etapa se identificaron oportunidades de mejora y **todas fueron corregidas y verificadas**.

En pocas palabras:

| Área                                                 | Estado hoy                                   |
| ---------------------------------------------------- | -------------------------------------------- |
| Documentos y archivos sensibles (facturas, adjuntos) | Protegidos y de acceso privado               |
| Acceso de usuarios y permisos                        | Cada acción exige el permiso correspondiente |
| Contraseñas y sesiones                               | Cifradas y con expiración controlada         |
| Comunicación con el sistema                          | Siempre cifrada (candado del navegador)      |
| El servidor / la infraestructura                     | Blindado, actualizado y monitoreado          |
| Respaldos de la información                          | Realizados y probados                        |

El resultado es un sistema cuyo nivel de exposición pasó de **"requería atención"** a **"protegido según buenas prácticas de la industria"**.

---

## Sobre quién construyó y protege este sistema

El desarrollo y la seguridad de la plataforma están a cargo de un profesional con **certificación oficial de Amazon Web Services (AWS)** «[especificar la certificación exacta, p. ej. AWS Certified Solutions Architect]», una de las entidades de referencia mundial en infraestructura y seguridad en la nube.

Quiero ser transparente con lo que una certificación significa y lo que no: **una certificación no es un sello que se le pone al sistema; es la garantía de que quien lo construyó y lo cuida domina las prácticas de seguridad reconocidas en la industria.** El valor real está en cómo ese conocimiento se aplicó, concretamente, a _su_ plataforma. Eso es precisamente lo que detalla el resto de este documento: no teoría, sino medidas implementadas y verificadas, punto por punto.

---

## Las capas de protección

La seguridad seria no depende de una sola barrera, sino de **varias capas independientes**. Si una fallara, las demás siguen protegiendo. Así está construido BDP System.

### 1. Sus archivos sensibles están bajo llave

> **En términos simples:** Documentos como las facturas y los archivos adjuntos ya no se pueden abrir con solo tener el enlace. Cada vez que alguien autorizado necesita ver un archivo, el sistema genera una "llave temporal" que sirve por unos minutos y luego se vence. Un desconocido, aunque consiguiera un enlace viejo, se encuentra con una puerta cerrada.

Este fue uno de los puntos que más atención recibió, y es donde el conocimiento certificado se aplicó de forma más directa.

**Detalle técnico:**

- Los archivos (adjuntos y facturas) se almacenan de forma **privada**; ya no son de lectura pública.
- El acceso se realiza mediante **URLs firmadas de tiempo limitado (pre-signed URLs)**: enlaces criptográficamente firmados que expiran automáticamente a los pocos minutos.
- La generación de cada enlace está protegida por el sistema de permisos: solo un usuario con el rol adecuado puede solicitarlo.
- Se aplicó protección contra acceso indebido a recursos de otros usuarios (control de propiedad del recurso, prevención de IDOR).
- Los enlaces públicos que existían antes de esta corrección **hoy devuelven "acceso denegado" (error 403)**; se verificó uno por uno.

### 2. Cada acción exige su permiso

> **En términos simples:** Ningún usuario puede hacer algo para lo que no está autorizado. Ver, crear, modificar o eliminar información: cada operación revisa primero si la persona tiene el permiso para hacerla. No alcanza con "estar dentro del sistema".

**Detalle técnico:**

- Modelo de **control de acceso basado en roles (RBAC)** con permisos granulares del tipo `recurso:acción`.
- La verificación de permisos se aplica en el **servidor**, no solo en la pantalla —el control real ocurre donde no se puede manipular—.
- Cerca de **90 operaciones sensibles** del sistema están protegidas por esta verificación de permisos de forma sistemática.

### 3. Identidad y sesiones controladas

> **En términos simples:** Las contraseñas se guardan de forma que ni siquiera nosotros podemos leerlas. Las sesiones abiertas se cierran solas después de un tiempo, así una sesión olvidada no queda abierta para siempre. Y el sistema resiste los intentos automáticos de adivinar contraseñas.

**Detalle técnico:**

- Contraseñas almacenadas con **hashing bcrypt** (nunca en texto legible), con comparación de tiempo uniforme para evitar filtración de información.
- **Sesiones con vencimiento máximo de 24 horas** y rotación periódica de credenciales de sesión.
- **Límite de intentos de inicio de sesión** (protección contra fuerza bruta) con diseño **anti-enumeración**: el sistema no revela si un correo existe o no.
- Los formularios públicos (por ejemplo, el registro por código QR) tienen **límite de frecuencia** para evitar abusos automatizados.

### 4. La información viaja y se guarda cifrada

> **En términos simples:** Toda la comunicación entre su gente y el sistema está cifrada, como en la banca por internet (el candado del navegador). Nadie en el medio puede espiar lo que se envía.

**Detalle técnico:**

- **HTTPS/TLS obligatorio** en todo el sitio, con certificados válidos y renovación automática (Let's Encrypt).
- Redirección forzada de cualquier acceso no cifrado hacia la versión segura.

### 5. Defensa contra los ataques más comunes

> **En términos simples:** Los tipos de ataque más frecuentes contra sistemas web —los que uno lee en las noticias— fueron considerados y bloqueados desde el diseño.

**Detalle técnico:**

- **Prevención de inyección SQL** mediante consultas parametrizadas a través de un ORM (Prisma); no se construyen consultas concatenando texto del usuario.
- **Validación estricta de todos los datos de entrada** (esquemas Zod), tanto del lado del cliente como, sobre todo, del servidor.
- **Superficie de ataque reducida:** la lógica de negocio no se expone como una API pública abierta, sino a través de acciones de servidor controladas.
- Cabeceras de seguridad del navegador activas (protección contra incrustación en sitios de terceros, entre otras).

### 6. El servidor, blindado

> **En términos simples:** La computadora donde vive el sistema fue cerrada a cal y canto. Solo se dejaron abiertas las puertas estrictamente necesarias, el acceso administrativo ya no usa contraseña (usa una llave digital que solo el desarrollador posee), y el sistema se actualiza solo contra nuevas amenazas.

**Detalle técnico:**

- **Firewall con política de denegación por defecto:** únicamente los puertos indispensables (tráfico web) están habilitados; el resto del sistema quedó cerrado a Internet, incluyendo servicios internos que antes estaban expuestos.
- **Acceso administrativo exclusivamente por clave criptográfica** (SSH con autenticación por llave), con el ingreso por contraseña **deshabilitado**: elimina la posibilidad de adivinar la contraseña por fuerza bruta.
- **Actualizaciones de seguridad automáticas** del sistema operativo, para cerrar vulnerabilidades nuevas apenas se publican.
- **Sistema de bloqueo de intrusos** que frena y bloquea intentos de acceso sospechosos.
- El servidor corre la **versión más reciente y parcheada** de su sistema operativo, y todo el blindaje fue **verificado tras un reinicio completo** para confirmar que resiste de forma permanente, no solo momentánea.

### 7. Sus datos, respaldados

> **En términos simples:** Existe una copia de seguridad de la información, y —esto es lo importante— **se probó que la copia realmente funciona** restaurándola. Muchos respaldos fallan justo cuando se los necesita; este ya se puso a prueba.

**Detalle técnico:**

- Respaldos de la base de datos almacenados en un proveedor externo (DigitalOcean), separados del servidor principal.
- Proceso de restauración **verificado en la práctica**, no solo configurado.

---

## Mantenimiento continuo: la seguridad no es una foto, es una película

Un punto que quiero destacar, porque marca la diferencia entre un sistema "asegurado una vez" y uno "protegido en el tiempo":

- El sistema **se actualiza solo** contra vulnerabilidades nuevas.
- Los **respaldos se realizan de forma continua**.
- El acceso está **restringido y monitoreado**.
- Las **credenciales se rotan** como práctica de higiene, no solo cuando hay un problema.

Esto significa que la protección descrita aquí **no caduca la semana que viene**: está diseñada para sostenerse.

---

## Una palabra honesta sobre el riesgo

Le debo honestidad, y la honestidad es también lo que hace creíble a este documento.

Ningún sistema —ni el de un banco, ni el de una gran empresa tecnológica— puede prometer un cero absoluto de riesgo. Cualquiera que le diga lo contrario no está siendo sincero. Lo que sí se puede hacer, y es exactamente lo que se hizo, es **reducir la probabilidad de un incidente a un nivel bajo y bien administrado**, y asegurar que, ante cualquier eventualidad, existan respaldos y capas de defensa que contengan el impacto.

Dicho de forma directa: **el sistema pasó de tener puertas que convenía cerrar, a estar protegido con las mismas prácticas que se consideran estándar en la industria.** Puede operar con tranquilidad fundamentada —no en una promesa, sino en las medidas concretas que este documento detalla y que fueron verificadas una por una.

---

## Cierre

Ingeniero Juárez, gracias por la confianza. Construir su sistema es una responsabilidad que tomo en serio, y cuidarlo es parte de esa responsabilidad.

Quedo a total disposición —suya y de cualquier persona técnica que designe— para ampliar cualquier punto de este informe, mostrar la evidencia detrás de cada medida, o responder las dudas que surjan de su revisión.

Atentamente,

**«[Su nombre]»**
Desarrollador y responsable de seguridad — BDP System
Certificado por Amazon Web Services (AWS)
«[correo de contacto]»

---

### Anexo — Glosario para el lector no técnico

| Término                      | Qué significa, en simple                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| **URL firmada / pre-signed** | Un enlace con "fecha de vencimiento" a un archivo privado. Sirve unos minutos y luego deja de funcionar. |
| **RBAC (control por roles)** | Cada usuario solo puede hacer lo que su rol le permite.                                                  |
| **Hashing / bcrypt**         | Forma de guardar contraseñas de modo que no se puedan leer, ni siquiera desde adentro.                   |
| **HTTPS / TLS**              | El cifrado del "candado" del navegador; protege lo que se envía.                                         |
| **Firewall**                 | Una barrera que decide qué puede y qué no puede entrar al servidor.                                      |
| **SSH por llave**            | Acceso administrativo con una llave digital única, en lugar de una contraseña adivinable.                |
| **Inyección SQL**            | Un ataque clásico a bases de datos; aquí está prevenido por diseño.                                      |
| **Fuerza bruta**             | Intentar miles de contraseñas hasta acertar; aquí está bloqueado.                                        |

---

_Documento generado como parte de la revisión de seguridad integral de BDP System. Para uso informativo del cliente y su equipo. No contiene credenciales ni datos operativos sensibles._
