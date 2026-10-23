import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1",
        className,
      )}
    >
      <Languages className="ml-1.5 h-4 w-4 text-haze-500" />
      {(["pt", "en"] as const).map(function render(code) {
        return (
          <button
            key={code}
            type="button"
            onClick={function pick() {
              setLang(code);
            }}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition",
              lang === code ? "bg-white/15 text-white" : "text-haze-400 hover:text-white",
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
