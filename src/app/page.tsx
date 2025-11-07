import { redirect } from "next/navigation";
import { auth } from "@/core/lib/auth/auth";
import { MiddlewarePermissionsService } from "@/core/lib/permissions/middleware-permissions.service";
import { getDefaultRoute } from "@/core/lib/permissions/get-default-route";

const HomePage = async () => {
  const session = await auth();
  
  if (!session) {
    return redirect("/sign-in");
  }

  // Obtener permisos del usuario y redirigir a la ruta por defecto
  const userPermissions = MiddlewarePermissionsService.extractPermissions(session);
  const defaultRoute = getDefaultRoute(userPermissions);
  
  return redirect(defaultRoute);
};

export default HomePage;
