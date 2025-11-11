import { EntradasSalidasDTO } from "../dtos/EntradasSalidasDto.dto";

export type CreateEntradSalidaArgs = Omit<
  EntradasSalidasDTO,
  "createdAt" | "updatedAt" | "id"
>;
