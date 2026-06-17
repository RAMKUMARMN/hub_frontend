type TextAreaProps = {
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  rows?: number;
};

export default function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
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
      "
    />
  );
}