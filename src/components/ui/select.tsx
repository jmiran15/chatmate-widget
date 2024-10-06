import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "cm-flex cm-h-10 cm-w-full cm-items-center cm-justify-between cm-rounded-md cm-border cm-border-input cm-bg-background cm-px-3 cm-py-2 cm-text-sm cm-ring-offset-background placeholder:cm-text-muted-foreground focus:cm-outline-none focus:cm-ring-2 focus:cm-ring-ring focus:cm-ring-offset-2 disabled:cm-cursor-not-allowed disabled:cm-opacity-50 [&>span]:cm-line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="cm-h-4 cm-w-4 cm-opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "cm-flex cm-cursor-default cm-items-center cm-justify-center cm-py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="cm-h-4 cm-w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "cm-flex cm-cursor-default cm-items-center cm-justify-center cm-py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="cm-h-4 cm-w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "cm-relative cm-z-[9999] cm-max-h-96 cm-min-w-[8rem] cm-overflow-hidden cm-rounded-md cm-border cm-bg-popover cm-text-popover-foreground cm-shadow-md data-[state=open]:cm-animate-in data-[state=closed]:cm-animate-out data-[state=closed]:cm-fade-out-0 data-[state=open]:cm-fade-in-0 data-[state=closed]:cm-zoom-out-95 data-[state=open]:cm-zoom-in-95 data-[side=bottom]:cm-slide-in-from-top-2 data-[side=left]:cm-slide-in-from-right-2 data-[side=right]:cm-slide-in-from-left-2 data-[side=top]:cm-slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:cm-translate-y-1 data-[side=left]:cm--translate-x-1 data-[side=right]:cm-translate-x-1 data-[side=top]:cm--translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "cm-p-1",
          position === "popper" &&
            "cm-h-[var(--radix-select-trigger-height)] cm-w-full cm-min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "cm-py-1.5 cm-pl-8 cm-pr-2 cm-text-sm cm-font-semibold",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "cm-relative cm-flex cm-w-full cm-cursor-default cm-select-none cm-items-center cm-rounded-sm cm-py-1.5 cm-pl-8 cm-pr-2 cm-text-sm cm-outline-none focus:cm-bg-accent focus:cm-text-accent-foreground data-[disabled]:cm-pointer-events-none data-[disabled]:cm-opacity-50",
      className
    )}
    {...props}
  >
    <span className="cm-absolute cm-left-2 cm-flex cm-h-3.5 cm-w-3.5 cm-items-center cm-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="cm-h-4 cm-w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("cm--mx-1 cm-my-1 cm-h-px cm-bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
