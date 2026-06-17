type AvatarProps = {
  name: string;
};

export default function Avatar({
  name,
}: AvatarProps) {
  return (
    <div className="
      w-8
      h-8
      rounded-full
      bg-cixio-blue
      flex
      items-center
      justify-center
      text-white
      text-sm
      font-bold
    ">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}