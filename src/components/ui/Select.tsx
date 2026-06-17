type SelectProps = {
  options: string[];
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
};

export default function Select({
  options,
  value,
  onChange,
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="input-cixio"
    >
      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
}