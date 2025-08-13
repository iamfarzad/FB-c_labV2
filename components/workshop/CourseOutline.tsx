"use client"

import { getAllModules } from '@/lib/education/modules'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CourseOutline() {
  const mods = getAllModules()
  const firstAnchor = mods.length ? `/workshop/modules/${mods[0].slug}` : '#'
  return (
    <Card className="neu-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Course outline</CardTitle>
          {firstAnchor && (<Button size="sm" asChild><a href={firstAnchor}>Start course</a></Button>)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {mods.map((m) => (
            <a key={m.slug} href={`/workshop/modules/${m.slug}`} className="group rounded-md border bg-card p-3 hover:bg-accent/20 transition-colors">
              <div className="flex items-center justify-between"><div className="font-medium">{m.title}</div><span className="text-xs text-muted-foreground">Phase {m.phase}</span></div>
              <div className="text-sm text-muted-foreground">{m.description}</div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseOutline


