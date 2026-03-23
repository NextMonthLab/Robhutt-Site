import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavBar } from "@/components/NavBar";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";
import { ArrowRight, Mail } from "lucide-react";
import { MEETNORMAN_URL } from "@/lib/constants";

function WorkCard({
  title,
  paragraphs,
  bulletPoints,
  fullWidth,
  id,
  image,
  href
}: {
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  fullWidth?: boolean;
  id: string;
  image?: string;
  href?: string;
}) {
  const exploreButton = href ? (
    <Button variant="secondary" size="sm" className="mt-4" data-testid={`button-explore-${id}`} asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        Explore
        <ArrowRight className="w-4 h-4 ml-1" />
      </a>
    </Button>
  ) : (
    <span className="inline-block mt-4 text-sm text-muted-foreground/60">Coming soon</span>
  );

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
        {exploreButton}
      </CardContent>
    </Card>
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
            <p className="text-xl md:text-2xl text-muted-foreground mb-4" data-testid="text-hero-subhead-1">
              I make films and I build businesses.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl" data-testid="text-hero-intro">
              Award-winning filmmaker. Founder of NextMonth, flashbuzz &amp; Hutt Studio. Creator of CharacterX. Based in Banbury, Oxfordshire.
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
              <Button size="lg" asChild data-testid="button-strategy-session">
                <a href={MEETNORMAN_URL} target="_blank" rel="noopener noreferrer">
                  Start a free strategy session
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </Section>

        <Section id="work" className="border-t border-border/30">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12" data-testid="text-work-title">
            The Work
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <WorkCard
              id="norman"
              title="Norman — Your AI Growth Strategist"
              href="https://meetnorman.io"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769464968/Screenshot_2026-01-26_at_22.02.32_eb6laa.png"
              paragraphs={[
                "Norman is an AI strategist who builds your growth plan, then shows up every day to help you deliver it.",
                "He finds prospects, creates content, runs workshops, and manages your pipeline. He's not a chatbot — he uses real tools and takes real action."
              ]}
            />
            <WorkCard
              id="characterx"
              title="CharacterX — The Cinematic Transformation Framework"
              href="https://character-x.com"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769463371/Screenshot_2026-01-26_at_21.35.56_kcexcb.png"
              paragraphs={[
                "A strategic framework that turns customers into protagonists, brands into guides, and every interaction into a scene in a transformation story.",
                "10 chapters. One methodology. A fundamentally different way to build a business. The book is available on Amazon."
              ]}
            />
            <WorkCard
              id="icemaker"
              title="IceMaker — Professional Video, Zero Production"
              href="https://icemaker.app"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769463437/Screenshot_2026-01-26_at_21.37.03_xz8mxa.png"
              paragraphs={[
                "Turn any content into interactive video with AI-generated visuals, your cloned voice, and characters that present for you.",
                "No cameras. No crew. No editing skills."
              ]}
            />
            <WorkCard
              id="nextmonth"
              title="NextMonth — The Growth Platform"
              href="https://nextmonth.io"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769465047/Screenshot_2026-01-26_at_22.03.51_uajuaq.png"
              paragraphs={[
                "The platform that houses everything. An AI guide, a personalised strategy, and the tools to deliver it — video production, prospecting, CRM, workshops, and more.",
                "Start with a free conversation. Your plan in 10 minutes."
              ]}
            />
          </div>

          <p className="text-muted-foreground text-sm uppercase tracking-wide mt-12 mb-6">Personal work</p>
          <div className="grid md:grid-cols-2 gap-6">
            <WorkCard
              id="rob-hutt-films"
              title="Robert Hutt Films"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769465047/Screenshot_2026-01-26_at_22.03.51_uajuaq.png"
              paragraphs={[
                "Writer and director of independent short films. My debut 'Time Spent' won 23 international awards with a 9.2 IMDb rating.",
                "Filmmaking is where every idea about story, character and transformation started. The same instincts that shape a screenplay shape how I build brands and platforms."
              ]}
            />
            <WorkCard
              id="flashbuzz"
              title="flashbuzz"
              image="https://res.cloudinary.com/drl0fxrkq/image/upload/v1769463477/Screenshot_2026-01-26_at_21.37.44_jmxlon.png"
              paragraphs={[
                "A video-led marketing consultancy working with SMEs, professional services, and regulated environments.",
                "Especially useful where leaders or teams are not naturally camera-confident. Trust-building communication through narrative-driven video."
              ]}
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
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => scrollTo("contact")}
                data-testid="button-start-conversation"
              >
                Start a conversation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-strategy-norman">
                <a href={MEETNORMAN_URL} target="_blank" rel="noopener noreferrer">
                  Or start a free strategy session with Norman
                </a>
              </Button>
            </div>
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
              I make films. I build businesses.
            </p>
            <p className="text-lg md:text-xl text-foreground mt-1" data-testid="text-closing-2">
              If the work feels aligned, I'm always open to a conversation.
            </p>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
