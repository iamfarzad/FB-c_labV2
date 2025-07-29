import type React from "react"
import { Button } from "antd"
import "./cta-section.css"

interface CtaSectionProps {
  primaryCtaText: string
  primaryCtaLink: string
}

const CtaSection: React.FC<CtaSectionProps> = ({ primaryCtaText, primaryCtaLink }) => {
  return (
    <div className="cta-section">
      <Button type="primary" href={primaryCtaLink}>
        {primaryCtaText}
      </Button>
    </div>
  )
}

export default CtaSection
