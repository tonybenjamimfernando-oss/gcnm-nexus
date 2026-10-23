import { useState, type ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Store as StoreIcon } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import ServiceGrid from "@/components/stores/ServiceGrid";
import { STORE_CATEGORIES, STORE_TIERS, defaultServices, tierLabel } from "@/lib/storeServices";
import { createStore, setStoreService, slugFrom } from "@/lib/stores";
import { useSession } from "@/lib/session";
import { isKnownCurrency } from "@/lib/currencies";
import { cn } from "@/lib/cn";

const CURRENCY_CODES = ["USD", "EUR", "MZN", "AOA", "BRL", "ZAR", "GBP", "CAD", "CHF", "AED"];
const ACCENTS = ["ember", "glow", "coral", "lime"];

const INPUT = "mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-normal tracking-normal text-white outline-none focus:border-glow-400/60";

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={cn("block text-xs font-semibold uppercase tracking-[0.18em] text-haze-500", wide ? "md:col-span-2" : "")}>
      {label}
      {children}
    </label>
  );
}

export default function StoreBuilder() {
  const { user, ready } = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(STORE_CATEGORIES[0]);
  const [currency, setCurrency] = useState("USD");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [accent, setAccent] = useState("ember");
  const [tier, setTier] = useState("starter");
  const [services, setServices] = useState<Record<string, boolean>>(defaultServices("starter"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return null;
  if (!user) return <Navigate to="/entrar" replace />;

  const finalSlug = slugFrom(slug.length > 0 ? slug : name);
  const active = Object.keys(services).filter(function on(key) {
    return services[key];
  });
  const steps = ["Identidade", "Servicos", "Publicar"];

  function pickTier(next: string) {
    setTier(next);
    setServices(defaultServices(next));
  }

  async function publish() {
    if (!user || saving) return;
    if (name.trim().length < 3) {
      setError("Escolhe um nome com pelo menos 3 letras.");
      setStep(0);
      return;
    }
    if (finalSlug.length < 3) {
      setError("O endereco da loja precisa de pelo menos 3 letras.");
      setStep(0);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const id = await createStore({
        ownerId: user.id,
        name: name.trim(),
        slug: finalSlug,
        tagline: tagline.trim(),
        description: description.trim(),
        category: category,
        accent: accent,
        country: country.trim(),
        city: city.trim(),
        currency: currency,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        website: "",
        tier: tier,
        status: "active",
      });
      for (const service of active) {
        await setStoreService(id, service, true);
      }
      navigate("/lojas/painel");
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Nao foi possivel abrir a loja.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ember-400">Incubadora</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">Montar a minha loja</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-haze-300">
        Tres passos: a identidade da loja, os servicos que queres ligar e a publicacao da montra.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {steps.map(function render(label, index) {
          return (
            <span
              key={label}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold",
                index === step ? "border-glow-400/60 bg-white/10 text-white" : "border-white/10 text-haze-500",
              )}
            >
              {index + 1}. {label}
            </span>
          );
        })}
      </div>

      <GlassCard tone="strong" className="mt-6 p-6 md:p-8">
        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome da loja">
              <input value={name} onChange={function change(event) { setName(event.target.value); }} placeholder="Solar Lusitana" className={INPUT} />
            </Field>
            <Field label="Endereco publico">
              <input value={slug} onChange={function change(event) { setSlug(event.target.value); }} placeholder={slugFrom(name) || "a-minha-loja"} className={INPUT} />
            </Field>
            <Field label="Frase curta" wide>
              <input value={tagline} onChange={function change(event) { setTagline(event.target.value); }} placeholder="Energia solar para casas e empresas" className={INPUT} />
            </Field>
            <Field label="Descricao" wide>
              <textarea value={description} onChange={function change(event) { setDescription(event.target.value); }} rows={3} placeholder="O que vende, como trabalha e o que promete." className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-normal tracking-normal text-white outline-none focus:border-glow-400/60" />
            </Field>
            <Field label="Sector">
              <select value={category} onChange={function change(event) { setCategory(event.target.value); }} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink-900 px-3 text-sm font-normal tracking-normal text-white outline-none focus:border-glow-400/60">
                {STORE_CATEGORIES.map(function render(item) {
                  return <option key={item} value={item}>{item}</option>;
                })}
              </select>
            </Field>
            <Field label="Moeda da loja">
              <select value={currency} onChange={function change(event) { setCurrency(event.target.value); }} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink-900 px-3 text-sm font-normal tracking-normal text-white outline-none focus:border-glow-400/60">
                {CURRENCY_CODES.map(function render(code) {
                  return <option key={code} value={code}>{code}{isKnownCurrency(code) ? "" : " (por confirmar)"}</option>;
                })}
              </select>
            </Field>
            <Field label="Cidade">
              <input value={city} onChange={function change(event) { setCity(event.target.value); }} placeholder="Maputo" className={INPUT} />
            </Field>
            <Field label="Pais">
              <input value={country} onChange={function change(event) { setCountry(event.target.value); }} placeholder="Mocambique" className={INPUT} />
            </Field>
            <Field label="Email de contacto">
              <input value={contactEmail} onChange={function change(event) { setContactEmail(event.target.value); }} placeholder="vendas@aminhaloja.com" className={INPUT} />
            </Field>
            <Field label="Telefone">
              <input value={contactPhone} onChange={function change(event) { setContactPhone(event.target.value); }} placeholder="+258 84 000 0000" className={INPUT} />
            </Field>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-haze-500">Tom da loja</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACCENTS.map(function render(item) {
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={function pick() { setAccent(item); }}
                      className={cn("rounded-full border px-3.5 py-1.5 text-xs font-semibold transition", accent === item ? "border-glow-400/60 bg-white/10 text-white" : "border-white/10 text-haze-300")}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <div className="grid gap-2 md:grid-cols-3">
              {STORE_TIERS.map(function render(item) {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={function pick() { pickTier(item.key); }}
                    className={cn(
                      "neo rounded-2xl p-4 text-left transition",
                      tier === item.key ? "neo-glow" : "",
                    )}
                  >
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="mt-1 text-[11px] leading-5 text-haze-500">{item.blurb}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-haze-500">Nivel escolhido: {tierLabel(tier)}. Podes mudar depois, sem perder dados.</p>
            <div className="mt-5">
              <ServiceGrid
                state={services}
                tier={tier}
                editable
                onToggle={function toggle(key, next) {
                  setServices(Object.assign({}, services, { [key]: next }));
                }}
              />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="font-display text-xl font-extrabold text-white">{name || "A minha loja"}</h2>
              <p className="mt-1 text-sm text-haze-300">{tagline || "Sem frase curta."}</p>
              <p className="mt-3 text-xs text-haze-500">
                /loja/{finalSlug || "a-minha-loja"} - {category} - {city || "cidade por definir"}
              </p>
              <p className="mt-4 text-sm leading-6 text-haze-300">{description || "Sem descricao."}</p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-haze-300">
                <StoreIcon className="h-3.5 w-3.5 text-ember-400" />
                {tierLabel(tier)} - {active.length} servicos ligados
              </p>
            </div>
            <div className="neo rounded-2xl p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-haze-500">Pre-visualizacao</p>
              <p className="mt-3 text-xs leading-6 text-haze-300">
                A loja fica publica e passa a receber codigos de afiliado. Podes editar identidade, servicos e contactos a
                qualquer momento no painel da loja.
              </p>
              <ul className="mt-4 grid gap-2 text-xs text-haze-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-mint-400" />
                  Montra publica
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-mint-400" />
                  Servicos ajustaveis depois
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-mint-400" />
                  Comissao de afiliados definida por ti
                </li>
              </ul>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-coral-400">{error}</p> : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <GlowButton
            variant="ghost"
            size="md"
            onClick={function back() {
              setStep(Math.max(0, step - 1));
            }}
            disabled={step === 0 || saving}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </GlowButton>
          {step < 2 ? (
            <GlowButton
              size="md"
              onClick={function next() {
                setError(null);
                setStep(step + 1);
              }}
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </GlowButton>
          ) : (
            <GlowButton size="md" onClick={publish} disabled={saving}>
              <Check className="h-4 w-4" />
              {saving ? "A publicar" : "Publicar a loja"}
            </GlowButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
