import { PrismaClient } from "@prisma/client";
import { EmpresaRepository } from "../repositories/EmpresaRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { ConflictError } from "@/core/shared/errors/domain";

type CreateEmpresaInput = {
  razonSocial?: string | null;
  nombreComercial?: string | null;
  rfc?: string | null;
  curp?: string | null;
  direccionFiscal?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  pais?: string;
  bancoPrincipal?: string | null;
  nombreEnTarjetaPrincipal?: string | null;
  numeroCuentaPrincipal?: string | null;
  clabePrincipal?: string | null;
  fechaExpiracionPrincipal?: Date | null;
  cvvPrincipal?: number | null;
  bancoSecundario?: string | null;
  nombreEnTarjetaSecundario?: string | null;
  numeroCuentaSecundario?: string | null;
  clabeSecundaria?: string | null;
  fechaExpiracionSecundaria?: Date | null;
  cvvSecundario?: number | null;
};

type UpdateEmpresaInput = {
  id: string;
  razonSocial?: string | null;
  nombreComercial?: string | null;
  rfc?: string | null;
  curp?: string | null;
  direccionFiscal?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  pais?: string;
  bancoPrincipal?: string | null;
  nombreEnTarjetaPrincipal?: string | null;
  numeroCuentaPrincipal?: string | null;
  clabePrincipal?: string | null;
  fechaExpiracionPrincipal?: Date | null;
  cvvPrincipal?: number | null;
  bancoSecundario?: string | null;
  nombreEnTarjetaSecundario?: string | null;
  numeroCuentaSecundario?: string | null;
  clabeSecundaria?: string | null;
  fechaExpiracionSecundaria?: Date | null;
  cvvSecundario?: number | null;
};

export class EmpresaService {
  constructor(
    private empresaRepository: EmpresaRepository,
    private prisma: PrismaClient
  ) {}

  async create(
    input: CreateEmpresaInput
  ): Promise<Result<import("@prisma/client").Empresa, Error>> {
    try {
      // Validar que el RFC no exista si se proporciona
      if (input.rfc && input.rfc.trim() !== "") {
        const existingEmpresa = await this.empresaRepository.findByRfc({
          rfc: input.rfc,
        });

        if (existingEmpresa) {
          return Err(
            new ConflictError(
              "RFC_EXISTENTE",
              "Ya existe una empresa con ese RFC"
            )
          );
        }
      }

      const empresa = await this.empresaRepository.create({
        razonSocial: input.razonSocial,
        nombreComercial: input.nombreComercial,
        rfc: input.rfc,
        curp: input.curp,
        direccionFiscal: input.direccionFiscal,
        colonia: input.colonia,
        ciudad: input.ciudad,
        estado: input.estado,
        codigoPostal: input.codigoPostal,
        pais: input.pais,
        bancoPrincipal: input.bancoPrincipal,
        nombreEnTarjetaPrincipal: input.nombreEnTarjetaPrincipal,
        numeroCuentaPrincipal: input.numeroCuentaPrincipal,
        clabePrincipal: input.clabePrincipal,
        fechaExpiracionPrincipal: input.fechaExpiracionPrincipal,
        cvvPrincipal: input.cvvPrincipal,
        bancoSecundario: input.bancoSecundario,
        nombreEnTarjetaSecundario: input.nombreEnTarjetaSecundario,
        numeroCuentaSecundario: input.numeroCuentaSecundario,
        clabeSecundaria: input.clabeSecundaria,
        fechaExpiracionSecundaria: input.fechaExpiracionSecundaria,
        cvvSecundario: input.cvvSecundario,
      });

      return Ok(empresa);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear empresa")
      );
    }
  }

  async update(
    input: UpdateEmpresaInput
  ): Promise<Result<import("@prisma/client").Empresa, Error>> {
    try {
      // Verificar que la empresa existe
      const existingEmpresa = await this.empresaRepository.findById({
        id: input.id,
      });

      if (!existingEmpresa) {
        return Err(
          new ConflictError("EMPRESA_NO_ENCONTRADA", "La empresa no existe")
        );
      }

      // Validar que el RFC no exista en otra empresa si se proporciona
      if (input.rfc && input.rfc.trim() !== "") {
        const empresaWithRfc = await this.empresaRepository.findByRfc({
          rfc: input.rfc,
        });

        if (empresaWithRfc && empresaWithRfc.id !== input.id) {
          return Err(
            new ConflictError(
              "RFC_EXISTENTE",
              "Ya existe otra empresa con ese RFC"
            )
          );
        }
      }

      const updatedEmpresa = await this.empresaRepository.update({
        id: input.id,
        razonSocial: input.razonSocial,
        nombreComercial: input.nombreComercial,
        rfc: input.rfc,
        curp: input.curp,
        direccionFiscal: input.direccionFiscal,
        colonia: input.colonia,
        ciudad: input.ciudad,
        estado: input.estado,
        codigoPostal: input.codigoPostal,
        pais: input.pais,
        bancoPrincipal: input.bancoPrincipal,
        nombreEnTarjetaPrincipal: input.nombreEnTarjetaPrincipal,
        numeroCuentaPrincipal: input.numeroCuentaPrincipal,
        clabePrincipal: input.clabePrincipal,
        fechaExpiracionPrincipal: input.fechaExpiracionPrincipal,
        cvvPrincipal: input.cvvPrincipal,
        bancoSecundario: input.bancoSecundario,
        nombreEnTarjetaSecundario: input.nombreEnTarjetaSecundario,
        numeroCuentaSecundario: input.numeroCuentaSecundario,
        clabeSecundaria: input.clabeSecundaria,
        fechaExpiracionSecundaria: input.fechaExpiracionSecundaria,
        cvvSecundario: input.cvvSecundario,
      });

      return Ok(updatedEmpresa);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar empresa")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      // Verificar que la empresa existe
      const existingEmpresa = await this.empresaRepository.findById({ id });

      if (!existingEmpresa) {
        return Err(
          new ConflictError("EMPRESA_NO_ENCONTRADA", "La empresa no existe")
        );
      }

      await this.empresaRepository.delete({ id });

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar empresa")
      );
    }
  }

  async getById(
    id: string
  ): Promise<Result<import("@prisma/client").Empresa, Error>> {
    try {
      const empresa = await this.empresaRepository.findById({ id });

      if (!empresa) {
        return Err(
          new ConflictError("EMPRESA_NO_ENCONTRADA", "La empresa no existe")
        );
      }

      return Ok(empresa);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener empresa")
      );
    }
  }

  async getFirst(): Promise<
    Result<import("@prisma/client").Empresa | null, Error>
  > {
    try {
      const empresa = await this.empresaRepository.getFirst();
      return Ok(empresa);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener empresa")
      );
    }
  }
}

