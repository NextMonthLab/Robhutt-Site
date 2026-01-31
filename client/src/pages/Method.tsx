import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/NavBar";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";
import { PlannerCta } from "@/components/PlannerCta";
import { ArrowRight, Check, Compass, Heart, Wrench } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { SCORECARD_URL, PLANNER_URL } from "@/lib/constants";

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
  pillar: "Soul" | "Heart" | "Hands";
  recognisedFor: string;
  takeaway: string;
}) {
  const pillarColors = {
    Soul: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Heart: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Hands: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
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

// Offer card
function OfferCard({
  title,
  pillar,
  forWho,
  whatYouGet,
  outcome
}: {
  title: string;
  pillar: string;
  forWho: string;
  whatYouGet: string[];
  outcome: string;
}) {
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
          <a href={SCORECARD_URL} target="_blank" rel="noopener noreferrer">
            Take the scorecard
          </a>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <a href="/#contact">Get in touch</a>
        </Button>
      </div>
    </motion.div>
  );
}

export default function Method() {
  // Self-diagnosis state
  const [soulChecks, setSoulChecks] = useState([false, false, false]);
  const [heartChecks, setHeartChecks] = useState([false, false, false]);
  const [handsChecks, setHandsChecks] = useState([false, false, false]);

  const soulScore = soulChecks.filter(Boolean).length;
  const heartScore = heartChecks.filter(Boolean).length;
  const handsScore = handsChecks.filter(Boolean).length;

  const getDiagnosisMessage = () => {
    const total = soulScore + heartScore + handsScore;
    if (total === 0) return null;

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (soulScore >= 2) strengths.push("Soul");
    else if (soulScore <= 1) weaknesses.push("Soul");

    if (heartScore >= 2) strengths.push("Heart");
    else if (heartScore <= 1) weaknesses.push("Heart");

    if (handsScore >= 2) strengths.push("Hands");
    else if (handsScore <= 1) weaknesses.push("Hands");

    if (strengths.length === 3) {
      return "Strong across all three pillars. Your marketing foundation is solid.";
    }

    if (weaknesses.length === 3) {
      return "There is room to strengthen all three areas. Start with Soul to establish direction.";
    }

    const interpretations: Record<string, string> = {
      "Soul": "You may have good ideas that lack clear direction or positioning.",
      "Heart": "Your work might feel functional but not emotionally resonant.",
      "Hands": "Great ideas, but they may not ship consistently or systematically."
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
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                Soul. Heart. Hands.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl">
                A practical way to make marketing clearer, more human, and easier to execute.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <a href={SCORECARD_URL} target="_blank" rel="noopener noreferrer">
                    Take the scorecard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/#contact">Get in touch</a>
                </Button>
              </div>
              <div className="mt-10">
                <PlannerCta
                  headline="Get your free 90-day planner"
                  body="Finish the Scorecard and your plan appears instantly. No login."
                  buttonLabel="Create my plan"
                  href={PLANNER_URL}
                />
              </div>
            </div>
          </AnimatedSection>
        </Section>

        {/* SECTION 2: The problem it solves */}
        <Section className="border-t border-border/30">
          <AnimatedSection>
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
                The problem it solves
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>Most marketing fails not because of lack of effort, but because effort is scattered.</p>
                <p>Some brands lack direction. They do not know what they stand for or why anyone should care.</p>
                <p>Others lack trust. Their work feels transactional, not human.</p>
                <p>Many lack execution. Good ideas that never ship, or ship badly.</p>
                <p>This framework identifies which constraint is holding you back, then fixes it.</p>
                <p>Fix the right thing first, and the rest becomes easier.</p>
              </div>
            </div>
          </AnimatedSection>
        </Section>

        {/* SECTION 3: Three pillar cards */}
        <Section className="border-t border-border/30">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">
              The three pillars
            </h2>
          </AnimatedSection>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6"
          >
            <PillarDetailCard
              pillar="Soul"
              icon={Compass}
              definition="Direction and positioning. Knowing what you stand for and why it matters. The strategic clarity that everything else builds on."
              whenMissing={[
                "Messaging changes constantly",
                "Competitors feel interchangeable with you",
                "Team cannot articulate what makes you different"
              ]}
              whenStrong={[
                "Clear point of view that guides decisions",
                "Positioning that feels distinctive and owned",
                "Everyone can explain the core story"
              ]}
            />
            <PillarDetailCard
              pillar="Heart"
              icon={Heart}
              definition="Trust and human connection. How your brand makes people feel. The emotional resonance that turns transactions into relationships."
              whenMissing={[
                "Content feels corporate and forgettable",
                "Audience engages but does not trust",
                "Sales conversations start from scratch every time"
              ]}
              whenStrong={[
                "Tone of voice that feels genuinely human",
                "Trust established before the first conversation",
                "Customers become advocates naturally"
              ]}
            />
            <PillarDetailCard
              pillar="Hands"
              icon={Wrench}
              definition="Systems and execution. The operational infrastructure that turns strategy into consistent output. Ideas that actually ship."
              whenMissing={[
                "Good ideas that never get finished",
                "Quality varies unpredictably",
                "Marketing feels like a constant scramble"
              ]}
              whenStrong={[
                "Repeatable systems that scale",
                "Consistent quality without heroic effort",
                "Marketing compounds over time"
              ]}
            />
          </motion.div>
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
            {/* Soul examples */}
            <BrandExampleTile
              brand="Patagonia"
              pillar="Soul"
              recognisedFor="Widely recognised for values-led positioning and a clear point of view on environmental responsibility."
              takeaway="Take a stance on something that matters to your audience, then let it guide every decision."
            />
            <BrandExampleTile
              brand="Apple"
              pillar="Soul"
              recognisedFor="Often associated with ruthless focus, product clarity, and a consistent worldview about design and simplicity."
              takeaway="Say no to most things so you can say yes with conviction to the few that matter."
            />
            <BrandExampleTile
              brand="IKEA"
              pillar="Soul"
              recognisedFor="Widely recognised for democratic design and a simple, consistent promise about accessible home furnishing."
              takeaway="A clear, ownable promise repeated consistently builds recognition faster than clever campaigns."
            />

            {/* Heart examples */}
            <BrandExampleTile
              brand="Nike"
              pillar="Heart"
              recognisedFor="Often associated with emotional storytelling that connects sport to identity and personal aspiration."
              takeaway="Speak to who your customer wants to become, not just what they want to buy."
            />
            <BrandExampleTile
              brand="Innocent Drinks"
              pillar="Heart"
              recognisedFor="Widely recognised for a playful, human tone of voice that makes a commodity feel like a friend."
              takeaway="Personality and warmth can differentiate even simple products."
            />
            <BrandExampleTile
              brand="Dove"
              pillar="Heart"
              recognisedFor="Often associated with empathy-led campaigns that challenge industry norms and connect with real human experiences."
              takeaway="Understanding your audience's deeper concerns creates trust that transcends product features."
            />

            {/* Hands examples */}
            <BrandExampleTile
              brand="McDonald's"
              pillar="Hands"
              recognisedFor="Widely recognised for operational consistency at scale, delivering a predictable experience globally."
              takeaway="Systemise the repeatable so you can focus energy on what actually needs to be unique."
            />
            <BrandExampleTile
              brand="Amazon"
              pillar="Hands"
              recognisedFor="Often associated with systems thinking, friction reduction, and relentless operational clarity."
              takeaway="Reduce friction in your processes so good work happens by default, not by heroic effort."
            />
            <BrandExampleTile
              brand="Tesco"
              pillar="Hands"
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

          <div className="mb-10">
            <PlannerCta
              headline="Turn insight into a 90-day mission"
              body="Weekly actions, milestones, and momentum in minutes."
              buttonLabel="Build my plan for free"
              href={PLANNER_URL}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <DiagnosisBlock
              pillar="Soul"
              items={[
                "We have a clear, distinctive positioning",
                "Our team can articulate why we are different",
                "Our messaging is consistent across channels"
              ]}
              checked={soulChecks}
              onChange={(i) => {
                const newChecks = [...soulChecks];
                newChecks[i] = !newChecks[i];
                setSoulChecks(newChecks);
              }}
            />
            <DiagnosisBlock
              pillar="Heart"
              items={[
                "Our content feels genuinely human",
                "Customers trust us before the first call",
                "Our tone of voice is distinctive and consistent"
              ]}
              checked={heartChecks}
              onChange={(i) => {
                const newChecks = [...heartChecks];
                newChecks[i] = !newChecks[i];
                setHeartChecks(newChecks);
              }}
            />
            <DiagnosisBlock
              pillar="Hands"
              items={[
                "Good ideas actually get shipped",
                "Quality is consistent without heroic effort",
                "Marketing feels systematic, not scrambled"
              ]}
              checked={handsChecks}
              onChange={(i) => {
                const newChecks = [...handsChecks];
                newChecks[i] = !newChecks[i];
                setHandsChecks(newChecks);
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
                  <a href={SCORECARD_URL} target="_blank" rel="noopener noreferrer">
                    Get your full score
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </Section>

        {/* SECTION 6: How Rob helps */}
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
              title="Clarity and Positioning Sprint"
              pillar="Soul"
              forWho="For founders and leaders who need to articulate what makes them different."
              whatYouGet={[
                "Deep-dive positioning workshop",
                "Core messaging framework",
                "Decision filters for future clarity"
              ]}
              outcome="Walk away with a clear, ownable position and the language to communicate it."
            />
            <OfferCard
              title="Human Presence Kit"
              pillar="Heart"
              forWho="For teams who want their marketing to feel more human and trustworthy."
              whatYouGet={[
                "Tone of voice guidelines",
                "Story and video strategy",
                "Content that builds trust before the sale"
              ]}
              outcome="Marketing that makes people feel something, not just scroll past."
            />
            <OfferCard
              title="Marketing System Build"
              pillar="Hands"
              forWho="For businesses ready to make marketing feel less like chaos and more like a system."
              whatYouGet={[
                "Content operations audit",
                "Repeatable production workflows",
                "Hybrid strategy and implementation"
              ]}
              outcome="Marketing that compounds over time, with less firefighting."
            />
          </div>
        </Section>

        {/* SECTION 7: Closing CTA */}
        <Section className="border-t border-border/30">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                If you want marketing that compounds, fix the constraint first.
              </h2>
              <p className="text-muted-foreground mb-10">
                Find out where your biggest opportunity lies.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href={SCORECARD_URL} target="_blank" rel="noopener noreferrer">
                    Take the scorecard
                    <ArrowRight className="w-4 h-4 ml-2" />
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
              Clarity, trust, and execution.
            </p>
            <p className="text-lg md:text-xl text-foreground mt-1">
              In that order.
            </p>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
