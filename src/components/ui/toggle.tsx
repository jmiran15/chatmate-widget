import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/utils";

const toggleVariants = cva(
  "cm-inline-flex cm-items-center cm-justify-center cm-rounded-md cm-text-sm cm-font-medium cm-ring-offset-background cm-transition-colors hover:cm-bg-muted hover:cm-text-muted-foreground focus-visible:cm-outline-none focus-visible:cm-ring-2 focus-visible:cm-ring-ring focus-visible:cm-ring-offset-2 disabled:cm-pointer-events-none disabled:cm-opacity-50 data-[state=on]:cm-bg-accent data-[state=on]:cm-text-accent-foreground",
  {
    variants: {
      variant: {
        default: "cm-bg-transparent",
        outline:
          "cm-border cm-border-input cm-bg-transparent hover:cm-bg-accent hover:cm-text-accent-foreground",
      },
      size: {
        default: "cm-h-10 cm-px-3",
        sm: "cm-h-9 cm-px-2.5",
        lg: "cm-h-11 cm-px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
