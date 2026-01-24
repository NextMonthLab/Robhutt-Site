import { Button } from "@/components/ui/button";

export function NavBar() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50"
      data-testid="navbar"
    >
      <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <a 
          href="/" 
          className="text-lg font-medium tracking-tight text-foreground"
          data-testid="link-home"
        >
          Rob Hutt
        </a>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => scrollTo("work")}
            data-testid="button-nav-work"
          >
            Work
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => scrollTo("contact")}
            data-testid="button-nav-contact"
          >
            Contact
          </Button>
        </div>
      </div>
    </nav>
  );
}
