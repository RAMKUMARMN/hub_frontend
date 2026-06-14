import type { UseFormRegisterReturn } from "react-hook-form";

type AuthTextFieldProps = {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  registration: UseFormRegisterReturn;
};

export default function AuthTextField({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  error,
  registration,
}: AuthTextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-cixio-light">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="input-cixio mt-1.5 dark:border-white/10 dark:bg-[#111F3D] dark:text-white dark:placeholder:text-cixio-light/35"
        {...registration}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
