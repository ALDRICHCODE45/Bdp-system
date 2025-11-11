import { CreateEntradSalidaArgs } from "../dtos/CreateEntradasSalidas.dto";
import { EntradasSalidasDTO } from "../dtos/EntradasSalidasDto.dto";
import { UpdateEntradaSalidaArgs } from "../dtos/UpdateEntadasSalidas.dto";

export interface EntradasSalidasRepository {
  create(data: CreateEntradSalidaArgs): Promise<EntradasSalidasDTO>;
  update(data: UpdateEntradaSalidaArgs): Promise<EntradasSalidasDTO>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<EntradasSalidasDTO | null>;
  findByDestinatario(data: {
    correo: string;
  }): Promise<EntradasSalidasDTO | null>;
  getAll(): Promise<EntradasSalidasDTO[]>;
  registrarSalida(data: { id: string; hora_salida: Date }): Promise<EntradasSalidasDTO>;
}
