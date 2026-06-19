type SelectProps = {
  options: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
};

export default function Select({
  options,
  value,
  onChange,
  className = "",
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`input-cixio ${className}`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}