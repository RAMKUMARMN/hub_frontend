type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-20 h-20 text-2xl",
};

export default function Avatar({
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-cixio-dark
        flex
        items-center
        justify-center
        text-white
        font-bold
        ${className}
      `}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}