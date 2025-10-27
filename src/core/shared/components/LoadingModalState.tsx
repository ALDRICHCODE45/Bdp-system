import { Spinner } from "@/core/shared/ui/spinner";
import { Dialog, DialogContent } from "@/core/shared/ui/dialog";

export const LoadingModalState = () => {
  return (
    <>
      <Dialog open={true}>
        <DialogContent className="w-lg flex justify-center items-center text-center">
          <Spinner className="size-10" />
        </DialogContent>
      </Dialog>
    </>
  );
};
