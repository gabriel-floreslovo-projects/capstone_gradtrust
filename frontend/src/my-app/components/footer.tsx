import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/20">
      <div className="container flex flex-col gap-8 py-8 md:flex-row md:py-12">
        {/* Section 1 */}
        <div className="flex-1 space-y-4">
          <h2 className="font-bold">GradTrust</h2>
          <p className="text-sm text-muted-foreground">New age of Certification Verification</p>
        </div>
        
        {/* Section 2 & 3 (Grid Layout) */}
        <div className="grid flex-1 grid-cols-2 sm:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="container border-t border-border/20 py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GradTrust. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
