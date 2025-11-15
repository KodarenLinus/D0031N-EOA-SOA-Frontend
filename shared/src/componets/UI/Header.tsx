import * as React from 'react'
import { cn } from '@shared/utils'

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn('sticky top-0 z-10 mb-6 rounded-b-2xl shadow-md bg-gradient-to-r from-sky-700 to-[#12365a]', className)}
      {...props}
    />
  )
)
Header.displayName = 'Header'

export { Header }