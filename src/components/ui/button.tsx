import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "cm-inline-flex cm-items-center cm-justify-center cm-whitespace-nowrap cm-rounded-md cm-text-sm cm-font-medium cm-ring-offset-background cm-transition-colors focus-visible:cm-outline-none focus-visible:cm-ring-2 focus-visible:cm-ring-ring focus-visible:cm-ring-offset-2 disabled:cm-pointer-events-none disabled:cm-opacity-50",
  {
    variants: {
      variant: {
        default:
          "cm-bg-primary cm-text-primary-foreground hover:cm-bg-primary/90",
        destructive:
          "cm-bg-destructive cm-text-destructive-foreground hover:cm-bg-destructive/90",
        outline:
          "cm-border cm-border-input cm-bg-background hover:cm-bg-accent hover:cm-text-accent-foreground",
        secondary:
          "cm-bg-secondary cm-text-secondary-foreground hover:cm-bg-secondary/80",
        ghost: "hover:cm-bg-accent hover:cm-text-accent-foreground",
        link: "cm-text-primary cm-underline-offset-4 hover:cm-underline",
      },
      size: {
        default: "cm-h-10 cm-px-4 cm-py-2",
        sm: "cm-h-9 cm-rounded-md cm-px-3",
        lg: "cm-h-11 cm-rounded-md cm-px-8",
        icon: "cm-h-10 cm-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
