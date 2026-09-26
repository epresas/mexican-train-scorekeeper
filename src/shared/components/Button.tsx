import type { ButtonHTMLAttributes, ReactNode } from "react"

type Variant = "primary" | "secondary" | "danger" | "ghost"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-bg hover:bg-primary/90 focus-visible:ring-primary/60",
  secondary:
    "bg-surface text-text-primary border border-border hover:bg-border/50 focus-visible:ring-border",
  danger:
    "bg-danger text-text-primary hover:bg-danger/90 focus-visible:ring-danger/60",
  ghost:
    "bg-transparent text-muted hover:text-text-primary hover:bg-surface focus-visible:ring-border",
}

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3.5 gap-2",
}

export const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-lg font-bold",
        "transition-colors focus:outline-none focus-visible:ring-2",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}
