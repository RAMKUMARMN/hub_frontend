type CardProps = {
  children: React.ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <div className="card-cixio p-6">
      {children}
    </div>
  );
}