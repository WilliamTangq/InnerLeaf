"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Leaf,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge, Card, PageShell, PrimaryButton } from "../components/ui";
import { useLanguage } from "../components/language-provider";
import { trackEvent } from "../lib/analytics";

type ScenarioId = "delayed_reply" | "study_pressure" | "social_comparison";
type Step = "landing" | "scenario" | "messy" | "card" | "feedback" | "thankyou";

type Scenario = {
  id: ScenarioId;
  title: string;
  short: string;
  messy: string;
  card: {
    trigger: string;
    fact: string;
    assumption: string;
    pattern: string;
    behaviour: string;
    nextStep: string;
  };
};

const content = {
  en: {
    badge: "Marketplace demo",
    title: "Fact or Assumption?",
    subtitle: "The InnerLeaf Reflection Lab",
    intro:
      "Try a fictional emotional moment and see how InnerLeaf turns it into a structured Reflection Card.",
    start: "Try a fictional moment",
    back: "Back",
    reset: "Reset for next visitor",
    chooseTitle: "Choose a fictional moment",
    chooseBody: "No login, no live AI, no real personal data.",
    messyTitle: "Messy moment",
    messyBody: "This is the kind of message InnerLeaf helps structure.",
    breakDown: "Break down this moment",
    cardTitle: "Reflection Card",
    cardBody: "A clearer view of the moment, without diagnosing or judging it.",
    fields: {
      trigger: "Trigger",
      fact: "Fact",
      assumption: "Assumption",
      pattern: "Pattern",
      behaviour: "Behaviour",
      nextStep: "One Small Next Step",
    },
    feedbackTitle: "Three quick questions",
    feedbackBody: "This helps us test whether the demo is clear.",
    saveFeedback: "Save feedback",
    savingFeedback: "Saving feedback...",
    feedbackError: "Feedback could not be saved. Please try again.",
    clarity: "Was this clearer than the original emotional message?",
    alternative: "What would you normally use instead?",
    patternInterest:
      "Would you save reflections like this to see what repeats over time?",
    thankYouTitle: "Thank you — your feedback was saved.",
    thankYouBody: "Scan the QR code to try the full InnerLeaf experience privately.",
    productCtaTitle: "Try InnerLeaf",
    productCtaBody:
      "Create your own private reflection and explore Quick Reflection, History, and Pattern Summary.",
    openFullProduct: "Open full product",
    productUrl: "inner-leaf.vercel.app",
    qrAlt: "Scan to open InnerLeaf full product",
    qrFallback: "QR code image can be added as /public/innerleaf-qr.png.",
    signupTitle: "Want updates after Marketplace?",
    signupBody: "Leave your email only if you want to hear about future testing.",
    emailPlaceholder: "Email address optional",
    signup: "Join beta",
    signupDone: "Interest noted. Thank you.",
    signupError: "Beta signup could not be saved.",
    finish: "Continue",
    clarityOptions: [
      ["yes", "Yes"],
      ["somewhat", "Somewhat"],
      ["no", "No"],
    ],
    alternativeOptions: [
      ["chatgpt", "ChatGPT"],
      ["friend", "Friend"],
      ["notes", "Notes"],
      ["social_media", "Social media"],
      ["nothing", "Nothing"],
    ],
    patternOptions: [
      ["yes", "Yes"],
      ["maybe", "Maybe"],
      ["no", "No"],
    ],
    scenarios: [
      {
        id: "delayed_reply",
        title: "Delayed Reply",
        short: "They have not replied for three hours. I keep checking my phone.",
        messy:
          "They still have not replied. I keep checking my phone and now I feel like I did something wrong.",
        card: {
          trigger: "No reply for three hours.",
          fact: "The message has not been answered yet.",
          assumption: "This means they are upset with me or ignoring me.",
          pattern: "Mind reading",
          behaviour: "Checking the phone again and replaying the last message.",
          nextStep:
            "Write one fact and one alternative explanation before checking again.",
        },
      },
      {
        id: "study_pressure",
        title: "Study Pressure",
        short: "I have so much work that I cannot start anything.",
        messy:
          "There is too much work. I keep opening the assignment and closing it because it feels impossible to start.",
        card: {
          trigger: "A large amount of unfinished work.",
          fact: "There are multiple tasks waiting.",
          assumption: "If I cannot do all of it now, I am already failing.",
          pattern: "All-or-nothing thinking",
          behaviour: "Avoiding the first step because the whole task feels too large.",
          nextStep:
            "Choose one 10-minute starter action and stop when the timer ends.",
        },
      },
      {
        id: "social_comparison",
        title: "Social Comparison",
        short: "I saw someone my age doing better and now I feel behind.",
        messy:
          "I saw their post and now I feel behind. Everyone seems to be moving faster than me.",
        card: {
          trigger: "Seeing someone else’s progress online.",
          fact: "Someone posted a visible achievement.",
          assumption: "Their progress means I am falling behind.",
          pattern: "Comparison thinking",
          behaviour: "Scrolling for more evidence and feeling smaller.",
          nextStep:
            "Stop checking the source for 30 minutes and name one need underneath the comparison.",
        },
      },
    ] satisfies Scenario[],
  },
  zh: {
    badge: "Marketplace 演示",
    title: "事实，还是假设？",
    subtitle: "InnerLeaf 反思实验室",
    intro: "选择一个虚构情绪场景，看看 InnerLeaf 如何把它整理成结构化反思卡片。",
    start: "体验虚构场景",
    back: "返回",
    reset: "为下一位访客重置",
    chooseTitle: "选择一个虚构时刻",
    chooseBody: "无需登录，不调用实时 AI，也不使用真实个人内容。",
    messyTitle: "混乱时刻",
    messyBody: "InnerLeaf 会帮助整理这类情绪内容。",
    breakDown: "拆解这个时刻",
    cardTitle: "反思卡片",
    cardBody: "更清楚地看见这个时刻，不诊断，也不评判。",
    fields: {
      trigger: "触发点",
      fact: "事实",
      assumption: "假设",
      pattern: "模式",
      behaviour: "行为",
      nextStep: "一个小的下一步",
    },
    feedbackTitle: "三个快速问题",
    feedbackBody: "帮助我们判断这个演示是否清楚。",
    saveFeedback: "保存反馈",
    savingFeedback: "正在保存反馈...",
    feedbackError: "反馈未能保存，请再试一次。",
    clarity: "这是否比原本的情绪文字更清楚？",
    alternative: "如果不用 InnerLeaf，你通常会用什么？",
    patternInterest: "你会保存这样的反思，用来看看之后什么会重复出现吗？",
    thankYouTitle: "谢谢你 — 你的反馈已保存。",
    thankYouBody: "扫描二维码，私密体验完整的 InnerLeaf。",
    productCtaTitle: "体验 InnerLeaf",
    productCtaBody: "创建你自己的私人反思，并探索快速反思、历史记录和模式总结。",
    openFullProduct: "打开完整产品",
    productUrl: "inner-leaf.vercel.app",
    qrAlt: "扫码打开 InnerLeaf 完整产品",
    qrFallback: "可以把二维码图片放在 /public/innerleaf-qr.png。",
    signupTitle: "Marketplace 之后想收到更新吗？",
    signupBody: "如果你想收到之后的测试更新，可以留下邮箱。",
    emailPlaceholder: "邮箱地址，可选",
    signup: "加入 Beta",
    signupDone: "已记录。谢谢你。",
    signupError: "Beta 订阅未能保存。",
    finish: "继续",
    clarityOptions: [
      ["yes", "是"],
      ["somewhat", "有一点"],
      ["no", "否"],
    ],
    alternativeOptions: [
      ["chatgpt", "ChatGPT"],
      ["friend", "朋友"],
      ["notes", "备忘录"],
      ["social_media", "社交媒体"],
      ["nothing", "什么都不用"],
    ],
    patternOptions: [
      ["yes", "会"],
      ["maybe", "可能"],
      ["no", "不会"],
    ],
    scenarios: [
      {
        id: "delayed_reply",
        title: "回复延迟",
        short: "对方三个小时没回。我一直在看手机。",
        messy: "对方还是没回。我一直看手机，现在开始觉得是不是我做错了什么。",
        card: {
          trigger: "三个小时没有回复。",
          fact: "这条消息目前还没有被回复。",
          assumption: "这说明对方生气了，或在故意不理我。",
          pattern: "读心式推断",
          behaviour: "反复看手机，并回想上一条消息。",
          nextStep: "再次查看前，先写下一个事实和一个其他可能解释。",
        },
      },
      {
        id: "study_pressure",
        title: "学习压力",
        short: "事情太多了，我反而什么都开始不了。",
        messy: "作业太多了。我一直打开又关掉，因为感觉根本不可能开始。",
        card: {
          trigger: "有很多未完成任务。",
          fact: "确实有多个任务在等待处理。",
          assumption: "如果我现在做不完全部，就已经失败了。",
          pattern: "非黑即白思维",
          behaviour: "因为整个任务太大，所以回避第一步。",
          nextStep: "选择一个 10 分钟起步动作，计时结束就停下。",
        },
      },
      {
        id: "social_comparison",
        title: "社交比较",
        short: "看到同龄人做得更好，我突然觉得自己落后了。",
        messy: "我看到那条动态之后，突然觉得自己很落后。好像大家都比我走得快。",
        card: {
          trigger: "看到别人在线上展示进展。",
          fact: "有人发布了一个可见的成果。",
          assumption: "他们的进展说明我正在落后。",
          pattern: "比较型思维",
          behaviour: "继续刷更多信息，然后觉得自己更小。",
          nextStep: "30 分钟内先停止查看来源，并写下比较背后的一个需要。",
        },
      },
    ] satisfies Scenario[],
  },
} as const;

