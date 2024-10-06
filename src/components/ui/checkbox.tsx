import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "cm-peer cm-h-4 cm-w-4 cm-shrink-0 cm-rounded-sm cm-border cm-border-primary cm-ring-offset-background focus-visible:cm-outline-none focus-visible:cm-ring-2 focus-visible:cm-ring-ring focus-visible:cm-ring-offset-2 disabled:cm-cursor-not-allowed disabled:cm-opacity-50 data-[state=checked]:cm-bg-primary data-[state=checked]:cm-text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "cm-flex cm-items-center cm-justify-center cm-text-current"
      )}
    >
      <Check className="cm-h-4 cm-w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
