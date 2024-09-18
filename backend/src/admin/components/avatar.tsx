export const Avatar = ({ src, fallback, alt }) => {
  return (
    <div className="flex rounded-full bg-ui-bg-highlight-hover overflow-hidden w-6 h-6 object-cover items-center justify-center font-bold">
      {src ? <img src={src} alt={alt} /> : fallback}
    </div>
  );
};
