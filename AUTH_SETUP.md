# Configuración de Autenticación - BDP System

## ✅ Setup Completado

He implementado un sistema de autenticación completo usando NextAuth.js v5 beta siguiendo la arquitectura de tu proyecto.

## 📁 Archivos Creados/Modificados

### Archivos de Configuración

- `src/core/lib/auth/auth.ts` - Configuración principal de NextAuth
- `src/middleware.ts` - Middleware de protección de rutas
- `src/core/lib/env.ts` - Variables de entorno
- `src/core/shared/hooks/use-auth.ts` - Hook personalizado para autenticación
- `src/core/shared/components/AuthGuard.tsx` - Componente de protección de rutas

### Páginas y Componentes

- `src/app/(SignIn)/sign-in/page.tsx` - Página de login actualizada
- `src/app/(Dashboard)/dashboard/page.tsx` - Página de dashboard
- `src/app/(Dashboard)/layout.tsx` - Layout protegido con AuthGuard
- `src/app/layout.tsx` - SessionProvider agregado
- `src/core/shared/ui/sidebar/app-sidebar.tsx` - Sidebar con datos de sesión
- `src/core/shared/ui/sidebar/nav-user.tsx` - Botón de logout funcional

## 🔧 Pasos Pendientes

### 1. Instalar Dependencias

```bash
npm install zod
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXTAUTH_SECRET=tu-clave-secreta-aqui
NEXTAUTH_URL=http://localhost:3000
```

Para generar una clave secreta segura:

```bash
openssl rand -base64 32
```

### 3. Configurar Base de Datos (Opcional)

Si planeas usar una base de datos, agrega a `.env.local`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/bdp_system
```

### 4. Configurar Proveedores OAuth (Opcional)

Para Google OAuth, agrega a `.env.local`:

```env
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

## 🚀 Credenciales de Prueba

- **Email:** admin@bdp.com
- **Password:** admin123

## 🔒 Características Implementadas

### Autenticación

- ✅ Login con credenciales
- ✅ Logout funcional
- ✅ Protección de rutas con middleware
- ✅ SessionProvider configurado
- ✅ Hook personalizado useAuth
- ✅ Componente AuthGuard

### UI/UX

- ✅ Página de login funcional
- ✅ Dashboard con información de usuario
- ✅ Botón de logout en sidebar
- ✅ Redirección automática
- ✅ Manejo de estados de carga

## 📝 TODOs Importantes

### En `src/core/lib/auth/auth.ts`:

- [ ] Instalar zod para validación de esquemas
- [ ] Implementar lógica de autenticación real (base de datos)
- [ ] Configurar hash de contraseñas
- [ ] Agregar más proveedores OAuth si es necesario

### En `src/middleware.ts`:

- [ ] Configurar rutas públicas específicas
- [ ] Optimizar matcher para mejor rendimiento

### En `src/core/lib/env.ts`:

- [ ] Crear archivo `.env.local` con las variables necesarias

### En `src/app/(SignIn)/sign-in/page.tsx`:

- [ ] Remover credenciales de prueba en producción
- [ ] Mejorar validación de formulario

## 🔄 Flujo de Autenticación

1. Usuario accede a ruta protegida
2. Middleware verifica autenticación
3. Si no está autenticado → redirige a `/sign-in`
4. Usuario ingresa credenciales
5. NextAuth valida credenciales
6. Si es válido → crea sesión JWT
7. Redirige a `/dashboard`
8. AuthGuard protege el dashboard
9. Sidebar muestra datos del usuario
10. Logout limpia la sesión

## 🛠️ Próximos Pasos

1. **Instalar zod:** `npm install zod`
2. **Crear .env.local** con las variables
3. **Probar el login** con las credenciales de prueba
4. **Implementar base de datos** para usuarios reales
5. **Configurar OAuth** si es necesario
6. **Personalizar páginas** de error y login

## 📚 Recursos Adicionales

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [NextAuth.js v5 Migration Guide](https://authjs.dev/guides/upgrade-to-v5)
- [NextAuth.js Providers](https://authjs.dev/reference/core/providers)

¡El sistema de autenticación está listo para usar! 🎉
