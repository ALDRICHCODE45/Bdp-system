import { auth } from "@/core/lib/auth/auth";
import { NextResponse } from "next/server";
import { RoutePermissionGuard } from "@/core/lib/permissions/route-permission-guard";
import { MiddlewarePermissionsService } from "@/core/lib/permissions/middleware-permissions.service";
import { getDefaultRoute } from "@/core/lib/permissions/get-default-route";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Excluir archivos estáticos (imágenes, etc.)
  if (
    nextUrl.pathname.startsWith("/_next/") ||
    nextUrl.pathname.startsWith("/api/") ||
    nextUrl.pathname.includes(".") // Archivos con extensión
  ) {
    return NextResponse.next();
  }

  // Rutas públicas que no requieren autenticación
  const isPublicRoute =
    nextUrl.pathname.startsWith("/sign-in") ||
    nextUrl.pathname.startsWith("/register-qr-entry") ||
    nextUrl.pathname.startsWith("/registro-automatico") ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname === "/access-denied";

  // Si el usuario está logueado y accede a la ruta raíz, redirigir basado en permisos
  if (isLoggedIn && nextUrl.pathname === "/") {
    const userPermissions = MiddlewarePermissionsService.extractPermissions(
      req.auth,
    );
    const defaultRoute = getDefaultRoute(userPermissions);
    return NextResponse.redirect(new URL(defaultRoute, nextUrl));
  }

  // Si el usuario no está logueado y trata de acceder a una ruta protegida
  if (!isLoggedIn && !isPublicRoute && nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  // Si el usuario no está logueado y accede a la ruta raíz, redirigir a login
  if (!isLoggedIn && nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  // Si el usuario está logueado y trata de acceder a la página de login
  if (isLoggedIn && nextUrl.pathname.startsWith("/sign-in")) {
    // Obtener permisos del usuario y redirigir a la ruta por defecto basada en permisos
    const userPermissions = MiddlewarePermissionsService.extractPermissions(
      req.auth,
    );
    const defaultRoute = getDefaultRoute(userPermissions);
    return NextResponse.redirect(new URL(defaultRoute, nextUrl));
  }

  // Verificar permisos usando el guard centralizado
  // El guard maneja: admin:all, rutas públicas, y permisos específicos
  if (isLoggedIn) {
    const accessCheck = RoutePermissionGuard.canAccessRoute(
      req.auth,
      nextUrl.pathname,
    );

    if (!accessCheck.hasAccess) {
      // Redirigir a página de acceso denegado
      return NextResponse.redirect(new URL("/access-denied", nextUrl));
    }
  }

  return NextResponse.next();
});

// TODO: Configurar matcher para optimizar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
