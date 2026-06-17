type LabelProps = {
  children: React.ReactNode;
  htmlFor?: string;
};

export default function Label({
  children,
  htmlFor,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold mb-1.5 text-gray-700"
    >
      {children}
    </label>
  );
}