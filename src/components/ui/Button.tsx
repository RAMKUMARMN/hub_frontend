type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
};

export default function Button({
  children,
  onClick,
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const variants = {
    primary:
      "bg-cixio-blue text-white hover:bg-cixio-hover",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-cixio ${className}`}
    >
      {children}
    </button>
  );
}