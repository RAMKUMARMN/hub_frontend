type ToastProps = {
  message: string;
};

export default function Toast({
  message,
}: ToastProps) {
  return (
    <div
      className="
        fixed
        bottom-4
        right-4
        bg-cixio-blue
        text-white
        px-4
        py-2
        rounded-lg
        shadow-lg
      "
    >
      {message}
    </div>
  );
}