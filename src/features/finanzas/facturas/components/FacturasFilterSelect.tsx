import { Label } from "@/core/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/shared/ui/select";

interface FacturasFilterSelectProps {
  value: string;
  label: string;
  options: readonly { value: string; label: string }[];
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const FacturasFilterSelect = ({
  label,
  onValueChange,
  options,
  value,
  placeholder,
}: FacturasFilterSelectProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="categoria-filter" className="text-xs font-medium">
          Tipo
        </Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            {options.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
