import { Loader2 } from "lucide-react";

export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-haze-300">
      <Loader2 className="h-5 w-5 animate-spin text-glow-400" />
      {label ? <span>{label}</span> : <span>A carregar</span>}
    </div>
  );
}
