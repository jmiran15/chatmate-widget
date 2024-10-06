import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "../lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "cm-relative cm-flex cm-w-full cm-touch-none cm-select-none cm-items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="cm-relative cm-h-2 cm-w-full cm-grow cm-overflow-hidden cm-rounded-full cm-bg-secondary">
      <SliderPrimitive.Range className="cm-absolute cm-h-full cm-bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="cm-block cm-h-5 cm-w-5 cm-rounded-full cm-border-2 cm-border-primary cm-bg-background cm-ring-offset-background cm-transition-colors focus-visible:cm-outline-none focus-visible:cm-ring-2 focus-visible:cm-ring-ring focus-visible:cm-ring-offset-2 disabled:cm-pointer-events-none disabled:cm-opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
