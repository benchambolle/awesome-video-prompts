"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export interface ButtonGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  variant?:
    | "beta"
    | "orange"
    | "red"
    | "blue"
    | "green"
    | "purple"
    | "yellow"
    | "cyan"
    | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      options,
      value,
      onValueChange,
      variant = "default",
      size = "md",
      className,
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-2 text-sm",
      lg: "px-4 py-3 text-base",
    };

    const getButtonClasses = (
      option: ButtonGroupOption,
      isSelected: boolean,
      position: "first" | "middle" | "last" | "single",
    ) => {
      const baseClasses = `
        ${sizeClasses[size]} 
        font-medium transition-all duration-200 
        border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
        backdrop-blur-sm relative z-10
        disabled:opacity-50 disabled:cursor-not-allowed
      `;

      // Position-specific border classes (sharp corners, no rounded)
      const positionClasses = {
        single: "border",
        first: "border border-r-0",
        middle: "border-y border-r-0 -ml-px",
        last: "border -ml-px",
      };

      // Variant-specific classes based on selection state
      const variantClasses = (() => {
        const variants = {
          beta: isSelected
            ? "border-[oklch(0.75_0.15_70)] text-[oklch(0.75_0.15_70)] bg-[oklch(0.75_0.15_70)]/20 shadow-sm z-20"
            : "border-[oklch(0.75_0.15_70)]/40 text-[oklch(0.75_0.15_70)]/70 bg-[oklch(0.75_0.15_70)]/5 hover:bg-[oklch(0.75_0.15_70)]/15",
          orange: isSelected
            ? "border-orange text-orange bg-orange/20 shadow-sm z-20"
            : "border-orange/40 text-orange/70 bg-orange/5 hover:bg-orange/15",
          red: isSelected
            ? "border-red text-red bg-red/20 shadow-sm z-20"
            : "border-red/40 text-red/70 bg-red/5 hover:bg-red/15",
          blue: isSelected
            ? "border-blue text-blue bg-blue/20 shadow-sm z-20"
            : "border-blue/40 text-blue/70 bg-blue/5 hover:bg-blue/15",
          green: isSelected
            ? "border-green text-green bg-green/20 shadow-sm z-20"
            : "border-green/40 text-green/70 bg-green/5 hover:bg-green/15",
          purple: isSelected
            ? "border-purple text-purple bg-purple/20 shadow-sm z-20"
            : "border-purple/40 text-purple/70 bg-purple/5 hover:bg-purple/15",
          yellow: isSelected
            ? "border-yellow text-yellow bg-yellow/20 shadow-sm z-20"
            : "border-yellow/40 text-yellow/70 bg-yellow/5 hover:bg-yellow/15",
          cyan: isSelected
            ? "border-cyan text-cyan bg-cyan/20 shadow-sm z-20"
            : "border-cyan/40 text-cyan/70 bg-cyan/5 hover:bg-cyan/15",
          default: isSelected
            ? "border-foreground text-foreground bg-foreground/10 shadow-sm z-20"
            : "border-border text-muted-foreground bg-background hover:bg-muted hover:text-foreground",
        };
        return variants[variant];
      })();

      return cn(baseClasses, positionClasses[position], variantClasses);
    };

    const getPosition = (
      index: number,
      total: number,
    ): "first" | "middle" | "last" | "single" => {
      if (total === 1) return "single";
      if (index === 0) return "first";
      if (index === total - 1) return "last";
      return "middle";
    };

    return (
      <div ref={ref} className={cn("inline-flex", className)} role="group">
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const position = getPosition(index, options.length);

          return (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => onValueChange?.(option.value)}
              className={getButtonClasses(option, isSelected, position)}
              aria-pressed={isSelected}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
