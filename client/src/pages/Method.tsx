import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";
import { ArrowRight, Check, Compass, Heart, Wrench } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { MEETNORMAN_URL, CHARACTERX_URL, NEXTMONTH_URL } from "@/lib/constants";

// Animation variants for scroll-triggered animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Animated section wrapper that respects reduced motion
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pillar card with hover animation
function PillarDetailCard({
  pillar,
  icon: Icon,
  definition,
  whenMissing,
  whenStrong
}: {
  pillar: string;
  icon: React.ElementType;
  definition: string;
  whenMissing: string[];
  whenStrong: string[];
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:border-accent/30 transition-colors duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          whileHover={{ rotate: 10 }}
          className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"
        >
          <Icon className="w-5 h-5 text-accent" />
        </motion.div>
        <h3 className="text-xl font-semibold text-foreground">{pillar}</h3>
      </div>

      <p className="text-muted-foreground mb-6 leading-relaxed">{definition}</p>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground/80 mb-2">When it is missing:</p>
          <ul className="space-y-1.5">
            {whenMissing.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground/80 mb-2">When it is strong:</p>
          <ul className="space-y-1.5">
            {whenStrong.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// Brand example tile
function BrandExampleTile({
  brand,
  pillar,
  recognisedFor,
  takeaway
}: {
  brand: string;
  pillar: "Character" | "Story" | "System";
  recognisedFor: string;
  takeaway: string;
}) {
  const pillarColors = {
    Character: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Story: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    System: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card/30 backdrop-blur-sm border border-border/40 rounded-lg p-5 hover:border-border transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-foreground">{brand}</h4>
        <span className={`text-xs px-2 py-1 rounded-full border ${pillarColors[pillar]}`}>
          {pillar}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{recognisedFor}</p>
      <p className="text-xs text-foreground/70 italic border-t border-border/30 pt-3">
        Takeaway: {takeaway}
      </p>
    </motion.div>
  );
}

// Self-diagnosis checkbox group
function DiagnosisBlock({
  pillar,
  items,
  checked,
  onChange
}: {
  pillar: string;
  items: string[];
  checked: boolean[];
  onChange: (index: number) => void;
}) {
  const count = checked.filter(Boolean).length;

  return (
    <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground">{pillar}</h4>
        <span className="text-sm text-muted-foreground">{count}/3</span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => onChange(i)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${
                checked[i]
                  ? "bg-accent border-accent"
                  : "border-border group-hover:border-accent/50"
              }`}>
                {checked[i] && <Check className="w-3 h-3 text-accent-foreground" />}
              </div>
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Offer card with CTA
function OfferCard({
  title,
  pillar,
  forWho,
  whatYouGet,
  outcome,
  href
}: {
  title: string;
  pillar: string;
  forWho: string;
  whatYouGet: string[];
  outcome: string;
  href: string;
}) {
  const isMailto = href.startsWith("mailto:");

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:border-accent/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-accent font-medium uppercase tracking-wide">{pillar}</span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{forWho}</p>

      <ul className="space-y-2 mb-4">
        {whatYouGet.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-foreground/80 italic border-t border-border/30 pt-4 mb-4">
        {outcome}
      </p>

      <div className="flex gap-2">
        <Button size="sm" asChild>
          <a href={href} target={isMailto ? undefined : "_blank"} rel={isMailto ? undefined : "noopener noreferrer"}>
            {isMailto ? "Get in touch" : "Get started"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </Button>
      </div>
    </motion.div>
  );
}

// Chapter list item
function ChapterItem({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 items-start py-3 border-b border-border/20 last:border-b-0"
    >
      <span className="text-accent font-mono text-sm mt-0.5 shrink-0 w-6 text-right">{number}.</span>
      <div>
        <h4 className="font-medium text-foreground text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
}

export default function Method() {
  // Self-diagnosis state
  const [characterChecks, setCharacterChecks] = useState([false, false, false]);
  const [storyChecks, setStoryChecks] = useState([false, false, false]);
  const [systemChecks, setSystemChecks] = useState([false, false, false]);

  const characterScore = characterChecks.filter(Boolean).length;
  const storyScore = storyChecks.filter(Boolean).length;
  const systemScore = systemChecks.filter(Boolean).length;

  const getDiagnosisMessage = () => {
    const total = characterScore + storyScore + systemScore;
    if (total === 0) return null;

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (characterScore >= 2) strengths.push("Character");
    else if (characterScore <= 1) weaknesses.push("Character");

    if (storyScore >= 2) strengths.push("Story");
    else if (storyScore <= 1) weaknesses.push("Story");

    if (systemScore >= 2) strengths.push("System");
    else if (systemScore <= 1) weaknesses.push("System");

    if (strengths.length === 3) {
      return "Strong across all three pillars. Your foundation is solid.";
    }

    if (weaknesses.length === 3) {
      return "There is room to strengthen all three areas. Start with Character to establish direction.";
    }

    const interpretations: Record<string, string> = {
      "Character": "You may have good ideas that lack clear direction or customer understanding.",
      "Story": "Your work might feel functional but not emotionally resonant.",
      "System": "Great ideas, but they may not ship consistently or systematically."
    };

    if (weaknesses.length > 0) {
      const primary = weaknesses[0];
      return `Stronger in ${strengths.join(" and ")}. ${interpretations[primary]}`;
    }

    return null;
  };

  const diagnosisMessage = getDiagnosisMessage();

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background effects */}
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
        {/* Subtle vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, transparent 50%, hsl(220 15% 4% / 0.4) 100%)"
          }}
        />
      </div>

      <NavBar />

      <main className="relative z-10 pt-24">
        {/* SECTION 1: Hero */}
        <Section className="pt-32 pb-20 md:pt-40 md:pb-28">
          <AnimatedSection>
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
                CharacterX
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-6">
                Stop selling. Start directing.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
                CharacterX is the framework I developed that applies cinematic storytelling principles to business transformation. It treats the customer as the protagonist and the brand as the guide. 10 chapters. One methodology.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <a href={MEETNORMAN_URL} target="_blank" rel="noopener noreferrer">
                    Start Your Strategy with Norman
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href={CHARACTERX_URL} target="_blank" rel="noopener noreferrer">
                    Get the Book
                  </a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </Section>

        {/* SECTION 2: The Core Idea — three pillar cards */}
        <Section className="border-t border-border/30">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              The core idea
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">
              Every business transformation has three dimensions. CharacterX gives each one a name and a diagnostic.
            </p>
          </AnimatedSection>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6"
          >
            <PillarDetailCard
              pillar="Character"
              icon={Compass}
              definition="Understanding who your customer really is. The identity they hold today, the identity they're moving toward, and the gap only you can bridge."
              whenMissing={[
                "Messaging changes constantly",
                "Competitors feel interchangeable with you",
                "Team cannot articulate the transformation you facilitate"
              ]}
              whenStrong={[
                "Clear understanding of the customer's identity shift",
                "Positioning built around who they're becoming",
                "Everyone can explain the core transformation"
              ]}
            />
            <PillarDetailCard
              pillar="Story"
              icon={Heart}
              definition="Connection, empathy, narrative. How every interaction becomes a scene in a larger transformation story."
              whenMissing={[
                "Content feels like a brochure, not a narrative",
                "Audience engages but does not trust",
                "Sales conversations start from scratch every time"
              ]}
              whenStrong={[
                "Content feels like a story customers want to be part of",
                "Trust established before the first conversation",
                "Every touchpoint feels like a scene in the same story"
              ]}
            />
            <PillarDetailCard
              pillar="System"
              icon={Wrench}
              definition="Execution and orchestration. The repeatable mechanisms that make transformation predictable, not accidental."
              whenMissing={[
                "Good ideas that never get finished",
                "Quality varies unpredictably",
                "Marketing feels like a constant scramble"
              ]}
              whenStrong={[
                "Repeatable systems that scale",
                "Transformation is predictable, not accidental",
                "Marketing compounds over time"
              ]}
            />
          </motion.div>
        </Section>

        {/* SECTION 3: The 10 Chapters */}
        <Section className="border-t border-border/30">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              The 10 chapters
            </h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              CharacterX unfolds across ten components, each building on the last.
            </p>
          </AnimatedSection>
          <div className="max-w-2xl bg-card/30 backdrop-blur-sm border border-border/40 rounded-lg p-6">
            <ChapterItem number={1} title="Character X" description="Your customer as protagonist" />
            <ChapterItem number={2} title="Inciting Incident" description="The catalyst moment" />
            <ChapterItem number={3} title="Missing Scene" description="The transformation gap only you can fill" />
            <ChapterItem number={4} title="Foundation Trilogy" description="Character + incident + missing scene as engine" />
            <ChapterItem number={5} title="Props & Locations" description="Tangible anchors and transformation spaces" />
            <ChapterItem number={6} title="Supporting Characters & Soundtrack" description="The ensemble cast" />
            <ChapterItem number={7} title="Production Devices" description="Systematic orchestration tools" />
            <ChapterItem number={8} title="Integration" description="Scene-by-scene mastery" />
            <ChapterItem number={9} title="Transformation Timeline" description="Time as character" />
            <ChapterItem number={10} title="Climactic Moment" description="The identity breakthrough" />
          </div>
        </Section>

        {/* SECTION 4: Real-world examples */}
        <Section className="border-t border-border/30">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              What this looks like in the real world
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">
              These brands are widely recognised for excellence in specific areas.
              The principles they demonstrate can apply at any scale.
            </p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Character examples */}
            <BrandExampleTile
              brand="Patagonia"
              pillar="Character"
              recognisedFor="Widely recognised for values-led positioning and a clear point of view on environmental responsibility."
              takeaway="Take a stance on something that matters to your audience, then let it guide every decision."
            />
            <BrandExampleTile
              brand="Apple"
              pillar="Character"
              recognisedFor="Often associated with ruthless focus, product clarity, and a consistent worldview about design and simplicity."
              takeaway="Say no to most things so you can say yes with conviction to the few that matter."
            />
            <BrandExampleTile
              brand="IKEA"
              pillar="Character"
              recognisedFor="Widely recognised for democratic design and a simple, consistent promise about accessible home furnishing."
              takeaway="A clear, ownable promise repeated consistently builds recognition faster than clever campaigns."
            />

            {/* Story examples */}
            <BrandExampleTile
              brand="Nike"
              pillar="Story"
              recognisedFor="Often associated with emotional storytelling that connects sport to identity and personal aspiration."
              takeaway="Speak to who your customer wants to become, not just what they want to buy."
            />
            <BrandExampleTile
              brand="Innocent Drinks"
              pillar="Story"
              recognisedFor="Widely recognised for a playful, human tone of voice that makes a commodity feel like a friend."
              takeaway="Personality and warmth can differentiate even simple products."
            />
            <BrandExampleTile
              brand="Dove"
              pillar="Story"
              recognisedFor="Often associated with empathy-led campaigns that challenge industry norms and connect with real human experiences."
              takeaway="Understanding your audience's deeper concerns creates trust that transcends product features."
            />

            {/* System examples */}
            <BrandExampleTile
              brand="McDonald's"
              pillar="System"
              recognisedFor="Widely recognised for operational consistency at scale, delivering a predictable experience globally."
              takeaway="Systemise the repeatable so you can focus energy on what actually needs to be unique."
            />
            <BrandExampleTile
              brand="Amazon"
              pillar="System"
              recognisedFor="Often associated with systems thinking, friction reduction, and relentless operational clarity."
              takeaway="Reduce friction in your processes so good work happens by default, not by heroic effort."
            />
            <BrandExampleTile
              brand="Tesco"
              pillar="System"
              recognisedFor="Widely recognised for consistent communications and repeatable campaigns that maintain brand presence at scale."
              takeaway="Consistency over time beats occasional brilliance. Build systems that keep showing up."
            />
          </div>
        </Section>

        {/* SECTION 5: Self-diagnosis mini-check */}
        <Section className="border-t border-border/30">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Quick self-check
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Tick the statements that feel true for your business right now.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <DiagnosisBlock
              pillar="Character"
              items={[
                "We know who our customer is becoming, not just what they're buying",
                "Our team can articulate the transformation we facilitate",
                "Our positioning is built around the customer's identity shift"
              ]}
              checked={characterChecks}
              onChange={(i) => {
                const newChecks = [...characterChecks];
                newChecks[i] = !newChecks[i];
                setCharacterChecks(newChecks);
              }}
            />
            <DiagnosisBlock
              pillar="Story"
              items={[
                "Our content feels like a narrative, not a brochure",
                "Customers trust us before the first call",
                "Every touchpoint feels like a scene in the same story"
              ]}
              checked={storyChecks}
              onChange={(i) => {
                const newChecks = [...storyChecks];
                newChecks[i] = !newChecks[i];
                setStoryChecks(newChecks);
              }}
            />
            <DiagnosisBlock
              pillar="System"
              items={[
                "Good ideas actually get shipped",
                "Transformation is predictable, not accidental",
                "Our marketing compounds over time, not scrambles week to week"
              ]}
              checked={systemChecks}
              onChange={(i) => {
                const newChecks = [...systemChecks];
                newChecks[i] = !newChecks[i];
                setSystemChecks(newChecks);
              }}
            />
          </div>

          {diagnosisMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent/10 border border-accent/20 rounded-lg p-6 max-w-2xl"
            >
              <p className="text-foreground">{diagnosisMessage}</p>
              <div className="mt-4">
                <Button size="sm" asChild>
                  <a href={MEETNORMAN_URL} target="_blank" rel="noopener noreferrer">
                    Start your free strategy session with Norman
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </Section>

        {/* SECTION 6: How I can help */}
        <Section className="border-t border-border/30">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              How I can help
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">
              Three ways to work together, aligned to each pillar.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            <OfferCard
              title="CharacterX Sprint"
              pillar="Character"
              forWho="For founders and leaders who need to understand their customer's transformation."
              whatYouGet={[
                "Map your Character X",
                "Find your Missing Scene",
                "Design your transformation strategy"
              ]}
              outcome="Walk away with a clear understanding of who your customer is becoming and how you guide that journey."
              href="mailto:hello@robhutt.com?subject=CharacterX%20Sprint"
            />
            <OfferCard
              title="Content & Video Strategy"
              pillar="Story"
              forWho="For teams who want narrative-driven video and content that builds trust."
              whatYouGet={[
                "Story-led content strategy",
                "Video production planning",
                "flashbuzz meets CharacterX"
              ]}
              outcome="Content that feels like a story customers want to be part of, not a brochure they scroll past."
              href="mailto:hello@robhutt.com?subject=Content%20Strategy"
            />
            <OfferCard
              title="Growth System Build"
              pillar="System"
              forWho="For businesses ready to connect strategy to execution."
              whatYouGet={[
                "NextMonth platform setup",
                "Norman as your growth engine",
                "Repeatable production workflows"
              ]}
              outcome="Marketing that compounds over time, with less firefighting."
              href={NEXTMONTH_URL}
            />
          </div>
        </Section>

        {/* SECTION 7: Closing CTA */}
        <Section className="border-t border-border/30">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Ready to start directing?
              </h2>
              <p className="text-muted-foreground mb-10">
                Find out where your biggest opportunity lies.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href={MEETNORMAN_URL} target="_blank" rel="noopener noreferrer">
                    Start a free strategy session with Norman
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href={CHARACTERX_URL} target="_blank" rel="noopener noreferrer">
                    Get the CharacterX book
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/#contact">Get in touch</a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </Section>

        {/* Closing statement */}
        <Section className="border-t border-border/30 py-16">
          <div className="text-center">
            <p className="text-lg md:text-xl text-muted-foreground italic">
              Your customer is the protagonist.
            </p>
            <p className="text-lg md:text-xl text-foreground mt-1">
              You are the guide.
            </p>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
