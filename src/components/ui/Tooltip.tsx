type TooltipProps = {
  text: string;
  children: React.ReactNode;
};

export default function Tooltip({
  text,
  children,
}: TooltipProps) {
  return (
    <div className="relative inline-block group">
      {children}

      <div
        className="
          absolute
          bottom-full
          left-1/2
          -translate-x-1/2
          mb-2
          hidden
          group-hover:block
          bg-cixio-dark
          text-white
          text-xs
          px-2
          py-1
          rounded
          whitespace-nowrap
        "
      >
        {text}
      </div>
    </div>
  );
}