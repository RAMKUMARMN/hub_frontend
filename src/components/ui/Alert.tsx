type AlertProps = {
  message: string;
};

export default function Alert({
  message,
}: AlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <p className="text-red-600 text-sm">
        {message}
      </p>
    </div>
  );
}