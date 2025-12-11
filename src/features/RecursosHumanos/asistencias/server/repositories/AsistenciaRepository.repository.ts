import { AsistenciaDto } from "../Dtos/AsistenciaDto.dto";
import { CreateAsistenciaDto } from "../Dtos/CreateAsistenciaDto.Dto";

export interface AsistenciaRepository {
  getById(data: { id: string }): Promise<AsistenciaDto>;
  create(data: CreateAsistenciaDto): Promise<AsistenciaDto>;
  delete(data: { id: string }): Promise<void>;
}
