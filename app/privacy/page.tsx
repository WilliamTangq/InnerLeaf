"use client";

import { InfoPage } from "../components/info-page";
import { useLanguage } from "../components/language-provider";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <InfoPage
      eyebrow={t.nav.privacy}
      title={t.privacy.title}
      purpose={t.privacy.purpose}
      sections={t.privacy.sections}
    />
  );
}
