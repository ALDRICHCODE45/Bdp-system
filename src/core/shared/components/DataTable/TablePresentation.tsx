interface Props {
  title: string;
  subtitle: string;
}

export const TablePresentation = ({ subtitle, title }: Props) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      <p className="text-gray-500">{subtitle}</p>
    </div>
  );
};
