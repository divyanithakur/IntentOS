const steps = [
  { number: "01", title: "Understand", text: "IntentOS interprets the natural-language request and finds what matters." },
  { number: "02", title: "Structure", text: "It extracts intent, entities, and context into a useful shared shape." },
  { number: "03", title: "Plan", text: "It turns the understanding into clear actions that move work forward." },
];

const features = ["Natural language understanding", "Structured intent", "Entity extraction", "Action planning"];

export function HowItWorks() {
  return (
    <>
      <section id="how-it-works" className="border-t border-[#17221d]/12 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">03 / The method</p>
            <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.05em]">From a loose thought to a plan you can trust.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div className="border-t-2 border-[#d67845] pt-4" key={step.number}>
                <span className="font-mono text-xs text-[#d67845]">{step.number}</span>
                <h3 className="mt-8 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#53605a]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="features" className="border-t border-[#17221d]/12 py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2e7d63]">Built into every request</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Clarity at the point of action.</h2>
          </div>
          <ul className="grid gap-x-10 gap-y-3 text-sm text-[#53605a] sm:grid-cols-2">
            {features.map((feature) => <li className="flex items-center gap-3" key={feature}><span className="h-1.5 w-1.5 rounded-full bg-[#d67845]" aria-hidden="true" />{feature}</li>)}
          </ul>
        </div>
      </section>
    </>
  );
}
