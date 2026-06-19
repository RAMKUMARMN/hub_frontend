type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div className={`card-cixio p-6 ${className}`}>
      {children}
    </div>
  );
}