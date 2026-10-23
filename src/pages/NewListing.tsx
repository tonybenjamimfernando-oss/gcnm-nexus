import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ImagePlus, Save, Send, Trash2, X } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import GlassCard from "@/components/ui/GlassCard";
import GlowButton from "@/components/ui/GlowButton";
import Spinner from "@/components/ui/Spinner";
import { createListing, getListing, updateListing } from "@/lib/api";
import type { ListingDraft } from "@/lib/api";
import { CURRENCIES, PRIORITY_CURRENCIES } from "@/lib/currencies";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/cn";

const KINDS = [
  { id: "product", label: "Produto", hint: "Vende bens concretos, com estado, garantia e entrega." },
  { id: "service", label: "Servico", hint: "Oferece trabalho tecnico, consultoria ou assistencia." },
  { id: "request", label: "Pedido de compra", hint: "Descreve o que precisa e recebe propostas de fornecedores." },
  { id: "opportunity", label: "Oportunidade", hint: "Partilha parcerias, revenda ou negocios a explorar." },
];

const CONDITIONS = ["novo", "como novo", "usado", "recondicionado"];

const CURRENCY_OPTIONS = Array.from(new Set(PRIORITY_CURRENCIES.concat(CURRENCIES)));

type FormState = {
  kind: string;
  title: string;
  category: string;
  description: string;
  features: string;
  price: string;
  currency: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  brand: string;
  condition: string;
  warranty: string;
  delivery: string;
  returns: string;
  stock: string;
  quantity: string;
  budget: string;
  deadline: string;
};

const EMPTY: FormState = {
  kind: "product",
  title: "",
  category: "",
  description: "",
  features: "",
  price: "",
  currency: "EUR",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
  brand: "",
  condition: "novo",
  warranty: "",
  delivery: "",
  returns: "",
  stock: "",
  quantity: "",
  budget: "",
  deadline: "",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-haze-500">{label}</span>
      {children}
    </label>
  );
}

const INPUT =
  "mt-1.5 h-12 w-full rounded-2xl border border-white/10 bg-ink-900/50 px-4 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60";

