import { Card, CardContent } from "@/core/shared/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/core/shared/ui/avatar";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/shared/ui/button";

interface Props {
  username: string;
  useremail: string;
  userId: string;
}

export const ShowColaboradoresDialogCard = ({
  useremail,
  username,
  userId,
}: Props) => {
  return (
    <>
      <Card className="p-2">
        <CardContent className="flex justify-between">
          <div className="flex justify-start items-center gap-4 ">
            <Avatar className="w-9 h-9">
              <AvatarImage src="" alt="@shadcn" />
              <AvatarFallback>
                {/* TODO: Implementar que el usuario pueda subir una foto de perfil */}
                {username.slice(0, 2).toString().toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm text-black dark:text-white">{username}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {useremail}
              </p>
            </div>
          </div>
          <div>
            <Link href={`/colaboradores/${userId}`}>
              <Button
                buttonTooltip
                buttonTooltipText="Ir al perfil"
                size={"icon"}
                variant={"outline"}
              >
                <ExternalLink />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
