import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface MenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MenuDialog = ({ open, onOpenChange }: MenuDialogProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/sample-menu.pdf';
    link.download = 'menu.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] w-[95vw] p-0 gap-0 overflow-hidden">
        <div className="absolute top-2 right-2 z-50 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg bg-background hover:bg-background/90"
            onClick={handleDownload}
          >
            <Download className="h-5 w-5" />
            <span className="sr-only">Download Menu</span>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 rounded-full shadow-lg bg-background hover:bg-background/90"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <iframe
          src="/sample-menu.pdf#toolbar=0&navpanes=0&scrollbar=0"
          className="w-full h-full border-0"
          title="Restaurant Menu"
        />
      </DialogContent>
    </Dialog>
  );
};

export default MenuDialog;
