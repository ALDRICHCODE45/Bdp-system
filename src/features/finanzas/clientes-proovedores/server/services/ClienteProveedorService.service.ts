import {
  ClienteProveedorRepository,
  ClienteProveedorEntity,
} from "../repositories/ClienteProveedorRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { PrismaClient } from "@prisma/client";

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
};

export class ClienteProveedorService {
  constructor(
    private clienteProveedorRepository: ClienteProveedorRepository,
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

      const clienteProveedor = await this.clienteProveedorRepository.create(
        input
      );

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

      const clienteProveedor = await this.clienteProveedorRepository.update(
        input
      );

      return Ok(clienteProveedor);
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
}
