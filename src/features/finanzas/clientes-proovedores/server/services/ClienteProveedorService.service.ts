import {
  ClienteProveedorRepository,
  ClienteProveedorEntity,
} from "../repositories/ClienteProveedorRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { PrismaClient } from "@prisma/client";
import { ClienteProveedorHistorialService } from "./ClienteProveedorHistorialService.service";

type CreateClienteProveedorInput = {
  nombre: string;
  rfc: string;
  tipo: "CLIENTE" | "PROVEEDOR";
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  numeroCuenta?: string | null;
  clabe?: string | null;
  banco?: string | null;
  activo: boolean;
  fechaRegistro: Date;
  notas?: string | null;
  socioId?: string | null;
  ingresadoPor?: string | null;
  usuarioId?: string | null;
};

type UpdateClienteProveedorInput = {
  id: string;
  nombre: string;
  rfc: string;
  tipo: "CLIENTE" | "PROVEEDOR";
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  numeroCuenta?: string | null;
  clabe?: string | null;
  banco?: string | null;
  activo: boolean;
  fechaRegistro: Date;
  notas?: string | null;
  socioId?: string | null;
  usuarioId?: string | null;
};

export class ClienteProveedorService {
  constructor(
    private clienteProveedorRepository: ClienteProveedorRepository,
    private historialService: ClienteProveedorHistorialService,
    private prisma: PrismaClient
  ) {}

  async create(
    input: CreateClienteProveedorInput
  ): Promise<Result<ClienteProveedorEntity, Error>> {
    try {
      // Validar que el RFC no exista para ese tipo
      const rfcExists = await this.clienteProveedorRepository.findByRfcAndTipo({
        rfc: input.rfc,
        tipo: input.tipo,
      });

      if (rfcExists) {
        return Err(
          new Error(`Ya existe un ${input.tipo.toLowerCase()} con ese RFC`)
        );
      }

      // Verificar que el socio existe si se proporciona socioId
      if (input.socioId) {
        const socio = await this.prisma.socio.findUnique({
          where: { id: input.socioId },
        });

        if (!socio) {
          return Err(new Error("El socio responsable no existe"));
        }
      }

      const clienteProveedor = await this.clienteProveedorRepository.create({
        ...input,
        ingresadoPor: input.usuarioId || null,
      });

      // Crear historial para el nuevo cliente/proveedor
      const historialResult =
        await this.historialService.createHistorialForNewClienteProveedor(
          clienteProveedor,
          input.usuarioId
        );

      if (!historialResult.ok) {
        // Si falla la creación del historial, no fallar la creación del cliente/proveedor
        // pero registrar el error
        console.error(
          "Error al crear historial para nuevo cliente/proveedor:",
          historialResult.error
        );
      }

      return Ok(clienteProveedor);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear cliente/proveedor")
      );
    }
  }

  async update(
    input: UpdateClienteProveedorInput
  ): Promise<Result<ClienteProveedorEntity, Error>> {
    try {
      // Verificar que el cliente/proveedor existe
      const existing = await this.clienteProveedorRepository.findById({
        id: input.id,
      });

      if (!existing) {
        return Err(new Error("Cliente/proveedor no encontrado"));
      }

      // Verificar que el socio existe si se proporciona socioId
      if (input.socioId) {
        const socio = await this.prisma.socio.findUnique({
          where: { id: input.socioId },
        });

        if (!socio) {
          return Err(new Error("El socio responsable no existe"));
        }
      }

      // Si cambió el RFC, validar que no exista para ese tipo
      if (input.rfc !== existing.rfc || input.tipo !== existing.tipo) {
        const rfcExists =
          await this.clienteProveedorRepository.findByRfcAndTipo({
            rfc: input.rfc,
            tipo: input.tipo,
          });

        if (rfcExists) {
          return Err(
            new Error(`Ya existe un ${input.tipo.toLowerCase()} con ese RFC`)
          );
        }
      }

      // Usar transacción para actualizar cliente/proveedor y crear historial de forma atómica
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear repositorio temporal con el cliente de transacción
        const { PrismaClienteProveedorRepository } = await import(
          "../repositories/PrismaClienteProveedorRepository.repository"
        );
        const { PrismaClienteProveedorHistorialRepository } = await import(
          "../repositories/PrismaClienteProveedorHistorialRepository.repository"
        );
        const { ClienteProveedorHistorialService } = await import(
          "./ClienteProveedorHistorialService.service"
        );

        const tempClienteProveedorRepository = new PrismaClienteProveedorRepository(
          tx
        );
        const tempHistorialRepository =
          new PrismaClienteProveedorHistorialRepository(tx);
        const tempHistorialService = new ClienteProveedorHistorialService(
          tempHistorialRepository
        );

        // Actualizar cliente/proveedor
        const updatedClienteProveedor = await tempClienteProveedorRepository.update(
          input
        );

        // Crear historial para los cambios
        const historialResult =
          await tempHistorialService.createHistorialForUpdate(
            existing,
            updatedClienteProveedor,
            input.usuarioId
          );

        if (!historialResult.ok) {
          throw new Error(
            `Error al crear historial: ${historialResult.error.message}`
          );
        }

        return updatedClienteProveedor;
      });

      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar cliente/proveedor")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      // Verificar que el cliente/proveedor existe
      const existing = await this.clienteProveedorRepository.findById({ id });

      if (!existing) {
        return Err(new Error("Cliente/proveedor no encontrado"));
      }

      await this.clienteProveedorRepository.delete({ id });

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar cliente/proveedor")
      );
    }
  }

  async getById(id: string): Promise<Result<ClienteProveedorEntity, Error>> {
    try {
      const clienteProveedor = await this.clienteProveedorRepository.findById({
        id,
      });

      if (!clienteProveedor) {
        return Err(new Error("Cliente/proveedor no encontrado"));
      }

      return Ok(clienteProveedor);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener cliente/proveedor")
      );
    }
  }

  async getAll(): Promise<Result<ClienteProveedorEntity[], Error>> {
    try {
      const clientesProveedores =
        await this.clienteProveedorRepository.getAll();
      return Ok(clientesProveedores);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener clientes/proveedores")
      );
    }
  }

  async getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<Result<{ data: ClienteProveedorEntity[]; totalCount: number }, Error>> {
    try {
      const result = await this.clienteProveedorRepository.getPaginated(params);
      return Ok(result);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Error al obtener clientes/proveedores paginados"));
    }
  }
}
