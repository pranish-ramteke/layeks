import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { useEffect, useState } from "react";

interface MenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MenuDialog = ({ open, onOpenChange }: MenuDialogProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/sample-menu.pdf';
    link.download = 'menu.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pdfUrl = window.location.origin + '/sample-menu.pdf';
  const viewerUrl = isMobile 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
    : `/sample-menu.pdf#toolbar=0&navpanes=0&scrollbar=0`;

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
          src={viewerUrl}
          className="w-full h-full border-0"
          title="Restaurant Menu"
        />
      </DialogContent>
    </Dialog>
  );
};

export default MenuDialog;
