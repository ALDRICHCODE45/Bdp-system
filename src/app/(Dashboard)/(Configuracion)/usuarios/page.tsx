import { UsuariosTablePage } from "@/features/configuracion/usuarios/pages/UsuariosTablePage";
import { makeUserService } from "@/features/configuracion/usuarios/server/services/makeUserService";
import { UserDto } from "@/features/configuracion/usuarios/server/dtos/UserDto.dto";
import prisma from "@/core/lib/prisma";

const fetchUsersInitialData = async (): Promise<UserDto[]> => {
  const userService = makeUserService({ prisma });
  const result = await userService.getAll();
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result.value;
};

const UsuariosPage = async () => {
  const users = await fetchUsersInitialData();

  return (
    <>
      <UsuariosTablePage tableData={users} />
    </>
  );
};
export default UsuariosPage;
