type SpinnerProps = {
  size?: "sm" | "md" | "lg";
};

export default function Spinner({
  size = "md",
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-4",
    lg: "w-8 h-8 border-4",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`
        ${sizeClasses[size]}
        border-cixio-light
        border-t-cixio-blue
        rounded-full
        animate-spin
      `}
    />
  );
}