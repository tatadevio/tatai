"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon, Monitor, Crown, ChevronRight, Globe, ChevronDown } from "lucide-react";
import { TataILogo } from "@/components/Logo";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

const THEME_KEYS = [
  { value: "light", key: "themeLight" as const, icon: Sun },
  { value: "dark", key: "themeDark" as const, icon: Moon },
  { value: "system", key: "themeSystem" as const, icon: Monitor },
] as const;

const LANGUAGES = [
  { code: "auto", label: "Auto-detect", native: "Auto-detect" },
  { code: "af", label: "Afrikaans", native: "Afrikaans" },
  { code: "sq", label: "Albanian", native: "Shqip" },
  { code: "am", label: "Amharic", native: "አማርኛ" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "hy", label: "Armenian", native: "Հայերեն" },
  { code: "az", label: "Azerbaijani", native: "Azərbaycan" },
  { code: "eu", label: "Basque", native: "Euskara" },
  { code: "be", label: "Belarusian", native: "Беларуская" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "bs", label: "Bosnian", native: "Bosanski" },
  { code: "bg", label: "Bulgarian", native: "Български" },
  { code: "ca", label: "Catalan", native: "Català" },
  { code: "zh", label: "Chinese (Simplified)", native: "中文（简体）" },
  { code: "zh-TW", label: "Chinese (Traditional)", native: "中文（繁體）" },
  { code: "hr", label: "Croatian", native: "Hrvatski" },
  { code: "cs", label: "Czech", native: "Čeština" },
  { code: "da", label: "Danish", native: "Dansk" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
  { code: "en", label: "English", native: "English" },
  { code: "et", label: "Estonian", native: "Eesti" },
  { code: "fi", label: "Finnish", native: "Suomi" },
  { code: "fr", label: "French", native: "Français" },
  { code: "gl", label: "Galician", native: "Galego" },
  { code: "ka", label: "Georgian", native: "ქართული" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "el", label: "Greek", native: "Ελληνικά" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "ht", label: "Haitian Creole", native: "Kreyòl ayisyen" },
  { code: "ha", label: "Hausa", native: "Hausa" },
  { code: "he", label: "Hebrew", native: "עברית" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "hu", label: "Hungarian", native: "Magyar" },
  { code: "is", label: "Icelandic", native: "Íslenska" },
  { code: "ig", label: "Igbo", native: "Igbo" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia" },
  { code: "ga", label: "Irish", native: "Gaeilge" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "kk", label: "Kazakh", native: "Қазақша" },
  { code: "km", label: "Khmer", native: "ខ្មែរ" },
  { code: "ky", label: "Kyrgyz", native: "Кыргызча" },
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "lo", label: "Lao", native: "ລາວ" },
  { code: "lv", label: "Latvian", native: "Latviešu" },
  { code: "lt", label: "Lithuanian", native: "Lietuvių" },
  { code: "lb", label: "Luxembourgish", native: "Lëtzebuergesch" },
  { code: "mk", label: "Macedonian", native: "Македонски" },
  { code: "mg", label: "Malagasy", native: "Malagasy" },
  { code: "ms", label: "Malay", native: "Bahasa Melayu" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "mt", label: "Maltese", native: "Malti" },
  { code: "mi", label: "Maori", native: "Māori" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "mn", label: "Mongolian", native: "Монгол" },
  { code: "my", label: "Myanmar (Burmese)", native: "မြန်မာဘာသာ" },
  { code: "ne", label: "Nepali", native: "नेपाली" },
  { code: "nb", label: "Norwegian", native: "Norsk" },
  { code: "fa", label: "Persian", native: "فارسی" },
  { code: "pl", label: "Polish", native: "Polski" },
  { code: "pt", label: "Portuguese (Brazil)", native: "Português (Brasil)" },
  { code: "pt-PT", label: "Portuguese (Portugal)", native: "Português (Portugal)" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ro", label: "Romanian", native: "Română" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "sm", label: "Samoan", native: "Samoan" },
  { code: "sr", label: "Serbian", native: "Српски" },
  { code: "st", label: "Sesotho", native: "Sesotho" },
  { code: "sn", label: "Shona", native: "Shona" },
  { code: "sd", label: "Sindhi", native: "سنڌي" },
  { code: "si", label: "Sinhala", native: "සිංහල" },
  { code: "sk", label: "Slovak", native: "Slovenčina" },
  { code: "sl", label: "Slovenian", native: "Slovenščina" },
  { code: "so", label: "Somali", native: "Soomaali" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "su", label: "Sundanese", native: "Basa Sunda" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
  { code: "sv", label: "Swedish", native: "Svenska" },
  { code: "tg", label: "Tajik", native: "Тоҷикӣ" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "tt", label: "Tatar", native: "Татарча" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "th", label: "Thai", native: "ไทย" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "tk", label: "Turkmen", native: "Türkmen" },
  { code: "uk", label: "Ukrainian", native: "Українська" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "ug", label: "Uyghur", native: "ئۇيغۇرچە" },
  { code: "uz", label: "Uzbek", native: "O'zbek" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt" },
  { code: "cy", label: "Welsh", native: "Cymraeg" },
  { code: "xh", label: "Xhosa", native: "isiXhosa" },
  { code: "yi", label: "Yiddish", native: "ייִדיש" },
  { code: "yo", label: "Yoruba", native: "Yorùbá" },
  { code: "zu", label: "Zulu", native: "isiZulu" },
];

function getDisplayName(u: ReturnType<typeof useAuth>["user"]) {
  if (!u) return "Guest";
  if (u.displayName) return u.displayName;
  if (u.phoneNumber) return u.phoneNumber;
  if (u.email) {
    const local = u.email.split("@")[0];
    return local.replace(/[._\-+]/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
  }
  return "User";
}

export default function SettingsPage() {
  const { user, loading, setShowLogin } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const t = useTranslation();
  const [mounted, setMounted] = useState(false);
  // language stored as label e.g. "Arabic", "auto"
  const [language, setLanguageState] = useState("auto");
  const [langOpen, setLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const saved = localStorage.getItem("tatai_language") ?? "auto";
    setLanguageState(saved);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
        setLangSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function setLanguage(label: string) {
    setLanguageState(label);
    localStorage.setItem("tatai_language", label);
    window.dispatchEvent(new Event("tatai_lang_change"));
    setLangOpen(false);
    setLangSearch("");
  }

  // Match by label for display; "auto" is the default entry
  const currentLang = LANGUAGES.find(l => l.label === language || (language === "auto" && l.code === "auto")) ?? LANGUAGES[0];
  const filteredLangs = LANGUAGES.filter(l =>
    !langSearch || l.label.toLowerCase().includes(langSearch.toLowerCase()) || l.native.toLowerCase().includes(langSearch.toLowerCase())
  );

  // Redirect to login if not signed in
  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
      router.replace("/");
    }
  }, [user, loading, setShowLogin, router]);

  // Show nothing while checking auth or redirecting
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <TataILogo className="w-10 h-10 animate-pulse" />
          <p className="text-sm text-neutral-400 dark:text-white/30">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#111] sticky top-0 z-10">
        <button onClick={() => router.push("/")} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-500 dark:text-white/40">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <TataILogo className="w-6 h-6" />
          <span className="font-bold text-neutral-900 dark:text-white tracking-tight">tatAI</span>
        </div>
        <span className="text-neutral-400 dark:text-white/30">/</span>
        <h1 className="font-semibold text-neutral-900 dark:text-white">{t.settingsTitle}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Profile */}
        <section className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/[0.05]">
            <h2 className="font-semibold text-neutral-900 dark:text-white text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40">{t.profile}</h2>
          </div>
          <div className="px-6 py-5 flex items-center gap-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                {(user?.displayName ?? user?.email ?? "U")[0].toUpperCase()}
              </div>
            )}
              <div>
              <p className="font-semibold text-neutral-900 dark:text-white text-[15px]">{getDisplayName(user)}</p>
              <p className="text-sm text-neutral-500 dark:text-white/40 mt-0.5">{user?.email ?? user?.phoneNumber ?? "Not signed in"}</p>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl overflow-visible">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/[0.05] rounded-t-2xl">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40">{t.theme}</h2>
          </div>
          <div className="px-6 py-5 space-y-6">
            {/* Theme */}
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-white/70 mb-3">{t.theme}</p>
              {mounted && (
                <div className="flex gap-2">
                  {THEME_KEYS.map(({ value, key, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                        theme === value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-neutral-200 dark:border-white/[0.07] text-neutral-500 dark:text-white/40 hover:border-neutral-300 dark:hover:border-white/[0.12] hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{t[key]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language */}
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-white/70 mb-3">{t.language}</p>
              <p className="text-xs text-neutral-400 dark:text-white/30 mb-3">{t.languageDesc}</p>
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => { setLangOpen(v => !v); setLangSearch(""); }}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-colors text-sm text-neutral-800 dark:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-neutral-400 dark:text-white/30 flex-shrink-0" />
                    <span className="font-medium">{currentLang.label}</span>
                    {currentLang.code !== "auto" && (
                      <span className="text-neutral-400 dark:text-white/30 text-xs">{currentLang.native}</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 dark:text-white/30 transition-transform ${langOpen ? "rotate-180" : ""}`} />
                </button>

                {langOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-white/[0.1] rounded-xl shadow-2xl shadow-black/20 z-50 overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-neutral-100 dark:border-white/[0.06]">
                      <input
                        autoFocus
                        value={langSearch}
                        onChange={e => setLangSearch(e.target.value)}
                        placeholder={t.searchLanguage}
                        className="w-full bg-neutral-50 dark:bg-white/[0.05] rounded-lg px-3 py-2 text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/30 focus:outline-none border border-transparent focus:border-blue-500/50"
                      />
                    </div>
                    {/* List */}
                    <div className="max-h-56 overflow-y-auto overscroll-contain">
                      {filteredLangs.length === 0 ? (
                        <p className="text-center text-sm text-neutral-400 dark:text-white/30 py-4">{t.noResults}</p>
                      ) : filteredLangs.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code === "auto" ? "auto" : lang.label)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-white/[0.05] transition-colors ${
                            currentLang.code === lang.code ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10" : "text-neutral-700 dark:text-white/70"
                          }`}
                        >
                          <span className="font-medium">{lang.label}</span>
                          {lang.code !== "auto" && (
                            <span className="text-neutral-400 dark:text-white/30 text-xs ml-2">{lang.native}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/[0.05]">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40">{t.subscription}</h2>
          </div>
          <button onClick={() => router.push("/upgrade")} className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 flex items-center justify-center">
                <Crown className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-neutral-800 dark:text-white/80">{t.upgradePro}</p>
                <p className="text-xs text-neutral-400 dark:text-white/30">{t.upgradeDesc}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-white/30" />
          </button>
        </section>

        {/* Links */}
        <section className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-white/[0.05]">
          {[
            { label: t.about, href: "/about" },
            { label: t.privacy, href: "/privacy" },
            { label: t.terms, href: "/terms" },
          ].map(({ label, href }) => (
            <button key={label} onClick={() => router.push(href)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors">
              <span className="text-sm text-neutral-700 dark:text-white/70">{label}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-white/30" />
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}
