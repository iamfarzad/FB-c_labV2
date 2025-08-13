import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { getAllModules } from "@/lib/modules"

export default function ModuleGrid({ featured = false }: { featured?: boolean }) {
  const modules = getAllModules()
  const displayModules = featured ? modules.filter((m) => m.featured) : modules

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {displayModules.map((module) => (
        <Card key={module.id} className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <Badge variant={module.phase === 1 ? "default" : module.phase === 2 ? "secondary" : "outline"}>
                Phase {module.phase}
              </Badge>
            </div>
            <CardTitle className="mt-2">{module.title}</CardTitle>
            <CardDescription>{module.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Interaction:</strong> {module.interaction}
              </p>
              <p>
                <strong>Goal:</strong> {module.goal}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="ghost" className="w-full">
              <Link href={`/modules/${module.slug}`}>
                Explore Module <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

