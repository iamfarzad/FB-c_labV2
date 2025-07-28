import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface LeadCaptureTermsProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function LeadCaptureTerms({ checked, onCheckedChange }: LeadCaptureTermsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="terms"
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(!!c)}
        aria-label="Agree to terms and conditions"
      />
      <Label htmlFor="terms" className="text-sm text-foreground">
        I agree to the terms and conditions and privacy policy *
      </Label>
    </div>
  )
}
