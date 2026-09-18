import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/context/AuthContext'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'SHADAB.DEV | Blog & Engineering Insights',
  description: 'Articles, insights, and tutorials on modern web development, full-stack architecture, and tech by Shadab Shaikh.',
  keywords: ['Shadab', 'Web Development', 'React', 'Next.js', 'Node.js', 'Full Stack', 'Software Engineer', 'Blog'],
  authors: [{ name: 'Shadab Shaikh' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground flex flex-col selection:bg-indigo-500 selection:text-white antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <div className="flex-1 w-full">{children}</div>
            <Footer />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
