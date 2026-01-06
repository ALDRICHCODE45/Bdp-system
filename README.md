# BDP System - Sistema de Gestión Interna

![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.18.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?style=for-the-badge&logo=postgresql)
![Bun](https://img.shields.io/badge/Bun-Latest-000000?style=for-the-badge&logo=bun)

## 📋 Descripción

**BDP System** es un sistema ERP (Enterprise Resource Planning) interno desarrollado para la gestión integral de una organización. El sistema proporciona módulos completos para la administración de finanzas, recursos humanos, recepción y configuración del sistema, con un sistema robusto de autenticación y autorización basado en roles y permisos.

### Características Principales

- 🏦 **Gestión Financiera**: Control de egresos, ingresos, facturas y clientes/proveedores
- 👥 **Recursos Humanos**: Administración de colaboradores, socios y registro de asistencias
- 🚪 **Recepción**: Registro de entradas y salidas de visitantes
- ⚙️ **Sistema**: Gestión de usuarios, roles, permisos y configuración de empresa
- 🔐 **Seguridad**: Autenticación con NextAuth y sistema RBAC (Role-Based Access Control)
- 📁 **Almacenamiento**: Integración con DigitalOcean Spaces para gestión de archivos
- 📊 **Reportes**: Visualización de datos con gráficos y exportación a Excel/PDF

## 🛠️ Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [Next.js](https://nextjs.org/) | 15.5.9 | Framework React con App Router y Server Actions |
| [React](https://react.dev/) | 19.1.2 | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.0 | Tipado estático |
| [Tailwind CSS](https://tailwindcss.com/) | 4.0 | Framework CSS utility-first |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Componentes UI basados en Radix UI |
| [Radix UI](https://www.radix-ui.com/) | Latest | Componentes primitivos accesibles |
| [Lucide React](https://lucide.dev/) | 0.562.0 | Iconos |
| [Motion](https://motion.dev/) | 12.23.24 | Animaciones |
| [Recharts](https://recharts.org/) | 2.15.4 | Gráficos y visualización de datos |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) | 15.5.9 | Acciones del servidor sin API routes |
| [NextAuth.js](https://next-auth.js.org/) | 5.0.0-beta.29 | Autenticación y autorización |
| [Prisma](https://www.prisma.io/) | 6.18.0 | ORM para PostgreSQL |
| [PostgreSQL](https://www.postgresql.org/) | 17 | Base de datos relacional |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | 6.0.0 | Hashing de contraseñas |

### Estado y Formularios

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [TanStack Query](https://tanstack.com/query) | 5.90.6 | Gestión de estado del servidor y caché |
| [TanStack Table](https://tanstack.com/table) | 8.21.3 | Tablas de datos avanzadas |
| [TanStack Form](https://tanstack.com/form) | 1.23.8 | Gestión de formularios |

### Validación y Utilidades

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [Zod](https://zod.dev/) | 4.1.12 | Validación de esquemas TypeScript-first |
| [date-fns](https://date-fns.org/) | 4.1.0 | Manipulación de fechas |
| [jsPDF](https://github.com/parallax/jsPDF) | 3.0.4 | Generación de PDFs |
| [xlsx](https://sheetjs.com/) | 0.18.5 | Exportación a Excel |
| [qrcode](https://www.npmjs.com/package/qrcode) | 1.5.4 | Generación de códigos QR |

### Almacenamiento

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) | 3.937.0 | Cliente S3-compatible (DigitalOcean Spaces) |

### Runtime y Herramientas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [Bun](https://bun.sh/) | Latest | Runtime JavaScript y gestor de paquetes |
| [Docker](https://www.docker.com/) | Latest | Contenedorización de PostgreSQL |
| [ESLint](https://eslint.org/) | 9.0 | Linter de código |
| [Turbopack](https://turbo.build/pack) | Built-in | Bundler de Next.js (modo experimental) |

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura basada en features (Feature-Based Architecture)**, organizando el código por dominios de negocio en lugar de por tipo de archivo. Esta estructura facilita el escalado y mantenimiento del código.

### Estructura de Carpetas

```mermaid
graph TD
    A[src/] --> B[app/]
    A --> C[features/]
    A --> D[core/]
    
    B --> B1[Dashboard/]
    B --> B2[Public/]
    B --> B3[SignIn/]
    B --> B4[api/]
    
    C --> C1[Auth/]
    C --> C2[finanzas/]
    C --> C3[RecursosHumanos/]
    C --> C4[Recepcion/]
    C --> C5[sistema/]
    C --> C6[Files/]
    
    C2 --> C2A[egresos/]
    C2 --> C2B[ingresos/]
    C2 --> C2C[facturas/]
    C2 --> C2D[clientes-proovedores/]
    
    C3 --> C3A[colaboradores/]
    C3 --> C3B[socios/]
    C3 --> C3C[asistencias/]
    
    D --> D1[shared/]
    D --> D2[lib/]
    D --> D3[seed/]
    
    D1 --> D1A[components/]
    D1 --> D1B[hooks/]
    D1 --> D1C[ui/]
    D1 --> D1D[providers/]
    
    D2 --> D2A[auth/]
    D2 --> D2B[permissions/]
    D2 --> D2C[prisma.ts]
```

### Capas de la Arquitectura

#### 1. **`src/app/`** - Capa de Presentación (Next.js App Router)
- **`(Dashboard)/`**: Rutas protegidas del dashboard principal
  - `(Finanzas)/`: Módulos financieros
  - `(RecursosHumanos)/`: Módulos de RRHH
  - `(Recepcion)/`: Módulo de recepción
  - `(Sistema)/`: Configuración y administración
- **`(Public)/`**: Rutas públicas (registro QR, registro automático)
- **`(SignIn)/`**: Página de autenticación
- **`api/`**: API routes (NextAuth handlers)

#### 2. **`src/features/`** - Capa de Dominio (Features)
Cada feature contiene su propia estructura completa:
```
feature-name/
├── components/     # Componentes React específicos del feature
├── hooks/         # Custom hooks
├── pages/         # Páginas del feature
├── schemas/       # Esquemas Zod para validación
├── server/        # Lógica del servidor
│   ├── actions/   # Server Actions
│   ├── repositories/  # Repositorios de datos
│   ├── services/  # Servicios de negocio
│   ├── dtos/      # Data Transfer Objects
│   └── entities/  # Entidades de dominio
└── types/         # Tipos TypeScript
```

#### 3. **`src/core/shared/`** - Código Compartido
- **`components/`**: Componentes reutilizables (AuthGuard, BreadcrumbNavbar, etc.)
- **`ui/`**: Componentes UI de shadcn/ui
- **`hooks/`**: Hooks compartidos
- **`providers/`**: Providers de React (QueryProvider, ThemeProvider)
- **`helpers/`**: Funciones auxiliares
- **`config/`**: Configuraciones compartidas

#### 4. **`src/core/lib/`** - Librerías Core
- **`auth/`**: Configuración de NextAuth
- **`permissions/`**: Sistema de permisos y guards
- **`prisma.ts`**: Cliente de Prisma singleton

### Sistema de Permisos (RBAC)

El sistema implementa un modelo de **Role-Based Access Control (RBAC)** con las siguientes características:

- **Roles**: Grupos de usuarios con permisos asignados
- **Permisos**: Acciones específicas sobre recursos (ej: `finanzas:egresos:create`)
- **Middleware**: Verificación automática de permisos en rutas
- **Guards**: Componentes y funciones para proteger acciones

```mermaid
graph LR
    A[Usuario] --> B[Roles]
    B --> C[Permisos]
    C --> D[Recursos]
    
    D --> D1[Finanzas]
    D --> D2[RRHH]
    D --> D3[Recepción]
    D --> D4[Sistema]
```

## 📦 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instaladas las siguientes herramientas:

| Herramienta | Versión Mínima | Descripción |
|-------------|----------------|-------------|
| [Bun](https://bun.sh/) | Latest | Runtime JavaScript y gestor de paquetes |
| [Docker](https://www.docker.com/) | 20.10+ | Para ejecutar PostgreSQL en contenedor |
| [Docker Compose](https://docs.docker.com/compose/) | 2.0+ | Para orquestar servicios |
| [Git](https://git-scm.com/) | 2.30+ | Control de versiones |
| Cuenta DigitalOcean Spaces | - | Para almacenamiento de archivos (o AWS S3) |

> **Nota**: Aunque el proyecto usa Bun, también puedes usar Node.js 18+ y npm/pnpm/yarn como alternativa.

## 🚀 Instalación y Configuración

### Paso 1: Clonar el Repositorio

```bash
git clone <repository-url>
cd bdp-system
```

### Paso 2: Instalar Dependencias

```bash
bun install
```

Si no tienes Bun instalado:

```bash
# Instalar Bun (Linux/macOS)
curl -fsSL https://bun.sh/install | bash

# O usar npm/pnpm/yarn
npm install
# o
pnpm install
# o
yarn install
```

### Paso 3: Configurar Base de Datos con Docker

Inicia el contenedor de PostgreSQL:

```bash
docker-compose up -d
```

Esto creará un contenedor PostgreSQL con:
- **Usuario**: `admin`
- **Contraseña**: `secreto`
- **Base de datos**: `bdpDB`
- **Puerto**: `5432`

> **Importante**: Para producción, cambia las credenciales en `docker-compose.yml`.

### Paso 4: Configurar Variables de Entorno

Crea los archivos `.env` y `.env.local` en la raíz del proyecto:

```bash
# Copiar templates (si existen)
cp .env.template .env
cp .env.local.template .env.local
```

Luego configura las variables (ver sección [Variables de Entorno](#-variables-de-entorno)).

### Paso 5: Ejecutar Migraciones de Prisma

```bash
bun run prisma:deploy
```

Este comando:
1. Aplica todas las migraciones pendientes
2. Genera el cliente de Prisma

### Paso 6: Ejecutar Seed de Datos Iniciales

```bash
bun run seed
```

Esto creará:
- Permisos del sistema
- Rol de administrador
- Usuario administrador por defecto

### Paso 7: Iniciar Servidor de Desarrollo

```bash
bun run dev
```

La aplicación estará disponible en: **http://localhost:3000**

> **Nota**: El servidor usa Turbopack para compilación más rápida.

## 🔐 Variables de Entorno

El proyecto requiere las siguientes variables de entorno. Todas son **obligatorias** excepto donde se indique lo contrario.

### Autenticación

| Variable | Tipo | Descripción | Ejemplo |
|----------|------|-------------|---------|
| `AUTH_SECRET` | `string` | Secreto para firmar tokens JWT (mínimo 32 caracteres) | `tu-secreto-super-seguro-de-al-menos-32-caracteres` |
| `NEXTAUTH_URL` | `url` | URL base de la aplicación | `http://localhost:3000` |
| `AUTH_TRUST_HOST` | `boolean` | Confiar en el header Host (true en producción) | `true` |
| `AUTH_ORIGIN` | `url` | Origen permitido para autenticación | `http://localhost:3000` |

### Base de Datos

| Variable | Tipo | Descripción | Ejemplo |
|----------|------|-------------|---------|
| `DATABASE_URL` | `url` | URL de conexión a PostgreSQL | `postgresql://admin:secreto@localhost:5432/bdpDB` |

### DigitalOcean Spaces (Almacenamiento)

| Variable | Tipo | Descripción | Ejemplo |
|----------|------|-------------|---------|
| `DO_SPACES_ENDPOINT` | `url` | Endpoint de DigitalOcean Spaces | `https://nyc3.digitaloceanspaces.com` |
| `DO_ACCESS_KEY` | `string` | Access Key de DigitalOcean | `tu-access-key` |
| `DO_SECRET_KEY` | `string` | Secret Key de DigitalOcean | `tu-secret-key` |
| `DO_SPACES_BUCKET` | `string` | Nombre del bucket | `bdp-files` |
| `DO_SPACES_REGION` | `string` | Región del bucket | `nyc3` |

### Entorno

| Variable | Tipo | Descripción | Valor por Defecto |
|----------|------|-------------|-------------------|
| `NODE_ENV` | `enum` | Entorno de ejecución (`development`, `production`, `test`) | `development` |

### Ejemplo de Archivo `.env`

```env
# Autenticación
AUTH_SECRET=tu-secreto-super-seguro-de-al-menos-32-caracteres-aqui
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
AUTH_ORIGIN=http://localhost:3000

# Base de Datos
DATABASE_URL=postgresql://admin:secreto@localhost:5432/bdpDB

# DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_ACCESS_KEY=tu-access-key
DO_SECRET_KEY=tu-secret-key
DO_SPACES_BUCKET=bdp-files
DO_SPACES_REGION=nyc3

# Entorno
NODE_ENV=development
```

> **Seguridad**: Nunca commitees archivos `.env` o `.env.local` al repositorio. Están en `.gitignore` por defecto.

## 📜 Scripts Disponibles

El proyecto incluye los siguientes scripts en `package.json`:

| Script | Comando | Descripción |
|--------|---------|-------------|
| **dev** | `bun run dev` | Inicia el servidor de desarrollo con Turbopack |
| **build** | `bun run build` | Construye la aplicación para producción y ejecuta migraciones |
| **start** | `bun run start` | Inicia el servidor de producción |
| **lint** | `bun run lint` | Ejecuta ESLint para verificar el código |
| **seed** | `bun run seed` | Ejecuta el seed de datos iniciales |
| **prisma:deploy** | `bun run prisma:deploy` | Aplica migraciones y genera el cliente Prisma |
| **prisma:studio** | `bun run prisma:studio` | Abre Prisma Studio (GUI para la base de datos) |

### Ejemplos de Uso

```bash
# Desarrollo
bun run dev

# Producción
bun run build
bun run start

# Base de datos
bun run prisma:studio  # Abre interfaz gráfica
bun run prisma:deploy   # Aplica migraciones

# Datos iniciales
bun run seed
```

## 📁 Estructura del Proyecto

```
bdp-system/
├── prisma/                    # Configuración de Prisma
│   ├── migrations/           # Migraciones de base de datos
│   └── schema.prisma         # Esquema de la base de datos
├── public/                   # Archivos estáticos
│   └── signIn/              # Assets de login
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (Dashboard)/     # Rutas protegidas del dashboard
│   │   ├── (Public)/        # Rutas públicas
│   │   ├── (SignIn)/        # Autenticación
│   │   ├── api/             # API routes
│   │   └── layout.tsx       # Layout raíz
│   ├── core/                # Código core del sistema
│   │   ├── lib/            # Librerías (auth, prisma, permissions)
│   │   ├── seed/          # Scripts de seed
│   │   └── shared/         # Código compartido
│   │       ├── components/ # Componentes reutilizables
│   │       ├── hooks/      # Hooks compartidos
│   │       ├── ui/         # Componentes UI (shadcn)
│   │       └── providers/  # Providers de React
│   └── features/           # Features del sistema
│       ├── Auth/          # Autenticación
│       ├── finanzas/      # Módulos financieros
│       ├── RecursosHumanos/ # RRHH
│       ├── Recepcion/     # Recepción
│       ├── sistema/       # Configuración
│       └── Files/         # Gestión de archivos
├── docker-compose.yml      # Configuración de Docker
├── next.config.ts         # Configuración de Next.js
├── package.json           # Dependencias y scripts
├── tsconfig.json          # Configuración de TypeScript
└── README.md             # Este archivo
```

## 🎯 Módulos del Sistema

### 💰 Finanzas

Gestión completa del ciclo financiero de la organización.

#### Egresos
- Registro de gastos y pagos
- Clasificación por categorías (Gastos OP, Honorarios, Servicios, etc.)
- Estados: Pagado, Pendiente, Cancelado
- Relación con proveedores y socios
- Historial de cambios

#### Ingresos
- Registro de ingresos y cobros
- Gestión de facturación a clientes
- Estados: Pagado, Pendiente, Cancelado
- Relación con clientes y proyectos
- Historial de cambios

#### Facturas
- Gestión de facturas emitidas y recibidas
- Estados: Borrador, Enviada, Pagada, Cancelada
- Vinculación con ingresos/egresos
- Datos fiscales completos (RFC, folio fiscal)
- Historial de cambios

#### Clientes/Proveedores
- CRUD completo de clientes y proveedores
- Datos bancarios y fiscales
- Relación con socios
- Historial de cambios

### 👥 Recursos Humanos

Administración del capital humano de la organización.

#### Colaboradores
- Información personal completa
- Datos laborales (puesto, sueldo, banco, CLABE)
- Estados: Contratado, Despedido
- Relación con socios
- Historial de cambios
- Integración con asistencias

#### Socios
- Gestión de socios de la empresa
- Relación con colaboradores
- Autorización de egresos/ingresos
- Gestión de departamentos

#### Asistencias
- Registro de entradas y salidas
- Vinculación con colaboradores por correo
- Visualización de gráficos de asistencia
- Registro automático vía QR

### 🚪 Recepción

Control de visitantes y correspondencia.

#### Entradas y Salidas
- Registro de visitantes
- Destinatario y motivo de visita
- Control de correspondencia
- Horarios de entrada y salida

### ⚙️ Sistema

Configuración y administración del sistema.

#### Usuarios
- CRUD de usuarios del sistema
- Asignación de roles
- Activación/desactivación de usuarios

#### Roles y Permisos
- Gestión de roles
- Asignación de permisos a roles
- Sistema granular de permisos por recurso y acción

#### Configuración
- Datos de la empresa (razón social, RFC, dirección fiscal)
- Información bancaria
- Configuración general del sistema

## 💻 Uso

### Acceso a la Aplicación

1. Inicia el servidor de desarrollo:
   ```bash
   bun run dev
   ```

2. Abre tu navegador en: **http://localhost:3000**

3. Serás redirigido a la página de login (`/sign-in`)

### Autenticación

1. **Login**: Usa las credenciales del usuario administrador creado con el seed
2. **Redirección**: Después del login, serás redirigido según tus permisos
3. **Sesión**: La sesión se mantiene con JWT tokens

### Navegación

El sistema incluye una **sidebar** con navegación por módulos:
- **Finanzas**: Egresos, Ingresos, Facturas, Clientes/Proveedores
- **Recursos Humanos**: Colaboradores, Socios, Asistencias
- **Recepción**: Entradas y Salidas
- **Sistema**: Usuarios, Roles, Permisos, Configuración

### Ejemplos de Uso por Módulo

#### Crear un Egreso

1. Navega a **Finanzas > Egresos**
2. Haz clic en "Nuevo Egreso"
3. Completa el formulario:
   - Concepto, clasificación, categoría
   - Proveedor (selecciona o crea uno nuevo)
   - Datos de factura (número, folio fiscal)
   - Monto, forma de pago, estado
4. Guarda el egreso

#### Registrar Asistencia

1. Navega a **Recursos Humanos > Asistencias**
2. Selecciona el colaborador
3. El sistema mostrará su historial de asistencias
4. Las asistencias también se pueden registrar automáticamente vía QR

#### Gestionar Usuarios

1. Navega a **Sistema > Usuarios**
2. Crea, edita o desactiva usuarios
3. Asigna roles a cada usuario
4. Los permisos se heredan de los roles asignados

## 🗄️ Base de Datos

### Modelos Principales

El esquema de Prisma define los siguientes modelos principales:

#### Entidades de Negocio

- **`Socio`**: Socios de la empresa
- **`Colaborador`**: Empleados y colaboradores
- **`ClienteProveedor`**: Clientes y proveedores
- **`Egreso`**: Gastos y pagos
- **`Ingreso`**: Ingresos y cobros
- **`Factura`**: Facturas emitidas/recibidas
- **`EntradasSalidas`**: Registro de visitantes
- **`Asistencia`**: Registro de asistencias de colaboradores

#### Entidades del Sistema

- **`User`**: Usuarios del sistema
- **`Role`**: Roles de usuario
- **`Permission`**: Permisos del sistema
- **`RolePermission`**: Relación roles-permisos
- **`UserRole`**: Relación usuarios-roles
- **`Empresa`**: Configuración de la empresa
- **`FileAttachment`**: Archivos adjuntos

#### Historiales

Cada entidad principal tiene su tabla de historial:
- `ColaboradorHistorial`
- `ClienteProveedorHistorial`
- `EgresoHistorial`
- `IngresoHistorial`
- `FacturaHistorial`

### Relaciones Principales

```mermaid
erDiagram
    User ||--o{ UserRole : tiene
    Role ||--o{ UserRole : asignado
    Role ||--o{ RolePermission : tiene
    Permission ||--o{ RolePermission : asignado
    
    Socio ||--o{ Colaborador : gestiona
    Socio ||--o{ Egreso : solicita
    Socio ||--o{ Ingreso : autoriza
    
    Colaborador ||--o{ Asistencia : registra
    ClienteProveedor ||--o{ Egreso : provee
    ClienteProveedor ||--o{ Ingreso : paga
    ClienteProveedor ||--o{ Factura : relacionado
    
    Egreso ||--o{ EgresoHistorial : tiene
    Ingreso ||--o{ IngresoHistorial : tiene
    Factura ||--o{ FacturaHistorial : tiene
```

### Comandos Útiles de Prisma

```bash
# Abrir Prisma Studio (GUI)
bun run prisma:studio

# Aplicar migraciones
bun run prisma:deploy

# Crear nueva migración
bunx prisma migrate dev --name nombre_migracion

# Generar cliente Prisma
bunx prisma generate

# Ver estado de migraciones
bunx prisma migrate status

# Resetear base de datos (¡CUIDADO! Borra todos los datos)
bunx prisma migrate reset
```

## 🔧 Desarrollo

### Agregar una Nueva Feature

Para agregar una nueva feature al sistema, sigue esta estructura:

```
src/features/nueva-feature/
├── components/
│   └── NuevaFeatureForm.tsx
├── hooks/
│   └── useNuevaFeature.ts
├── pages/
│   └── NuevaFeaturePage.tsx
├── schemas/
│   └── nuevaFeature.schema.ts
├── server/
│   ├── actions/
│   │   └── createNuevaFeatureAction.ts
│   ├── repositories/
│   │   └── NuevaFeatureRepository.repository.ts
│   ├── services/
│   │   └── NuevaFeatureService.ts
│   ├── dtos/
│   │   └── CreateNuevaFeatureDto.ts
│   └── entities/
│       └── NuevaFeature.entity.ts
└── types/
    └── NuevaFeature.types.ts
```

### Convenciones de Código

1. **Nombres de archivos**: Usar PascalCase para componentes, camelCase para funciones/archivos
2. **Componentes**: Usar componentes funcionales con TypeScript
3. **Server Actions**: Prefijo `Action` en el nombre (ej: `createEgresoAction.ts`)
4. **Repositorios**: Sufijo `Repository` (ej: `PrismaEgresoRepository.repository.ts`)
5. **Validación**: Usar Zod para todos los esquemas de validación
6. **Tipos**: Definir tipos en archivos `types/` dentro de cada feature

### Estructura de un Server Action

```typescript
'use server'

import { z } from 'zod'
import prisma from '@/core/lib/prisma'

const schema = z.object({
  // Definir esquema
})

export async function createNuevaFeatureAction(data: unknown) {
  // Validar
  const validated = schema.parse(data)
  
  // Ejecutar lógica
  const result = await prisma.nuevaFeature.create({
    data: validated
  })
  
  return { success: true, data: result }
}
```

### Testing

> **Nota**: El proyecto actualmente no incluye tests. Se recomienda agregar:
> - Tests unitarios con Vitest
> - Tests de integración para Server Actions
> - Tests E2E con Playwright

## 🤝 Contribución

### Proceso de Contribución

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

### Estándares de Código

- ✅ Usar TypeScript estricto
- ✅ Seguir la estructura de features establecida
- ✅ Documentar funciones complejas
- ✅ Usar ESLint (se ejecuta en CI/CD)
- ✅ Mantener componentes pequeños y reutilizables
- ✅ Usar Server Actions en lugar de API Routes cuando sea posible

### Commit Messages

Usa mensajes descriptivos:
- `feat: agregar exportación a Excel en egresos`
- `fix: corregir validación de fecha en facturas`
- `refactor: mejorar estructura de repositorios`
- `docs: actualizar README con nueva feature`

### Code Review

- Todos los PRs requieren revisión
- Los tests deben pasar antes de merge
- El código debe seguir las convenciones establecidas

## 📝 Licencia

Este proyecto es privado y de uso interno. Todos los derechos reservados.

## 📞 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ usando Next.js, React y TypeScript**
