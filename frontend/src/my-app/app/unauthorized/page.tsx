export default function AboutPage() {
    return (
      <div className="relative min-h-screen">
        {/* Background gradients */}
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
        </div>
  
        <h1 className="text-4xl md:text-6xl font-bold mb-6">403: Unauthorized</h1>
        <p className="text-lg mb-6"> You do not have the authority to access this page </p>
      </div>
    )
  }