function numberOrNull(value: string): number | null {
  const clean = value.trim().replace(",", ".");
  if (clean.length === 0) return null;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function NewListing() {
  const params = useSearchParams();
  const search = params[0];
  const navigate = useNavigate();
  const { user, ready } = useSession();
  const editId = search.get("id") || "";

  const [draft, setDraft] = useState<FormState>(EMPTY);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(editId.length > 0);
  const [notMine, setNotMine] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    function load() {
      if (editId.length === 0) return;
      let active = true;
      async function run() {
        const item = await getListing(editId);
        if (!active) return;
        if (!item || !user || item.ownerId !== user.id) {
          setNotMine(true);
          setLoading(false);
          return;
        }
        setDraft({
          kind: item.kind,
          title: item.title,
          category: item.category,
          description: item.description || "",
          features: item.features ? item.features.split(" | ").join("\n") : "",
          price: item.price === null ? "" : String(item.price),
          currency: item.currency,
          city: item.city || "",
          country: item.country || "",
          latitude: item.latitude === null ? "" : String(item.latitude),
          longitude: item.longitude === null ? "" : String(item.longitude),
          brand: item.brand || "",
          condition: item.condition || "novo",
          warranty: item.warranty || "",
          delivery: item.delivery || "",
          returns: item.returnsPolicy || "",
          stock: item.stock === null ? "" : String(item.stock),
          quantity: item.quantity === null ? "" : String(item.quantity),
          budget: item.budgetMax === null ? "" : String(item.budgetMax),
          deadline: item.deadline || "",
        });
        setImages(item.images);
        setLoading(false);
      }
      run();
      return function stop() {
        active = false;
      };
    },
    [editId, user],
  );

  function set(key: keyof FormState, value: string) {
    setDraft(function patch(current) {
      const next = { ...current };
      next[key] = value;
      return next;
    });
  }

  function validate(): string | null {
    if (draft.title.trim().length < 4) return "O titulo precisa de pelo menos 4 caracteres.";
    if (draft.category.trim().length < 2) return "Indique a categoria da oferta.";
    if (draft.description.trim().length < 10) return "Escreva uma descricao com pelo menos 10 caracteres.";
    if (draft.kind === "request" && numberOrNull(draft.budget) === null && numberOrNull(draft.price) === null) {
      return "Indique o orcamento maximo do pedido.";
    }
    if (images.length === 0 && draft.kind === "product") return "Adicione pelo menos uma imagem do produto ou um endereco.";
    return null;
  }

  function buildDraft(): ListingDraft {
    const features = draft.features
      .split("\n")
      .map(function trim(line) {
        return line.trim();
      })
      .filter(function valid(line) {
        return line.length > 0;
      })
      .join(" | ");
    return {
      kind: draft.kind,
      title: draft.title.trim(),
      category: draft.category.trim(),
      description: draft.description.trim(),
      price: draft.kind === "request" ? numberOrNull(draft.price) : numberOrNull(draft.price),
      currency: draft.currency,
      city: draft.city.trim() || null,
      country: draft.country.trim() || null,
      latitude: numberOrNull(draft.latitude),
      longitude: numberOrNull(draft.longitude),
      images: images,
      features: features.length > 0 ? features : null,
      brand: draft.brand.trim() || null,
      condition: draft.kind === "product" ? draft.condition : null,
      warranty: draft.warranty.trim() || null,
      delivery: draft.delivery.trim() || null,
      returnsPolicy: draft.returns.trim() || null,
      stock: draft.kind === "product" ? numberOrNull(draft.stock) : null,
      quantity: draft.kind === "request" ? numberOrNull(draft.quantity) : null,
      budgetMax: draft.kind === "request" ? numberOrNull(draft.budget) : null,
      deadline: draft.kind === "request" && draft.deadline.length > 0 ? draft.deadline : null,
    };
  }

  async function save(status: string) {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (editId.length > 0) {
        await updateListing(editId, user ? user.id : "", buildDraft(), status);
        navigate("/painel", { replace: true });
        return;
      }
      const created = await createListing(user ? user.id : "", buildDraft(), status);
      navigate("/painel", { replace: true });
      void created;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nao foi possivel guardar o anuncio.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    setError(null);
    if (!supabase || !user) {
      setError("O carregamento de ficheiros requer a sessao ligada ao Supabase. Cole um endereco de imagem por agora.");
      return;
    }
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (allowed.indexOf(file.type) === -1) {
      setError("Apenas imagens PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem excede o limite de 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = user.id + "/" + crypto.randomUUID() + "." + ext;
      const result = await supabase.storage.from("media").upload(path, file);
      if (result.error) {
        setError(result.error.message);
        return;
      }
      const url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
      setImages(function next(current) {
        return current.concat([url]);
      });
    } finally {
      setBusy(false);
    }
  }

  function addUrl() {
    const value = imageInput.trim();
    if (value.indexOf("http") !== 0) {
      setError("Cole um endereco de imagem valido (http).");
      return;
    }
    setImages(function next(current) {
      return current.concat([value]);
    });
    setImageInput("");
    setError(null);
  }

  if (!ready) return <Spinner label="A verificar sessao" />;
  if (!user) return <Navigate to="/entrar?next=/publicar" replace />;

  if (notMine) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          title="Anuncio indisponivel"
          description="So o autor pode editar este anuncio."
          action={
            <GlowButton to="/painel" size="sm">
              Voltar ao painel
            </GlowButton>
          }
        />
      </div>
    );
  }

  const activeKind = KINDS.filter(function match(kind) {
    return kind.id === draft.kind;
  })[0];

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/painel" className="text-xs font-bold text-haze-300 transition hover:text-white">
        Voltar ao painel
      </Link>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.28em] text-glow-400">Publicar</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
        {editId.length > 0 ? "Editar anuncio" : "Novo anuncio"}
      </h1>
      <p className="mt-2 text-sm text-haze-300">
        Escolha o tipo de oferta. Cada anuncio passa por revisao antes de ficar visivel no mercado.
      </p>

      {!supabase ? (
        <p className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-400">
          Modo demonstracao: a publicacao real requer a ligacao ao Supabase. Pode preencher e avaliar o formulario.
        </p>
      ) : null}

      <div className="mt-6 grid gap-2 sm:grid-cols-4">
        {KINDS.map(function render(kind) {
          return (
            <button
              key={kind.id}
              type="button"
              disabled={editId.length > 0}
              onClick={function pick() {
                set("kind", kind.id);
              }}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left text-sm font-bold transition",
                draft.kind === kind.id
                  ? "border-glow-400/60 bg-glow-500/15 text-white"
                  : "border-white/10 bg-white/5 text-haze-300 hover:border-glow-400/40 hover:text-white",
              )}
            >
              {kind.label}
            </button>
          );
        })}
      </div>
      {activeKind ? <p className="mt-2 text-xs text-haze-500">{activeKind.hint}</p> : null}

      <GlassCard className="mt-6 p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Titulo">
            <input
              value={draft.title}
              onChange={function change(event) {
                set("title", event.target.value);
              }}
              placeholder="Ex: Painel solar 550W monocristalino"
              className={INPUT}
            />
          </Field>
          <Field label="Categoria">
            <input
              value={draft.category}
              onChange={function change(event) {
                set("category", event.target.value);
              }}
              placeholder="Ex: energia-solar"
              className={INPUT}
            />
          </Field>
          {draft.kind === "request" ? (
            <>
              <Field label="Orcamento maximo">
                <input
                  value={draft.budget}
                  onChange={function change(event) {
                    set("budget", event.target.value);
                  }}
                  inputMode="decimal"
                  placeholder="Ex: 1500"
                  className={INPUT}
                />
              </Field>
              <Field label="Quantidade pretendida">
                <input
                  value={draft.quantity}
                  onChange={function change(event) {
                    set("quantity", event.target.value);
                  }}
                  inputMode="numeric"
                  placeholder="Ex: 10"
                  className={INPUT}
                />
              </Field>
              <Field label="Prazo limite">
                <input
                  type="date"
                  value={draft.deadline}
                  onChange={function change(event) {
                    set("deadline", event.target.value);
                  }}
                  className={INPUT}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Preco (vazio = sob consulta)">
                <input
                  value={draft.price}
                  onChange={function change(event) {
                    set("price", event.target.value);
                  }}
                  inputMode="decimal"
                  placeholder="Ex: 1250"
                  className={INPUT}
                />
              </Field>
              <Field label="Moeda">
                <select
                  value={draft.currency}
                  onChange={function change(event) {
                    set("currency", event.target.value);
                  }}
                  className={INPUT}
                >
                  {CURRENCY_OPTIONS.map(function render(code) {
                    return (
                      <option key={code} value={code} className="bg-ink-900">
                        {code}
                      </option>
                    );
                  })}
                </select>
              </Field>
            </>
          )}
          <Field label="Cidade">
            <input
              value={draft.city}
              onChange={function change(event) {
                set("city", event.target.value);
              }}
              placeholder="Ex: Maputo"
              className={INPUT}
            />
          </Field>
          <Field label="Pais">
            <input
              value={draft.country}
              onChange={function change(event) {
                set("country", event.target.value);
              }}
              placeholder="Ex: Mocambique"
              className={INPUT}
            />
          </Field>
          <Field label="Latitude (opcional)">
            <input
              value={draft.latitude}
              onChange={function change(event) {
                set("latitude", event.target.value);
              }}
              placeholder="Ex: -25.9692"
              className={INPUT}
            />
          </Field>
          <Field label="Longitude (opcional)">
            <input
              value={draft.longitude}
              onChange={function change(event) {
                set("longitude", event.target.value);
              }}
              placeholder="Ex: 32.5732"
              className={INPUT}
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4">
          <Field label="Descricao">
            <textarea
              value={draft.description}
              onChange={function change(event) {
                set("description", event.target.value);
              }}
              rows={5}
              placeholder="Descreva a oferta, condicoes comerciais e o que o comprador recebe."
              className="mt-1.5 w-full rounded-2xl border border-white/10 bg-ink-900/50 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
            />
          </Field>
          <Field label="Caracteristicas (uma por linha)">
            <textarea
              value={draft.features}
              onChange={function change(event) {
                set("features", event.target.value);
              }}
              rows={3}
              placeholder={"Ex:\nGarantia de 10 anos\nCertificado TUV"}
              className="mt-1.5 w-full rounded-2xl border border-white/10 bg-ink-900/50 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
            />
          </Field>
        </div>

        {draft.kind === "product" ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Estado">
              <select
                value={draft.condition}
                onChange={function change(event) {
                  set("condition", event.target.value);
                }}
                className={INPUT}
              >
                {CONDITIONS.map(function render(value) {
                  return (
                    <option key={value} value={value} className="bg-ink-900">
                      {value}
                    </option>
                  );
                })}
              </select>
            </Field>
            <Field label="Marca">
              <input
                value={draft.brand}
                onChange={function change(event) {
                  set("brand", event.target.value);
                }}
                className={INPUT}
              />
            </Field>
            <Field label="Stock">
              <input
                value={draft.stock}
                onChange={function change(event) {
                  set("stock", event.target.value);
                }}
                inputMode="numeric"
                className={INPUT}
              />
            </Field>
            <Field label="Garantia">
              <input
                value={draft.warranty}
                onChange={function change(event) {
                  set("warranty", event.target.value);
                }}
                placeholder="Ex: 24 meses de fabrica"
                className={INPUT}
              />
            </Field>
            <Field label="Entrega">
              <input
                value={draft.delivery}
                onChange={function change(event) {
                  set("delivery", event.target.value);
                }}
                placeholder="Ex: 3 a 7 dias uteis"
                className={INPUT}
              />
            </Field>
            <Field label="Devolucoes">
              <input
                value={draft.returns}
                onChange={function change(event) {
                  set("returns", event.target.value);
                }}
                placeholder="Ex: 14 dias com portes a cargo do cliente"
                className={INPUT}
              />
            </Field>
          </div>
        ) : null}

        <div className="mt-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-haze-500">Imagens</span>
          <div className="mt-2 flex flex-wrap gap-3">
            {images.map(function render(image, index) {
              return (
                <div key={image + index} className="relative">
                  <img src={image} alt={"Imagem " + (index + 1)} className="h-20 w-28 rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={function remove() {
                      setImages(function next(current) {
                        return current.filter(function keep(item, at) {
                          return at !== index;
                        });
                      });
                    }}
                    className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-ink-900 text-haze-300 hover:text-white"
                    aria-label="Remover imagem"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {images.length === 0 ? (
              <p className="text-xs text-haze-500">Ainda sem imagens. Adicione por ficheiro ou por endereco.</p>
            ) : null}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <label className="glass inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-xs font-bold text-haze-100 transition hover:border-glow-400/50 hover:text-white">
                <ImagePlus className="h-4 w-4" />
                Carregar imagem (max 5 MB)
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={function pick(event) {
                    const file = event.target.files ? event.target.files[0] : null;
                    if (file) upload(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <input
                value={imageInput}
                onChange={function change(event) {
                  setImageInput(event.target.value);
                }}
                placeholder="Ou cole o endereco da imagem"
                className="h-11 w-full rounded-full border border-white/10 bg-ink-900/50 px-4 text-sm text-white outline-none placeholder:text-haze-500 focus:border-glow-400/60"
              />
              <GlowButton onClick={addUrl} variant="ghost" size="sm" className="shrink-0">
                Adicionar
              </GlowButton>
            </div>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs leading-5 text-amber-400">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <GlowButton onClick={function keep() {
            save("pending");
          }} disabled={busy} size="md">
            <Send className="h-4 w-4" />
            Enviar para revisao
          </GlowButton>
          {editId.length === 0 ? (
            <GlowButton onClick={function keep() {
              save("draft");
            }} variant="glass" disabled={busy} size="md">
              <Save className="h-4 w-4" />
              Guardar rascunho
            </GlowButton>
          ) : null}
          <Link to="/painel" className="ml-auto text-xs font-bold text-haze-300 hover:text-white">
            Cancelar
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
