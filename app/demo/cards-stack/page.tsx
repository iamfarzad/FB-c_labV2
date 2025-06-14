import { Process, Work, Achievements } from "@/components/demo/cards-stack-demo"

export default function CardsStackDemoPage() {
  return (
    <div className="flex flex-col">
      <Process />
      <Work />
      <Achievements />
    </div>
  )
}
