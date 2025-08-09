export function ConsultPrepChecklist() {
  const items = [
    "One workflow you'd automate first",
    "Any doc/screenshot that shows the current process",
    "Rough volume and time spent per week",
    "Systems involved (CRM, help desk, internal tools)",
  ]

  return (
    <div className="neu-card p-6">
      <h3 className="text-lg font-semibold text-primary mb-2">What to prepare for your consultation</h3>
      <ul className="list-disc list-inside text-muted-foreground space-y-1">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}