import { showToast } from "@/core/shared/helpers/CustomToast";
import { useCopyToClipboard } from "@/core/shared/hooks/use-copy-to-clipboard";
import { Button } from "@/core/shared/ui/button";
import { Card } from "@/core/shared/ui/card";
import { Check, Copy, LucideIcon } from "lucide-react";
import { useEffect } from "react";

interface Props {
  Icon: LucideIcon;
  title: string;
  content: string;
}

export const ColaboradorProfileHeaderCardBasicInformation = ({
  Icon,
  content,
  title,
}: Props) => {
  const { copied, copyToClipboard, error } = useCopyToClipboard();

  useEffect(() => {
    if (error) {
      showToast({
        title: "Ha ocurrido un error",
        description: "El texto no se pude copiar al portapapeles",
        type: "error",
      });
      return;
    }

    if (!error && copied) {
      showToast({
        title: "Operacion exitosa",
        description: "El texto se ha copiado al portapapeles correctamente",
        type: "success",
      });
      return;
    }
  }, [copied, error]);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex gap-2 items-center">
            {
              <Icon
                strokeWidth={1.3}
                className="hidden sm:block text-gray-500 dark:text-gray-200"
              />
            }
            <span className="text-xs  font-medium  uppercase text-gray-900 dark:text-gray-300">
              {title}
            </span>
          </div>
          <div>
            <Button
              buttonTooltip
              buttonTooltipText="copiar"
              variant={"outline"}
              size={"icon"}
              onClick={() => copyToClipboard(content)}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
        </div>

        <div className="text-sm font-semibold line-clamp-2 text-gray-600 dark:text-gray-300">
          {content}
        </div>
      </Card>
    </>
  );
};
