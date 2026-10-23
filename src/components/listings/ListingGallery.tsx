import { useState } from "react";
import { cn } from "@/lib/cn";

export default function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : ["https://picsum.photos/seed/gcnm-placeholder/1200/750"];

  return (
    <div>
      <div className="glass overflow-hidden rounded-3xl">
        <img
          src={list[Math.min(active, list.length - 1)]}
          alt={title}
          className="aspect-[16/10] w-full object-cover"
        />
      </div>
      {list.length > 1 ? (
        <div className="scroll-x mt-3 gap-3">
          {list.map(function render(image, index) {
            return (
              <button
                key={image}
                type="button"
                onClick={function pick() {
                  setActive(index);
                }}
                className={cn(
                  "h-16 w-24 shrink-0 overflow-hidden rounded-2xl border transition",
                  index === active ? "border-glow-400/70" : "border-white/10 opacity-70 hover:opacity-100",
                )}
                aria-label={"Ver imagem " + String(index + 1)}
              >
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
