type TextAreaProps = {
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  label?: string;
  helperText?: string;
};

export default function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
  label,
  helperText,
}: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {label}
        </label>
      )}

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="
          w-full
          border
          border-gray-200
          rounded-lg
          px-3
          py-2.5
          bg-white
          focus:outline-none
          focus:ring-2
          focus:ring-cixio-blue
          focus:border-cixio-blue
          transition
          text-sm
          disabled:bg-gray-100
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      />

      {helperText && (
        <p className="mt-2 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}