import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";

interface Props {
  colaborador: ColaboradorDto;
}

export const ColaboradorIndividualPage = ({ colaborador }: Props) => {
  return (
    <>
      <div>informacion del colaborador</div>
    </>
  );
};
