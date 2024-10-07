import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "../lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "cm-z-[9999] cm-w-72 cm-rounded-md cm-border cm-bg-popover cm-p-4 cm-text-popover-foreground cm-shadow-md cm-outline-none data-[state=open]:cm-animate-in data-[state=closed]:cm-animate-out data-[state=closed]:cm-fade-out-0 data-[state=open]:cm-fade-in-0 data-[state=closed]:cm-zoom-out-95 data-[state=open]:cm-zoom-in-95 data-[side=bottom]:cm-slide-in-from-top-2 data-[side=left]:cm-slide-in-from-right-2 data-[side=right]:cm-slide-in-from-left-2 data-[side=top]:cm-slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverContent, PopoverTrigger };
