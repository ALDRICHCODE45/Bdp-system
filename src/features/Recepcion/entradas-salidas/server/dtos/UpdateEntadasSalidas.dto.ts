import { CreateEntradSalidaArgs } from "./CreateEntradasSalidas.dto";

export type UpdateEntradaSalidaArgs = Partial<CreateEntradSalidaArgs> & {
  id: string;
};