function OptionGroup({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly (readonly [string, string])[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(([id, optionLabel]) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={value === id}
            className={[
              "rounded-full border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
              value === id
                ? "border-[rgba(31,155,143,0.28)] bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
                : "border-[rgba(40,80,60,0.10)] bg-[rgba(255,254,248,0.74)] text-[var(--foreground-muted)] hover:border-[rgba(31,155,143,0.18)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { language } = useLanguage();
  const copy = content[language];
  const [step, setStep] = useState<Step>("landing");
  const [selectedId, setSelectedId] = useState<ScenarioId | null>(null);
  const [clarity, setClarity] = useState("");
  const [alternative, setAlternative] = useState("");
  const [patternInterest, setPatternInterest] = useState("");
  const [signupValue, setSignupValue] = useState("");
  const [signupDone, setSignupDone] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [savedFeedbackId, setSavedFeedbackId] = useState("");
  const [qrVisible, setQrVisible] = useState(true);
  const selectedScenario = useMemo(
    () => copy.scenarios.find((scenario) => scenario.id === selectedId) ?? null,
    [copy.scenarios, selectedId]
  );

  useEffect(() => {
    trackEvent("marketplace_started", { locale: language });
  }, [language]);

  function chooseScenario(id: ScenarioId) {
    setSelectedId(id);
    setStep("messy");
    trackEvent("scenario_selected", { locale: language, scenario_id: id });
  }

  function reset() {
    setStep("landing");
    setSelectedId(null);
    setClarity("");
    setAlternative("");
    setPatternInterest("");
    setSignupValue("");
    setSignupDone(false);
    setFeedbackSaving(false);
    setFeedbackError("");
    setSignupError("");
    setSavedFeedbackId("");
    setQrVisible(true);
    trackEvent("marketplace_reset", { locale: language });
  }

  function completeReflection() {
    if (!selectedId) {
      return;
    }

    setStep("card");
    trackEvent("reflection_completed", {
      locale: language,
      scenario_id: selectedId,
    });
  }

  async function saveFeedback() {
    if (!selectedId || !clarity || !alternative || !patternInterest) {
      return;
    }

    setFeedbackSaving(true);
    setFeedbackError("");

    try {
      const response = await fetch("/api/marketplace-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: language,
          scenario_id: selectedId,
          clarity_response: clarity,
          alternative_selected: alternative,
          pattern_interest: patternInterest,
        }),
      });
      const data = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !data.id) {
        throw new Error(data.error || "Marketplace feedback save failed");
      }

      setSavedFeedbackId(data.id);
      trackEvent("marketplace_feedback_saved", {
        locale: language,
        scenario_id: selectedId,
        clarity,
        alternative,
        pattern_interest: patternInterest,
      });
      setStep("thankyou");
    } catch (error) {
      console.error("Marketplace feedback save error:", error);
      setFeedbackError(copy.feedbackError);
    } finally {
      setFeedbackSaving(false);
    }
  }

  async function submitSignup() {
    const betaEmail = signupValue.trim();

    if (!betaEmail || !savedFeedbackId) {
      return;
    }

    setSignupError("");

    try {
      const response = await fetch("/api/marketplace-feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: savedFeedbackId,
          beta_email: betaEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Beta signup save failed");
      }

      setSignupDone(true);
      trackEvent("beta_signup", {
        locale: language,
        has_signup: true,
      });
    } catch (error) {
      console.error("Marketplace beta signup error:", error);
      setSignupError(copy.signupError);
    }
  }

  function openFullProduct() {
    trackEvent("full_product_cta_clicked", { locale: language });
  }

  return (
    <PageShell maxWidth="max-w-6xl">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-[rgba(35,70,55,0.10)] bg-[linear-gradient(135deg,rgba(255,254,248,0.98),rgba(232,246,241,0.62),rgba(255,248,226,0.32))] p-5 shadow-[0_30px_110px_rgba(26,34,32,0.11)] sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[rgba(31,155,143,0.12)] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-[rgba(217,179,74,0.13)] blur-3xl"
        />

        <div className="relative">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Badge variant="accent">{copy.badge}</Badge>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(40,80,60,0.10)] bg-[rgba(255,254,248,0.72)] px-3 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
            >
              <RefreshCw aria-hidden="true" size={15} strokeWidth={1.8} />
              {copy.reset}
            </button>
          </div>

          {step === "landing" && (
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <h1 className="text-[2.5rem] font-semibold leading-[1.04] tracking-tight text-[var(--foreground)] sm:text-[4rem]">
                  {copy.title}
                </h1>
                <p className="mt-3 text-xl font-semibold text-[var(--brand-teal-deep)]">
                  {copy.subtitle}
                </p>
                <p className="mt-5 max-w-xl text-base leading-7 text-[var(--foreground-muted)]">
                  {copy.intro}
                </p>
                <PrimaryButton
                  size="lg"
                  className="mt-7 w-full sm:w-auto"
                  onClick={() => setStep("scenario")}
                >
                  {copy.start}
                </PrimaryButton>
              </div>
              <Card className="relative overflow-hidden rounded-[2rem] bg-[rgba(255,254,248,0.80)] p-5 shadow-[var(--shadow-lg)] hover:translate-y-0">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                  <Leaf aria-hidden="true" size={16} strokeWidth={1.8} />
                  Reflection card preview
                </div>
                <div className="mt-5 space-y-3">
                  {["Trigger", "Fact", "Assumption", "Pattern", "Next step"].map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-[rgba(40,80,60,0.08)] bg-[rgba(255,255,255,0.58)] p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                          {item}
                        </p>
                        <span className="mt-2 block h-2 w-2/3 rounded-full bg-[rgba(31,155,143,0.18)]" />
                      </div>
                    )
                  )}
                </div>
              </Card>
            </div>
          )}

          {step === "scenario" && (
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                {copy.chooseTitle}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                {copy.chooseBody}
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {copy.scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => chooseScenario(scenario.id)}
                    className="group min-h-52 rounded-[1.7rem] border border-[rgba(35,70,55,0.10)] bg-[rgba(255,254,248,0.78)] p-5 text-left shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[rgba(31,155,143,0.20)] hover:shadow-[var(--shadow-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]"
                  >
                    <Sparkles
                      aria-hidden="true"
                      size={20}
                      strokeWidth={1.8}
                      className="text-[var(--brand-teal-deep)]"
                    />
                    <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                      {scenario.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                      {scenario.short}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "messy" && selectedScenario && (
            <div className="mx-auto max-w-3xl">
              <button
                type="button"
                onClick={() => setStep("scenario")}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                <ArrowLeft aria-hidden="true" size={15} strokeWidth={1.8} />
                {copy.back}
              </button>
              <Card className="rounded-[2rem] p-5 shadow-[var(--shadow-lg)] hover:translate-y-0 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                  {copy.messyTitle}
                </p>
                <h1 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  {selectedScenario.title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {copy.messyBody}
                </p>
                <div className="mt-5 rounded-[1.5rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(246,242,233,0.58)] p-5 text-lg font-medium leading-8 text-[var(--foreground)]">
                  “{selectedScenario.messy}”
                </div>
                <PrimaryButton
                  size="lg"
                  className="mt-6 w-full sm:w-auto"
                  onClick={completeReflection}
                >
                  {copy.breakDown}
                </PrimaryButton>
              </Card>
            </div>
          )}

          {step === "card" && selectedScenario && (
            <div className="mx-auto max-w-4xl">
              <Card className="rounded-[2.1rem] p-5 shadow-[var(--shadow-xl)] hover:translate-y-0 sm:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                      {copy.cardTitle}
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                      {selectedScenario.title}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                      {copy.cardBody}
                    </p>
                  </div>
                  <Badge variant="accent">Demo data</Badge>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {Object.entries(copy.fields).map(([key, label]) => (
                    <div
                      key={key}
                      className={[
                        "rounded-[1.35rem] border p-4",
                        key === "nextStep"
                          ? "border-[rgba(31,155,143,0.22)] bg-[linear-gradient(135deg,rgba(230,245,239,0.82),rgba(255,248,226,0.52))] sm:col-span-2"
                          : "border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.66)]",
                      ].join(" ")}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]">
                        {label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                        {
                          selectedScenario.card[
                            key as keyof typeof selectedScenario.card
                          ]
                        }
                      </p>
                    </div>
                  ))}
                </div>
                <PrimaryButton
                  size="lg"
                  className="mt-6 w-full sm:w-auto"
                  onClick={() => setStep("feedback")}
                >
                  {copy.finish}
                </PrimaryButton>
              </Card>
            </div>
          )}

          {step === "feedback" && selectedScenario && (
            <div className="mx-auto max-w-3xl">
              <Card className="rounded-[2rem] p-5 shadow-[var(--shadow-lg)] hover:translate-y-0 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">
                  {copy.feedbackTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  {copy.feedbackBody}
                </p>
                <div className="mt-6 space-y-6">
                  <OptionGroup
                    label={copy.clarity}
                    options={copy.clarityOptions}
                    value={clarity}
                    onSelect={(value) => {
                      setClarity(value);
                      trackEvent("clarity_response", {
                        locale: language,
                        scenario_id: selectedScenario.id,
                        response: value,
                      });
                    }}
                  />
                  <OptionGroup
                    label={copy.alternative}
                    options={copy.alternativeOptions}
                    value={alternative}
                    onSelect={(value) => {
                      setAlternative(value);
                      trackEvent("alternative_selected", {
                        locale: language,
                        scenario_id: selectedScenario.id,
                        alternative: value,
                      });
                    }}
                  />
                  <OptionGroup
                    label={copy.patternInterest}
                    options={copy.patternOptions}
                    value={patternInterest}
                    onSelect={(value) => {
                      setPatternInterest(value);
                      trackEvent("pattern_interest", {
                        locale: language,
                        scenario_id: selectedScenario.id,
                        interest: value,
                      });
                    }}
                  />
                </div>
                <PrimaryButton
                  size="lg"
                  className="mt-7 w-full sm:w-auto"
                  onClick={() => void saveFeedback()}
                  disabled={
                    feedbackSaving || !clarity || !alternative || !patternInterest
                  }
                >
                  {feedbackSaving ? copy.savingFeedback : copy.saveFeedback}
                </PrimaryButton>
                {feedbackError && (
                  <p className="mt-3 text-sm font-medium text-[var(--error)]">
                    {feedbackError}
                  </p>
                )}
              </Card>
            </div>
          )}

          {step === "thankyou" && (
            <div className="mx-auto max-w-3xl text-center">
              <Card className="rounded-[2.15rem] border-[rgba(31,155,143,0.13)] bg-[linear-gradient(135deg,rgba(255,254,248,0.96),rgba(230,245,239,0.64),rgba(255,248,226,0.26))] p-5 shadow-[var(--shadow-xl)] hover:translate-y-0 sm:p-8">
                <CheckCircle2
                  aria-hidden="true"
                  size={30}
                  strokeWidth={1.8}
                  className="mx-auto text-[var(--brand-teal-deep)]"
                />
                <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                  {copy.thankYouTitle}
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[var(--foreground-muted)]">
                  {copy.thankYouBody}
                </p>

                <div className="mx-auto mt-8 max-w-md rounded-[1.9rem] border border-[rgba(31,155,143,0.14)] bg-[rgba(255,254,248,0.78)] p-5 shadow-[var(--shadow-md)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-teal-deep)]">
                    InnerLeaf
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    {copy.productCtaTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                    {copy.productCtaBody}
                  </p>

                  <a
                    href="https://inner-leaf.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    onClick={openFullProduct}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--brand-teal-deep)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)] sm:hidden"
                  >
                    {copy.openFullProduct}
                    <ArrowRight aria-hidden="true" size={15} strokeWidth={1.8} />
                  </a>

                  <div className="mt-5 hidden rounded-[1.5rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,255,255,0.64)] p-4 text-center shadow-[var(--shadow-sm)] sm:block">
                    {qrVisible ? (
                      <Image
                        src="/innerleaf-qr.png"
                        alt={copy.qrAlt}
                        width={192}
                        height={192}
                        onError={() => setQrVisible(false)}
                        className="mx-auto aspect-square w-48 rounded-[1rem] bg-white object-contain p-2"
                      />
                    ) : (
                      <div className="mx-auto flex aspect-square w-48 items-center justify-center rounded-[1rem] border border-dashed border-[rgba(40,80,60,0.18)] bg-[rgba(255,255,255,0.58)] p-4 text-xs leading-5 text-[var(--foreground-subtle)]">
                        {copy.qrFallback}
                      </div>
                    )}
                    <p className="mt-3 text-sm font-semibold text-[var(--foreground-muted)]">
                      {copy.productUrl}
                    </p>
                  </div>

                  <a
                    href="https://inner-leaf.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    onClick={openFullProduct}
                    className="mt-5 hidden min-h-11 w-full items-center justify-center rounded-full bg-[var(--brand-teal-deep)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)] sm:inline-flex"
                  >
                    {copy.openFullProduct}
                    <ArrowRight aria-hidden="true" size={15} strokeWidth={1.8} />
                  </a>
                </div>

                <div className="mx-auto mt-5 max-w-md rounded-[1.35rem] border border-[rgba(40,80,60,0.07)] bg-[rgba(255,254,248,0.50)] p-4 text-left">
                  <p className="font-semibold text-[var(--foreground)]">
                    {copy.signupTitle}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                    {copy.signupBody}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={signupValue}
                      onChange={(event) => setSignupValue(event.target.value)}
                      placeholder={copy.emailPlaceholder}
                      className="min-h-11 flex-1 rounded-full border border-[rgba(40,80,60,0.12)] bg-[rgba(255,254,248,0.88)] px-4 text-sm text-[var(--foreground)] outline-none focus:border-[rgba(31,155,143,0.34)] focus:ring-2 focus:ring-[rgba(31,155,143,0.12)]"
                    />
                    <PrimaryButton
                      type="button"
                      onClick={() => void submitSignup()}
                      disabled={!signupValue.trim() || signupDone}
                    >
                      {signupDone ? copy.signupDone : copy.signup}
                    </PrimaryButton>
                  </div>
                  {signupError && (
                    <p className="mt-3 text-sm font-medium text-[var(--error)]">
                      {signupError}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[rgba(40,80,60,0.10)] bg-[rgba(255,254,248,0.66)] px-4 py-2 text-sm font-semibold text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
                  >
                    <RefreshCw aria-hidden="true" size={15} strokeWidth={1.8} />
                    {copy.reset}
                  </button>
                </div>
              </Card>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-[var(--foreground-subtle)]">
            <ClipboardList aria-hidden="true" size={14} strokeWidth={1.8} />
            Static fictional demo. No login required.
          </div>
        </div>
      </section>
    </PageShell>
  );
}
