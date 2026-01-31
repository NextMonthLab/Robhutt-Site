import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";
import { PlannerCta } from "@/components/PlannerCta";
import { ArrowRight, Mail } from "lucide-react";
import { SCORECARD_URL, PLANNER_URL } from "@/lib/constants";

function WorkCard({
  title,
  paragraphs,
  bulletPoints,
  fullWidth,
  id,
  image
}: {
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  fullWidth?: boolean;
  id: string;
  image?: string;
}) {
  return (
    <Card
      className={`hover-elevate transition-all duration-300 overflow-visible ${fullWidth ? "md:col-span-2" : ""}`}
      data-testid={`card-${id}`}
    >
      <div
        className="aspect-video bg-muted border-b border-border overflow-hidden rounded-t-md"
        data-testid={`image-container-${id}`}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" data-testid={`image-placeholder-${id}`} />
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold tracking-tight" data-testid={`text-card-title-${id}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-muted-foreground text-sm leading-relaxed" data-testid={`text-card-para-${id}-${i}`}>{p}</p>
        ))}
        {bulletPoints && bulletPoints.length > 0 && (
          <ul className="space-y-1.5 text-sm text-muted-foreground" data-testid={`list-card-${id}`}>
            {bulletPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2" data-testid={`list-item-card-${id}-${i}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
        <Button variant="secondary" size="sm" className="mt-4" data-testid={`button-explore-${id}`}>
          Explore
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

function PillarCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-3" data-testid={`pillar-${title.toLowerCase()}`}>
      <h3 className="text-lg font-semibold text-foreground tracking-tight" data-testid={`text-pillar-${title.toLowerCase()}-title`}>{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line" data-testid={`text-pillar-${title.toLowerCase()}-description`}>{description}</p>
    </div>
  );
}

export default function Home() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, hsl(220 15% 12%) 0%, transparent 60%)"
          }}
        />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat"
          }}
        />
      </div>

      <NavBar />
      
      <main className="relative z-10 pt-24">
        <Section className="pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="max-w-2xl">
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              data-testid="text-hero-title"
            >
              Rob Hutt
            </h1>
            <div className="space-y-1 mb-6">
              <p className="text-xl md:text-2xl text-muted-foreground" data-testid="text-hero-subhead-1">Award-winning filmmaker.</p>
              <p className="text-xl md:text-2xl text-muted-foreground" data-testid="text-hero-subhead-2">Founder of Hutt Studio.</p>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl" data-testid="text-hero-intro">
              I work at the intersection of story, strategy, and systems - helping people and organisations communicate with clarity, credibility, and intent.
            </p>
            <p 
              className="text-2xl md:text-3xl font-semibold tracking-wide text-foreground mb-10"
              data-testid="text-soul-heart-hands"
            >
              Soul.{" "}
              <span className="mx-2 md:mx-3">Heart.</span>{" "}
              <span className="ml-2 md:ml-3">Hands.</span>
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => scrollTo("work")}
                data-testid="button-view-work"
              >
                View the work
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollTo("contact")}
                data-testid="button-get-in-touch"
              >
                Get in touch
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild data-testid="button-take-scorecard">
                <a href={SCORECARD_URL} target="_blank" rel="noopener noreferrer">
                  Take the scorecard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
            <div className="mt-6">
              <PlannerCta
                headline="Get your free 90-day planner"
                body="Finish the Scorecard and your plan appears instantly. No login."
                buttonLabel="Create my plan"
                href={PLANNER_URL}
              />
            </div>
          </div>
        </Section>

        <Section id="pillars" className="border-t border-border/30">
          <div className="grid md:grid-cols-3 gap-10 md:gap-16">
            <PillarCard 
              title="Soul" 
              description={`Understanding what truly matters.\nThe belief behind a business. The truth inside a story.`}
            />
            <PillarCard 
              title="Heart" 
              description={`Connection, empathy, trust.\nHow something feels is as important as how it functions.`}
            />
            <PillarCard 
              title="Hands" 
              description={`Execution and craft.\nIdeas only matter when they are built properly and delivered into the real world.`}
            />
          </div>
        </Section>

        <Section id="work" className="border-t border-border/30">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12" data-testid="text-work-title">
            The Work
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <WorkCard
              id="rob-hutt-films"
              title="Rob Hutt Films"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769465047/Screenshot_2026-01-26_at_22.03.51_uajuaq.png"
              paragraphs={[
                "I'm an award-winning filmmaker with international festival recognition, creating narrative and commercial films that prioritise emotion, atmosphere, and story integrity.",
                "Film is where my creative instincts were formed, and it remains the foundation of everything else I do."
              ]}
              bulletPoints={[
                "Strong visual language",
                "Human-led storytelling",
                "Films that linger rather than shout"
              ]}
            />
            <WorkCard
              id="hutt-studio"
              title="Hutt Studio"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769464968/Screenshot_2026-01-26_at_22.02.32_eb6laa.png"
              paragraphs={[
                "Hutt Studio is where story meets structure.",
                "It's the home for my work across marketing strategy, creative technology, and advisory - helping organisations make sense of complexity and communicate with confidence.",
                "The studio operates across three core areas:"
              ]}
            />
            <WorkCard
              id="characterx"
              title="CharacterX"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769463371/Screenshot_2026-01-26_at_21.35.56_kcexcb.png"
              paragraphs={[
                "A strategic system for understanding who a brand really is, and how it should show up.",
                "CharacterX helps leaders and teams:",
                "Less noise. More signal."
              ]}
              bulletPoints={[
                "Clarify positioning",
                "Build trust deliberately",
                "Communicate with consistency and restraint"
              ]}
            />
            <WorkCard
              id="icemaker"
              title="IceMaker"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769463437/Screenshot_2026-01-26_at_21.37.03_xz8mxa.png"
              paragraphs={[
                "An interactive cinematic experience platform for turning knowledge, ideas, and stories into guided visual journeys.",
                "It exists because most information is badly communicated, and doesn't need to be."
              ]}
              bulletPoints={[
                "Film language",
                "Interactive design",
                "AI collaboration"
              ]}
            />
          </div>
          <div className="mt-6">
            <WorkCard
              id="flashbuzz"
              title="FlashBuzz"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769463477/Screenshot_2026-01-26_at_21.37.44_jmxlon.png"
              paragraphs={[
                "A video-led marketing consultancy working with SMEs, professional services, and regulated environments.",
                "Especially useful where leaders or teams are not naturally camera-confident."
              ]}
              bulletPoints={[
                "Trust-building communication",
                "Narrative-driven video",
                "Calm, considered delivery where confidence matters"
              ]}
              fullWidth
            />
          </div>
        </Section>

        <Section id="availability" className="border-t border-border/30">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" data-testid="text-availability-title">
              Availability
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6" data-testid="text-availability-intro">
              I work selectively with organisations, founders, and teams who value clarity, craft, and long-term thinking.
            </p>
            <p className="text-muted-foreground mb-4" data-testid="text-availability-open">I'm currently open to:</p>
            <ul className="space-y-2 text-muted-foreground mb-8" data-testid="list-availability">
              <li className="flex items-start gap-3" data-testid="list-item-film-commissions">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                <span>Film commissions</span>
              </li>
              <li className="flex items-start gap-3" data-testid="list-item-strategic-consultancy">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                <span>Strategic consultancy</span>
              </li>
              <li className="flex items-start gap-3" data-testid="list-item-partnerships">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-2" />
                <span>Creative and technology partnerships</span>
              </li>
            </ul>
            <p className="text-muted-foreground mb-8" data-testid="text-availability-cta">
              If the work feels aligned, I'm always open to a conversation.
            </p>
            <Button 
              size="lg"
              onClick={() => scrollTo("contact")}
              data-testid="button-start-conversation"
            >
              Start a conversation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Section>

        <Section id="contact" className="border-t border-border/30">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" data-testid="text-contact-title">
              Contact
            </h2>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Mail className="w-5 h-5 text-accent" />
              <a 
                href="mailto:hello@robhutt.com" 
                className="text-foreground"
                data-testid="link-email"
              >
                hello@robhutt.com
              </a>
            </div>
            <p className="text-muted-foreground text-sm" data-testid="text-contact-note">
              If the work feels aligned, I'm always open to a conversation.
            </p>
          </div>
        </Section>

        <Section className="border-t border-border/30 py-16" id="closing">
          <div className="text-center" data-testid="closing-statement">
            <p className="text-lg md:text-xl text-muted-foreground italic" data-testid="text-closing-1">
              I don't believe in hype.
            </p>
            <p className="text-lg md:text-xl text-foreground mt-1" data-testid="text-closing-2">
              I believe in good work, done properly.
            </p>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
