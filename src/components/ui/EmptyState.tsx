import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export default function EmptyState({ title, description, action, icon }: Props) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-3xl px-6 py-14 text-center">
      {icon ? <div className="text-glow-400">{icon}</div> : null}
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      {description ? <p className="max-w-md text-sm leading-6 text-haze-300">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
