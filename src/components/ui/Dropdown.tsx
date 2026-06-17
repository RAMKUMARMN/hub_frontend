import { useState } from "react";

type DropdownProps = {
  label: string;
  items: string[];
};

export default function Dropdown({
  label,
  items,
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="btn-cixio"
      >
        {label}
      </button>

      {open && (
        <div className="absolute mt-2 w-40 bg-white rounded-lg shadow-lg border">
          {items.map((item) => (
            <button
              key={item}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}