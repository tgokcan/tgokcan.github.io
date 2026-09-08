// src/components/LangToggle.tsx
"use client";

import { useRouter } from "next/navigation";

type Lang = "tr" | "en";

interface LangToggleProps {
  currentLang?: Lang;
  currentSlug?: string;
  translationSlug?: string;
}

export function LangToggle({
  currentLang = "tr",
  currentSlug,
  translationSlug,
}: LangToggleProps) {
  const router = useRouter();

  const handleLangChange = (lang: Lang) => {
    if (currentSlug) {
      const targetSlug =
        lang === currentLang ? currentSlug : translationSlug || currentSlug;

      router.push(`/${lang}/blog/${targetSlug}`);
      return;
    }

    router.push(`/${lang}/blog`);
  };

  return (
    <div>
        <button onClick={() => handleLangChange('en')}>EN</button>
   <button onClick={() => handleLangChange('tr')}>TR</button>
    </div>
   
  );
}
