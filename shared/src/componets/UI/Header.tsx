  import * as React from 'react'
  import { cn } from '@shared/utils'

  const Header = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ className, ...props }, ref) => (
      <header
        ref={ref}
        className={cn('sticky top-0 z-10 mb-6 rounded-b-2xl shadow-md bg-gradient-to-r from-primary-soft to-primary', className)}
        {...props}
      />
    )
  )
  Header.displayName = 'Header'

  export { Header }