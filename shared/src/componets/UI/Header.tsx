import * as React from 'react'
import { cn } from '@shared/utils'

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn('sticky top-0 z-10 border-b bg-blue-400 backdrop-blur mb-6', className)}
      {...props}
    />
  )
)
Header.displayName = 'Header'

export { Header }