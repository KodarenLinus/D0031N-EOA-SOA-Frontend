import * as React from 'react'
import { cn } from '@shared/utils'

export interface OptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const Option = React.forwardRef<HTMLOptionElement, OptionProps>(
  ({ className, ...props }, ref) => {
    return (
        <option
        ref={ref}
        className={cn(
          'px-2 py-1',
          className
        )}
        {...props}
      />
    )
  }
)

Option.displayName = 'Option'

export { Option }

