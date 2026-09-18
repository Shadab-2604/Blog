import { Github, Linkedin, Instagram, ArrowUpRight } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-card border-t border-border/80 transition-colors mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="text-lg font-black tracking-tight text-foreground">
              SHADAB<span className="text-indigo-600 dark:text-indigo-400">.DEV</span>
            </span>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <p className="text-sm text-muted-foreground">
              © {currentYear} Shadab Shaikh. Built for sharing knowledge & engineering insights.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://shadab-dev.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Portfolio <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/Shadab-2604"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="p-2 rounded-lg text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/_shad.dev_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="p-2 rounded-lg text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
