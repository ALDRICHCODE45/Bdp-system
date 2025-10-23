import { auth } from "@/core/lib/auth/auth";
import { NextResponse } from "next/server";

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

  // TODO: Configurar rutas públicas y protegidas según tus necesidades
  const isPublicRoute =
    nextUrl.pathname.startsWith("/sign-in") ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname === "/";

  // Si el usuario no está logueado y trata de acceder a una ruta protegida
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  // Si el usuario está logueado y trata de acceder a la página de login
  if (isLoggedIn && nextUrl.pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
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
