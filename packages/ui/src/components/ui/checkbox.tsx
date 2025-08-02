"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          "peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 size-4 shrink-0 rounded-[4px] border transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center",
          checked ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary/50 bg-background",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
      >
        {checked && (
          <CheckIcon className="size-3.5" />
        )}
      </div>
    </div>
  )
}

export { Checkbox }
