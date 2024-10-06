import * as React from "react";

import { cn } from "../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "cm-flex cm-h-10 cm-w-full cm-rounded-md cm-border cm-border-input cm-bg-background cm-px-3 cm-py-2 cm-text-sm cm-ring-offset-background file:cm-border-0 file:cm-bg-transparent file:cm-text-sm file:cm-font-medium file:cm-text-foreground placeholder:cm-text-muted-foreground focus-visible:cm-outline-none focus-visible:cm-ring-2 focus-visible:cm-ring-ring focus-visible:cm-ring-offset-2 disabled:cm-cursor-not-allowed disabled:cm-opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
