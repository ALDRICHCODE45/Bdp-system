import { ClientesProovedoresTablePage } from "@/features/finanzas/clientes-proovedores/pages/ClientesProovedoresTablePage";
import { ClienteProveedorDto } from "@/features/finanzas/clientes-proovedores/server/dtos/ClienteProveedorDto.dto";
import { makeClienteProveedorService } from "@/features/finanzas/clientes-proovedores/server/services/makeClienteProveedorService";
import prisma from "@/core/lib/prisma";
import { toClienteProveedorDtoArray } from "@/features/finanzas/clientes-proovedores/server/mappers/clienteProveedorMapper";

const fetchClientesProveedoresInitialData = async (): Promise<
  ClienteProveedorDto[]
> => {
  const clienteProveedorService = makeClienteProveedorService({ prisma });
  const result = await clienteProveedorService.getAll();
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return toClienteProveedorDtoArray(result.value);
};

const ClientesProovedoresPage = async () => {
  const initialClientesProveedoresData =
    await fetchClientesProveedoresInitialData();

  return (
    <>
      <ClientesProovedoresTablePage
        tableData={initialClientesProveedoresData}
      />
    </>
  );
};

export default ClientesProovedoresPage;
