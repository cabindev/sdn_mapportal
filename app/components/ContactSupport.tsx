// app/components/ContactSupport.tsx
"use client";

export default function ContactSupport() {
  const handleClick = () => {
    window.open('tel:0859387714', '_self');
  };

  return (
    <div className="fixed bottom-4 left-4 z-[10000]">
      <button
        onClick={handleClick}
        className="px-3 py-2 text-white text-xs "
      >
        yellowDev 0859387714
      </button>
    </div>
  );
}