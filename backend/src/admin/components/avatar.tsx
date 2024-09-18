export const Avatar = ({ src, fallback, alt }) => {
  return (
    <div className="rounded-full bg-ui-bg-base overflow-hidden w-6 h-6 object-cover m-1">
      {src ? <img src={src} alt={alt} /> : fallback}
    </div>
  );
};
