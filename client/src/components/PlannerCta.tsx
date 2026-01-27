import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PlannerCtaProps = {
  headline: string;
  body: string;
  buttonLabel: string;
  href: string;
};

export function PlannerCta({ headline, body, buttonLabel, href }: PlannerCtaProps) {
  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="max-w-2xl">
        <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
          {headline}
        </h3>
        <p className="text-muted-foreground text-base md:text-lg mb-6">{body}</p>
        <Button size="lg" asChild>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {buttonLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );
}
