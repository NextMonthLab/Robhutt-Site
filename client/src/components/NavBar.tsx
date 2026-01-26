import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export function NavBar() {
  const [location] = useLocation();
  const isHomePage = location === "/";

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
            asChild
            data-testid="button-nav-method"
          >
            <Link href="/method">Method</Link>
          </Button>
          {isHomePage ? (
            <>
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
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                data-testid="button-nav-work"
              >
                <a href="/#work">Work</a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                data-testid="button-nav-contact"
              >
                <a href="/#contact">Contact</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
