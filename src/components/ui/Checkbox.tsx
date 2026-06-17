type CheckboxProps = {
  checked: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  label?: string;
};

export default function Checkbox({
  checked,
  onChange,
  label,
}: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  );
}