export function MenuzIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logos/menuz-icon.png"
      alt="مينوز | MENUZ"
      width={size}
      height={size}
      className={`rounded-2xl object-contain ${className}`}
      style={{ width: size, height: size }}
      loading="eager"
    />
  );
}

export function MenuzFull({ className = '' }: { className?: string }) {
  return (
    <img
      src="/logos/menuz-full-1200.webp"
      alt="مينوز | MENUZ — القائمة الرقمية الذكية"
      className={`object-contain ${className}`}
      loading="eager"
    />
  );
}

export function SamerzLogo({ size = 44, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/logos/samerz-512.webp"
      alt="شركة سامرز للحلول الذكية"
      width={size}
      height={size}
      className={`rounded-xl object-contain ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}
