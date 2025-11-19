import * as React from "react"
import { cn } from "@shared/utils"

const Option = React.forwardRef<HTMLOptionElement,  React.OptionHTMLAttributes<HTMLOptionElement> >(
  ({ className, ...props }, ref) => (
    <option
      ref={ref}
      className={cn("text-sm", className)}
      {...props}
    />
  )
)

Option.displayName = "Option"
export { Option }
