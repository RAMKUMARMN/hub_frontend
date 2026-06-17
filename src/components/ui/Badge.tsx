type BadgeProps = {
  children: React.ReactNode;
};

export default function Badge({
  children,
}: BadgeProps) {
  return (
    <span
      className="
        inline-flex
        items-center
        rounded-full
        bg-cixio-light
        text-cixio-dark
        px-2.5
        py-1
        text-xs
        font-medium
      "
    >
      {children}
    </span>
  );
}