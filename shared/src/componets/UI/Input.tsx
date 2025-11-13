import * as React from 'react'
import { cn } from '@shared/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  date?: boolean
  onChangeDate?: (date: string) => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', date, onChangeDate, ...props }, ref) => {
    const { onChange, ...rest } = props

    if (date) {
      return (
        <input
          type="date"
          ref={ref}
          lang="sv-SE"
          className={cn(
            'flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          onChange={(e) => {
            onChangeDate?.(e.target.value)   
            onChange?.(e)                    
          }}
          {...rest}
        />
      )
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
          'placeholder:text-muted-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onChange={onChange}
        {...rest}
      />
    )
  }
)

Input.displayName = 'Input'
export { Input }
