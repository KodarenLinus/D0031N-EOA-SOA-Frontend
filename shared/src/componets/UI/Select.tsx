import * as React from 'react'
import { cn } from '@shared/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (  
      <select
        ref={ref}
        className={cn(
          'border rounded-xl px-2 py-1',
          className
        )}
        {...props}
      />
    );
  }
);

Select.displayName = 'Select';

export { Select };