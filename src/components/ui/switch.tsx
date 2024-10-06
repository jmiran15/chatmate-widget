import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "../lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "cm-peer cm-inline-flex cm-h-6 cm-w-11 cm-shrink-0 cm-cursor-pointer cm-items-center cm-rounded-full cm-border-2 cm-border-transparent cm-transition-colors focus-visible:cm-outline-none focus-visible:cm-ring-2 focus-visible:cm-ring-ring focus-visible:cm-ring-offset-2 focus-visible:cm-ring-offset-background disabled:cm-cursor-not-allowed disabled:cm-opacity-50 data-[state=checked]:cm-bg-primary data-[state=unchecked]:cm-bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "cm-pointer-events-none cm-block cm-h-5 cm-w-5 cm-rounded-full cm-bg-background cm-shadow-lg cm-ring-0 cm-transition-transform data-[state=checked]:cm-translate-x-5 data-[state=unchecked]:cm-translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
