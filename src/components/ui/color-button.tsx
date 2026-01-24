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
          "bg-gradient-to-r from-beauty-rose to-beauty-coral text-white shadow-card hover:shadow-elevated hover:opacity-90",
        secondary:
          "bg-gradient-to-r from-beauty-lavender/20 to-beauty-blush/30 text-foreground hover:from-beauty-lavender/30 hover:to-beauty-blush/40 border border-beauty-lavender/30",
        outline:
          "border-2 border-beauty-rose/30 bg-transparent hover:bg-beauty-blush/20 hover:border-beauty-rose/50",
        ghost: "hover:bg-beauty-blush/20 hover:text-beauty-rose",
        accent:
          "bg-gradient-to-r from-beauty-peach to-beauty-coral/40 text-foreground hover:opacity-90",
        camera:
          "bg-gradient-to-r from-beauty-rose to-beauty-coral text-white shadow-elevated hover:shadow-picker",
        gallery:
          "bg-gradient-to-r from-beauty-lavender/15 to-beauty-blush/25 text-foreground border border-beauty-lavender/30 shadow-card hover:shadow-elevated hover:border-beauty-lavender/50",
        analyze:
          "bg-gradient-to-r from-beauty-rose via-beauty-coral to-beauty-lavender text-white shadow-elevated hover:shadow-picker",
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
