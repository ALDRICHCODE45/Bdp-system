import { PrismaClient } from "@prisma/client";
import {
  EmpresaRepository,
  CreateEmpresaArgs,
  UpdateEmpresaArgs,
} from "./EmpresaRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaEmpresaRepository implements EmpresaRepository {
  constructor(private prisma: PrismaClient | PrismaTransactionClient) {}

  async create(data: CreateEmpresaArgs) {
    return await this.prisma.empresa.create({
      data: {
        razonSocial: data.razonSocial,
        nombreComercial: data.nombreComercial,
        rfc: data.rfc,
        curp: data.curp,
        direccionFiscal: data.direccionFiscal,
        colonia: data.colonia,
        ciudad: data.ciudad,
        estado: data.estado,
        codigoPostal: data.codigoPostal,
        pais: data.pais ?? undefined,
        bancoPrincipal: data.bancoPrincipal,
        nombreEnTarjetaPrincipal: data.nombreEnTarjetaPrincipal,
        numeroCuentaPrincipal: data.numeroCuentaPrincipal,
        clabePrincipal: data.clabePrincipal,
        fechaExpiracionPrincipal: data.fechaExpiracionPrincipal,
        cvvPrincipal: data.cvvPrincipal,
        bancoSecundario: data.bancoSecundario,
        nombreEnTarjetaSecundario: data.nombreEnTarjetaSecundario,
        numeroCuentaSecundario: data.numeroCuentaSecundario,
        clabeSecundaria: data.clabeSecundaria,
        fechaExpiracionSecundaria: data.fechaExpiracionSecundaria,
        cvvSecundario: data.cvvSecundario,
      },
    });
  }

  async update(data: UpdateEmpresaArgs) {
    return await this.prisma.empresa.update({
      where: { id: data.id },
      data: {
        razonSocial: data.razonSocial,
        nombreComercial: data.nombreComercial,
        rfc: data.rfc,
        curp: data.curp,
        direccionFiscal: data.direccionFiscal,
        colonia: data.colonia,
        ciudad: data.ciudad,
        estado: data.estado,
        codigoPostal: data.codigoPostal,
        pais: data.pais ?? undefined,
        bancoPrincipal: data.bancoPrincipal,
        nombreEnTarjetaPrincipal: data.nombreEnTarjetaPrincipal,
        numeroCuentaPrincipal: data.numeroCuentaPrincipal,
        clabePrincipal: data.clabePrincipal,
        fechaExpiracionPrincipal: data.fechaExpiracionPrincipal,
        cvvPrincipal: data.cvvPrincipal,
        bancoSecundario: data.bancoSecundario,
        nombreEnTarjetaSecundario: data.nombreEnTarjetaSecundario,
        numeroCuentaSecundario: data.numeroCuentaSecundario,
        clabeSecundaria: data.clabeSecundaria,
        fechaExpiracionSecundaria: data.fechaExpiracionSecundaria,
        cvvSecundario: data.cvvSecundario,
      },
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.empresa.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.empresa.findUnique({
      where: { id: data.id },
    });
  }

  async getFirst() {
    return await this.prisma.empresa.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByRfc(data: { rfc: string }) {
    return await this.prisma.empresa.findFirst({
      where: { rfc: data.rfc },
    });
  }
}

