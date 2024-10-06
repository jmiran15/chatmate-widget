import * as React from "react";

import { cn } from "../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "cm-flex cm-min-h-[80px] cm-w-full cm-rounded-md cm-border cm-border-input cm-bg-background cm-px-3 cm-py-2 cm-text-sm cm-ring-offset-background placeholder:cm-text-muted-foreground focus-visible:cm-outline-none focus-visible:cm-ring-2 focus-visible:cm-ring-ring focus-visible:cm-ring-offset-2 disabled:cm-cursor-not-allowed disabled:cm-opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
