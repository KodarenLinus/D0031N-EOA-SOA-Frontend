'use client'
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
    // Plocka ut ev. onChange från props så vi kan kedja båda
    const { onChange, ...rest } = props

    if (date) {
      return (
        <input
          type="date"
          ref={ref}
          lang="sv-SE"
          className={cn(
            // kompakt höjd + padding, ingen extern ikon
            'flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          onChange={(e) => {
            onChangeDate?.(e.target.value)   // ger 'YYYY-MM-DD'
            onChange?.(e)                    // bevara ev. extern onChange
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
