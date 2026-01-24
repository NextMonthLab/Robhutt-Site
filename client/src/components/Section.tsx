import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({ id, className, children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("py-20 md:py-28", className)}
      data-testid={id ? `section-${id}` : undefined}
    >
      <div className="max-w-[1100px] mx-auto px-6">
        {children}
      </div>
    </section>
  );
}
