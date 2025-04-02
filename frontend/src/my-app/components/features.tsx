import { Brain, Cloud, Shield, Zap } from "lucide-react"

const features = [
  {
    name: "Frictionless Interoperability",
    description: "Our system does not have to directly interface with the digital infrastructure of an institution using the service.",
    icon: Brain, 
  },
  {
    name: "Efficient credential verification without third-party involvement",
    description: "Verifiers do not have to interact with credential issuers whatsoever",
    icon: Cloud,
  },
  // {
  //   name: "Enterprise-Grade Security",
  //   description: "State-of-the-art security measures to protect your most valuable assets.",
  //   icon: Shield,
  // },
  // {
  //   name: "High-Performance Systems",
  //   description: "Optimized for speed and efficiency, our solutions deliver unparalleled performance.",
  //   icon: Zap,
  // },
]

export default function Features() {
  return (
    <section className="container space-y-16 py-24 md:py-32">
      <div className="mx-auto max-w-[58rem] text-center">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Future of Credential Verification</h2>
        <p className="mt-4 text-muted-foreground sm:text-lg">
          Discover how GradTrust can revolutionize the way you verify academic credentials.
        </p>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.name}
            className="relative overflow-hidden rounded-lg border border-border/50 bg-card p-8 shadow-md"
          >
            <div className="flex items-center gap-4">
              <feature.icon className="h-8 w-8 text-primary" />
              <h3 className="font-bold text-xl">{feature.name}</h3>
            </div>
            <p className="mt-4 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

