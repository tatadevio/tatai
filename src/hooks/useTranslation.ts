"use client";
import { useEffect, useState } from "react";
import { getTranslations, type Translations } from "@/lib/i18n";

export function useTranslation(): Translations {
  const [t, setT] = useState<Translations>(() => {
    if (typeof window === "undefined") return getTranslations(null);
    const stored = localStorage.getItem("tatai_language");
    return getTranslations(stored);
  });

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem("tatai_language");
      setT(getTranslations(stored));
    };
    sync();
    window.addEventListener("tatai_lang_change", sync);
    return () => window.removeEventListener("tatai_lang_change", sync);
  }, []);

  return t;
}
