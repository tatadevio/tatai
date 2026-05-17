/* eslint-disable @next/next/no-img-element */
export function TataILogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img
      src="/icon-512.png"
      alt="tatAI"
      className={`rounded-2xl object-cover ${className}`}
    />
  );
}
