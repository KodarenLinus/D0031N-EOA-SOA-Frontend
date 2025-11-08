import * as React from "react"
import { cn } from "@shared/utils"

export interface OptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const Option = React.forwardRef<HTMLOptionElement, OptionProps>(
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
