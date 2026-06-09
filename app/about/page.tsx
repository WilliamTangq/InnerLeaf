"use client";

import { InfoPage } from "../components/info-page";
import { useLanguage } from "../components/language-provider";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <InfoPage
      eyebrow={t.nav.about}
      title={t.about.title}
      purpose={t.about.purpose}
      sections={t.about.sections}
    />
  );
}
