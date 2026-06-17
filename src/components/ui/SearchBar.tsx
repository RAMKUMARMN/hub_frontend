type SearchBarProps = {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-cixio"
    />
  );
}