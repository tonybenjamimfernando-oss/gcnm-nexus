import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Room, RoomModule } from "@/lib/rooms";

function scrollToId(id: string) {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ModuleShell({ module, index, children }: { module: RoomModule; index: number; children?: never }) {
  return (
    <div className="glass h-full rounded-2xl p-4 transition hover:border-glow-400/40">
      <span className="font-display text-[11px] font-bold text-haze-500">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="mt-2 font-display text-sm font-bold text-white">{module.label}</h3>
      <p className="mt-1 text-xs leading-5 text-haze-300">{module.blurb}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-glow-400">
        Abrir
        <ArrowUpRight className="h-3 w-3" />
      </span>
    </div>
  );
}

export default function RoomModules({ room }: { room: Room }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {room.modules.map(function render(module, index) {
        const hashIndex = module.to.indexOf("#");
        if (hashIndex !== -1) {
          const id = module.to.slice(hashIndex + 1);
          return (
            <button
              key={module.id}
              type="button"
              onClick={function jump() {
                scrollToId(id);
              }}
              className="text-left"
            >
              <ModuleShell module={module} index={index} />
            </button>
          );
        }
        return (
          <Link key={module.id} to={module.to} className="block h-full">
            <ModuleShell module={module} index={index} />
          </Link>
        );
      })}
    </div>
  );
}
