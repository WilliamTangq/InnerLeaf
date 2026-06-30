"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Eraser, MessageCircle, Pause, SendHorizontal } from "lucide-react";
import {
  Card,
  IconFrame,
  LinkButton,
  PageActions,
  PageHeader,
  PrimaryButton,
  SectionLabel,
  StatusCard,
  TextareaField,
} from "../../components/ui";
import { useLanguage } from "../../components/language-provider";

const draftKey = "innerleaf_before_you_send_draft";

type MessageAction = "send" | "wait" | "rewrite";

function containsChinese(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

function detectToneRisk(message: string, language: "en" | "zh") {
  const lower = message.toLowerCase();
  const blamePatterns =
    language === "zh"
      ? ["你总是", "你从不", "你根本", "为什么你", "你是不是", "你又"]
      : ["you always", "you never", "why did you", "why are you", "you don't", "you didnt", "you didn't"];

  return (
    blamePatterns.some((pattern) => lower.includes(pattern)) ||
    /[!！]{1,}/.test(message) ||
    message.length > 420
  );
}

function detectMessageContext(message: string, language: "en" | "zh") {
  const lower = message.toLowerCase();

  if (
    lower.includes("reply") ||
    lower.includes("text") ||
    lower.includes("message") ||
    message.includes("回复") ||
    message.includes("消息") ||
    message.includes("已读")
  ) {
    return "reply";
  }

  if (
    lower.includes("sorry") ||
    lower.includes("apolog") ||
    message.includes("对不起") ||
    message.includes("抱歉")
  ) {
    return "repair";
  }

  if (
    lower.includes("unfair") ||
    lower.includes("ignored") ||
    message.includes("不公平") ||
    message.includes("不被在意") ||
    message.includes("忽略")
  ) {
    return "respect";
  }

  return language === "zh" ? "clarity" : "clarity";
}

function analyseMessage(message: string, uiLanguage: "en" | "zh") {
  const language = containsChinese(message) ? "zh" : uiLanguage;
  const context = detectMessageContext(message, language);
  const risk = detectToneRisk(message, language);
  const looksCalm =
    message.length < 220 &&
    !risk &&
    (language === "zh"
      ? /请|可以|方便|谢谢/.test(message)
      : /\b(please|could|can we|when you have a moment|thank)\b/i.test(message));

  if (language === "zh") {
    const reallyTrying =
      context === "reply"
        ? "你真正想表达的可能是：对方的回应节奏影响了你，你想要更多清楚感，而不是直接指责。"
        : context === "repair"
          ? "你真正想表达的可能是：你在意这段关系，也想把误会或不舒服的地方说清楚。"
          : "你真正想表达的可能是：这件事对你有影响，你希望被认真听见。";
    const blame = risk
      ? "有些句子可能会让对方先听到责备，而不是听到你真正的需要。"
      : "这段话没有明显责备，但情绪强度仍可能先被对方接收到。";
    const need =
      context === "reply"
        ? "下面的需要可能是：确认感、稳定回应，或知道对方真实想法。"
        : context === "repair"
          ? "下面的需要可能是：修复、理解，或减少误会。"
          : "下面的需要可能是：被尊重、被听见，或把事实确认清楚。";
    const calmerVersion =
      context === "reply"
        ? "我注意到自己因为还没有收到回复而有些不安。我不想直接假设最坏的情况。你方便的时候，我们可以确认一下发生了什么吗？"
        : "这件事让我有些受影响。我想把它说清楚，而不是带着情绪反应。你方便的时候，我们可以聊一下发生了什么，以及接下来怎么更清楚吗？";
    const action: MessageAction = risk ? "wait" : looksCalm ? "send" : "rewrite";

    return {
      language,
      action,
      reallyTrying,
      blame,
      need,
      calmerVersion,
      actionText:
        action === "wait"
          ? "建议先等待 10 分钟，再决定是否发送。"
          : action === "send"
            ? "建议：这段表达已经比较清楚，可以发送。"
          : "建议先用更平静的版本重写，再发送。",
    };
  }

  const reallyTrying =
    context === "reply"
      ? "You may be trying to say: the response gap affected you, and you want clarity before assuming the worst."
      : context === "repair"
        ? "You may be trying to say: you care about repairing this and want the uncomfortable part to be understood."
        : "You may be trying to say: this mattered to you, and you want to be heard clearly.";
  const blame = risk
    ? "Some wording may make the other person hear blame before they hear the need underneath."
    : "This draft does not sound heavily blaming, but the emotional intensity may still arrive first.";
  const need =
    context === "reply"
      ? "The need underneath may be reassurance, steadier communication, or knowing what actually happened."
      : context === "repair"
        ? "The need underneath may be repair, understanding, or less uncertainty."
        : "The need underneath may be respect, being heard, or checking the facts together.";
  const calmerVersion =
    context === "reply"
      ? "I noticed I felt unsettled when I didn’t hear back. I don’t want to assume the worst. Could we clarify what happened when you have a moment?"
      : "I’m feeling affected by this, and I want to explain it clearly rather than react. Could we talk about what happened and what I need next?";
  const action: MessageAction = risk ? "wait" : looksCalm ? "send" : "rewrite";

  return {
    language,
    action,
    reallyTrying,
    blame,
    need,
    calmerVersion,
    actionText:
      action === "wait"
        ? "Suggestion: wait 10 minutes before sending."
        : action === "send"
          ? "Suggestion: this is clear enough to send."
        : "Suggestion: rewrite once in the calmer version before sending.",
  };
}

export default function BeforeYouSendPage() {
  const { language, t } = useLanguage();
  const labels = t.beforeYouSendFlow;
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(draftKey);

    if (saved) {
      const restore = window.setTimeout(() => setDraft(saved), 0);
      return () => window.clearTimeout(restore);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(draftKey, draft);
  }, [draft]);

  const result = useMemo(() => {
    if (!submitted.trim()) {
      return null;
    }

    return analyseMessage(submitted.trim(), language);
  }, [language, submitted]);

  function clearDraft() {
    setDraft("");
    setSubmitted("");
    window.localStorage.removeItem(draftKey);
  }

  return (
    <div className="space-y-5">
      <PageHeader compact eyebrow={labels.eyebrow} title={labels.title}>
        {labels.purpose}
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <Card
          variant="elevated"
          className="overflow-hidden border-[rgba(31,155,143,0.16)] bg-[linear-gradient(135deg,rgba(255,254,248,0.98),rgba(232,246,241,0.58))] p-4 hover:translate-y-0 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <IconFrame icon={SendHorizontal} tone="sage" />
            <div>
              <SectionLabel>{labels.cardLabel}</SectionLabel>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                {labels.cardTitle}
              </h2>
            </div>
          </div>

          <div className="mt-5">
            <TextareaField
              label={labels.inputLabel}
              helper={labels.helper}
              placeholder={labels.placeholder}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={9}
              className="min-h-[230px]"
            />
          </div>

          <PageActions>
            <PrimaryButton
              type="button"
              onClick={() => setSubmitted(draft)}
              disabled={draft.trim().length < 8}
            >
              {labels.cta}
            </PrimaryButton>
            <button
              type="button"
              onClick={clearDraft}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,254,248,0.76)] px-4 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            >
              <Eraser aria-hidden="true" size={15} strokeWidth={1.8} />
              {labels.clear}
            </button>
          </PageActions>

          <p className="mt-4 text-xs leading-5 text-[var(--foreground-subtle)]">
            {labels.privacy}
          </p>
        </Card>

        <div className="space-y-4">
          <Card className="hover:translate-y-0">
            <IconFrame icon={Pause} tone="gold" />
            <h2 className="mt-4 text-base font-semibold text-[var(--foreground)]">
              {labels.firstUseTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              {labels.firstUseBody}
            </p>
            <LinkButton
              href="/dashboard/quick"
              variant="secondary"
              size="sm"
              className="mt-4"
            >
              {labels.quickAlternative}
            </LinkButton>
          </Card>
        </div>
      </div>

      {result && (
        <Card
          variant="insight"
          className="overflow-hidden border-[rgba(31,155,143,0.18)] p-4 hover:translate-y-0 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <SectionLabel>{labels.resultLabel}</SectionLabel>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {labels.resultTitle}
              </h2>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(31,155,143,0.16)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)]">
              <ArrowRight aria-hidden="true" size={13} strokeWidth={1.9} />
              {labels.actions[result.action]}
            </span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {[
              [labels.reallyTrying, result.reallyTrying],
              [labels.blame, result.blame],
              [labels.need, result.need],
              [labels.calmerVersion, result.calmerVersion],
            ].map(([title, body], index) => (
              <section
                key={title}
                className={[
                  "rounded-[1.25rem] border p-4",
                  index === 3
                    ? "border-[rgba(31,155,143,0.2)] bg-[linear-gradient(135deg,rgba(231,244,239,0.72),rgba(255,254,248,0.92))] lg:col-span-2"
                    : "border-[rgba(40,80,60,0.09)] bg-[rgba(255,254,248,0.72)]",
                ].join(" ")}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-4">
            <StatusCard>
              <span className="inline-flex items-center gap-2">
                <MessageCircle aria-hidden="true" size={15} strokeWidth={1.8} />
                {result.actionText}
              </span>
            </StatusCard>
          </div>
        </Card>
      )}
    </div>
  );
}
