import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "../lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "cm-z-[9999] cm-overflow-hidden cm-rounded-md cm-border cm-bg-popover cm-px-3 cm-py-1.5 cm-text-sm cm-text-popover-foreground cm-shadow-md cm-animate-in cm-fade-in-0 cm-zoom-in-95 data-[state=closed]:cm-animate-out data-[state=closed]:cm-fade-out-0 data-[state=closed]:cm-zoom-out-95 data-[side=bottom]:cm-slide-in-from-top-2 data-[side=left]:cm-slide-in-from-right-2 data-[side=right]:cm-slide-in-from-left-2 data-[side=top]:cm-slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
