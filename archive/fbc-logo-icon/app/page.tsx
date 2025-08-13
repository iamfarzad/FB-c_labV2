import { FbcIcon } from "@/components/fbc-icon"
import { FbcLogo } from "@/components/fbc-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon } from "lucide-react"

export default function BrandShowcasePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <FbcLogo className="text-3xl" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Toggle theme">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button className="bg-orange-accent text-primary-foreground hover:bg-orange-accent-hover">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <FbcIcon className="w-28 h-28" />
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">The F.B/c Identity</h1>
              <p className="max-w-[700px] text-foreground/80 md:text-xl font-sans">
                A complete brand system built on a foundation of specified colors and typography.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full pb-20 md:pb-32 lg:pb-40 bg-card dark:bg-gunmetal-lighter">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">Palette & Fonts in Action</h2>
              <p className="text-foreground/70 mt-2 font-sans">Demonstrating the complete design token system.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <Card>
                <CardHeader>
                  <CardTitle>Backgrounds & Borders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 font-sans">
                  <div className="p-4 rounded-md bg-light-silver border-2 border-light-silver-darker">
                    Card on <code className="font-mono">light-silver</code> with a{" "}
                    <code className="font-mono">light-silver-darker</code> border.
                  </div>
                  <div className="p-4 rounded-md bg-gunmetal-lighter text-light-silver border-2 border-gunmetal">
                    Card on <code className="font-mono">gunmetal-lighter</code> with a{" "}
                    <code className="font-mono">gunmetal</code> border.
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col items-center">
                  <Button className="w-full bg-orange-accent text-primary-foreground hover:bg-orange-accent-hover">
                    Primary Button
                  </Button>
                  <p className="text-sm text-center text-foreground/60 font-sans">
                    Hover to see <code className="font-mono">--color-orange-accent-hover</code>.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <h3 className="font-display text-2xl font-bold">Display: Rajdhani</h3>
                  <p className="font-sans">Body: Inter</p>
                  <p className="font-mono text-sm">Mono: Space Mono</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
