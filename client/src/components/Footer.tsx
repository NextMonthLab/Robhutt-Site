import { Button } from "@/components/ui/button";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-border/50 py-12" data-testid="footer">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground" data-testid="text-copyright">
            &copy; {currentYear} Rob Hutt
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => scrollTo("work")}
              data-testid="button-footer-work"
            >
              Work
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => scrollTo("contact")}
              data-testid="button-footer-contact"
            >
              Contact
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
