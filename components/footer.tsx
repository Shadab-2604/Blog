import { Github, Instagram, ArrowUpRight } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-background border-t border-border transition-colors mt-auto">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              SHADAB<span className="text-muted-foreground">.DEV</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              © {currentYear} Shaikh Shadab. Engineering &amp; Cybersecurity Insights.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://shadab-dev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-card transition-colors"
            >
              Portfolio <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/Shadab-2604"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="flex items-center justify-center w-9 h-9 rounded-[10px] border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-card transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/_shad.dev_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="flex items-center justify-center w-9 h-9 rounded-[10px] border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-card transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
