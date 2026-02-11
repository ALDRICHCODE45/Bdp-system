import { AsistenciaDto } from "../Dtos/AsistenciaDto.dto";
import { CreateAsistenciaDto } from "../Dtos/CreateAsistenciaDto.Dto";
import { AsistenciaWithColaborador } from "../mappers/AsistenciaMapper";

export interface AsistenciaRepository {
  getById(data: { id: string }): Promise<AsistenciaDto>;
  create(data: CreateAsistenciaDto): Promise<AsistenciaDto>;
  delete(data: { id: string }): Promise<void>;
  getAll(): Promise<AsistenciaWithColaborador[]>;
  getByCorreo(correo: string): Promise<AsistenciaWithColaborador[]>;
  getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<{ data: AsistenciaWithColaborador[]; totalCount: number }>;
}
