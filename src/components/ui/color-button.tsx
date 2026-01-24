import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const colorButtonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-card hover:shadow-elevated hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border-2 border-border bg-transparent hover:bg-secondary hover:border-primary/20",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/80",
        camera:
          "bg-primary text-primary-foreground shadow-elevated hover:shadow-picker",
        gallery:
          "bg-card text-card-foreground border border-border shadow-card hover:shadow-elevated hover:border-primary/30",
        analyze:
          "bg-primary text-primary-foreground shadow-elevated hover:shadow-picker",
      },
      size: {
        sm: "h-10 px-4 text-sm rounded-lg",
        default: "h-14 px-8 text-base rounded-xl",
        lg: "h-16 px-10 text-lg rounded-2xl",
        xl: "h-20 px-12 text-xl rounded-2xl",
        icon: "h-12 w-12 rounded-xl",
        "icon-lg": "h-16 w-16 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ColorButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof colorButtonVariants> {
  asChild?: boolean;
}

const ColorButton = React.forwardRef<HTMLButtonElement, ColorButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(colorButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ColorButton.displayName = "ColorButton";

export { ColorButton, colorButtonVariants };
