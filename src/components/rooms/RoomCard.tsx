import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Room } from "@/lib/rooms";

export default function RoomCard({ room }: { room: Room }) {
  const Icon = room.icon;
  return (
    <Link to={"/salas/" + room.slug} className="group block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="glass-deep relative h-full overflow-hidden rounded-3xl p-5 transition duration-300 group-hover:border-glow-400/40"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-70"
          style={{ background: "radial-gradient(140px 120px at 18% 0%, " + room.accent + "33, transparent 72%)" }}
        />
        <span
          className="relative grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-ink-950/50"
          style={{ boxShadow: "0 0 28px -8px " + room.accent + "88" }}
        >
          <Icon className="h-6 w-6" style={{ color: room.accent }} />
        </span>
        <h3 className="relative mt-4 font-display text-lg font-extrabold tracking-tight text-white">{room.name}</h3>
        <p className="relative mt-1 text-sm text-haze-300">{room.tagline}</p>
        <p className="relative mt-3 text-xs leading-5 text-haze-500">{room.audience}</p>
        <div className="relative mt-4 flex flex-wrap gap-1.5">
          {room.modules.slice(0, 4).map(function render(module) {
            return (
              <span
                key={module.id}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-haze-300"
              >
                {module.label}
              </span>
            );
          })}
        </div>
        <span className="relative mt-5 inline-flex items-center gap-2 text-xs font-bold text-glow-400">
          {room.modules.length} modulos
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </motion.div>
    </Link>
  );
}
