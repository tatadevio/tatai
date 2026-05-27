"use client";
import { useEffect, useState } from "react";
import { getTranslations, isRTLLanguage, type Translations } from "@/lib/i18n";

export function useTranslation(): { t: Translations; isRTL: boolean } {
  const getStored = () => (typeof window === "undefined" ? null : localStorage.getItem("tatai_language"));

  const [t, setT] = useState<Translations>(() => getTranslations(getStored()));
  const [isRTL, setIsRTL] = useState<boolean>(() => isRTLLanguage(getStored()));

  useEffect(() => {
    const sync = () => {
      const stored = getStored();
      setT(getTranslations(stored));
      setIsRTL(isRTLLanguage(stored));
    };
    sync();
    window.addEventListener("tatai_lang_change", sync);
    return () => window.removeEventListener("tatai_lang_change", sync);
  }, []);

  return { t, isRTL };
}
