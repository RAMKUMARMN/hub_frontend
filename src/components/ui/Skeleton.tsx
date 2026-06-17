type SkeletonProps = {
  height?: string;
};

export default function Skeleton({
  height = "h-4",
}: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse
        bg-gray-200
        rounded
        w-full
        ${height}
      `}
    />
  );
}