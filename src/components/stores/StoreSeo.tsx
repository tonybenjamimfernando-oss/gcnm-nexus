import { useEffect } from "react";
import { seoFor } from "@/lib/marketing";
import type { StoreBrief } from "@/lib/marketing";
import { registerVisit } from "@/lib/marketingData";

type Props = { brief: StoreBrief; storeId: string };

function setMeta(attribute: string, key: string, content: string) {
  let tag = document.head.querySelector('meta[' + attribute + '="' + key + '"]') as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// Mantem o titulo, a descricao e as partilhas alinhados com a loja e conta a visita,
// para o painel de marketing saber de que canal vem cada pessoa.
export default function StoreSeo({ brief, storeId }: Props) {
  useEffect(
    function apply() {
      const seo = seoFor(brief);
      document.title = seo.title;
      setMeta("name", "description", seo.description);
      setMeta("name", "keywords", seo.keywords.join(", "));
      setMeta("property", "og:title", seo.title);
      setMeta("property", "og:description", seo.description);
      setMeta("property", "og:type", "website");
      const params = new URLSearchParams(window.location.search);
      const channel = params.get("utm_source") || (params.get("ref") ? "afiliado" : "direto");
      registerVisit({
        storeId: storeId,
        channel: channel,
        campaign: params.get("utm_campaign"),
        refCode: params.get("ref"),
      }).catch(function ignore() {
        return null;
      });
      return function restore() {
        document.title = "GCNM Nexus";
      };
    },
    [brief, storeId],
  );
  return null;
}
