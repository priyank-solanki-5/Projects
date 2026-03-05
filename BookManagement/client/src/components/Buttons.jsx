import React from "react";

// Reusable Button component with variants to match project's UI style
// Usage: <Button variant="primary" onClick={...}>Label</Button>
export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-md shadow-sm transition-colors";

  const variants = {
    primary: "bg-green-500 text-white hover:bg-green-600",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  };

  const v = variants[variant] || variants.primary;

  // default padding and sizing, allow overriding via className
  const size = "px-4 py-2 text-sm";

  return (
    <button className={`${base} ${v} ${size} ${className}`} {...props}>
      {children}
    </button>
  );
}
