"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Edit3,
  FileText,
  Leaf,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AnalyticsPageView } from "../components/analytics-tracker";
import { useLanguage } from "../components/language-provider";
import {
  Badge,
  Card,
  IconFrame,
  LinkButton,
  PageHeader,
  PageShell,
  PrimaryButton,
  SectionLabel,
} from "../components/ui";

type ScenarioId =
  | "delayed_reply"
  | "study_pressure"
  | "low_energy"
  | "conflict_silence";

type DemoScenario = {
  id: ScenarioId;
  title: string;
  description: string;
  sample: string;
  card: {
    validation: string;
    trigger: string;
    facts: string[];
    assumptions: string[];
    need: string;
    pattern: string;
    nextStep: string;
  };
};

const demoCopy = {
  en: {
    eyebrow: "Interactive preview",
    title: "Try a 60-second reflection",
    body:
      "Choose a fictional moment, edit the sample if you want, and reveal a structured Reflection Card. No login required.",
    pick: "Pick a fictional scenario",
    edit: "Edit the messy input",
    editHint: "This demo uses fictional text only. Nothing here is saved.",
    reveal: "Reveal reflection card",
    reset: "Reset demo",
    cardTitle: "Structured Reflection Card",
    cardBody:
      "This is what InnerLeaf creates from one intense emotional moment.",
    validation: "Emotional validation",
    trigger: "Trigger",
    facts: "Facts",
    assumptions: "Assumptions / Imagination",
    need: "Unmet need",
    pattern: "Pattern name",
    nextStep: "One small next step",
    note: "This is a reflection, not a diagnosis.",
    saveTitle: "Want to save your own reflections?",
    saveBody:
      "Create an account only when you want a private History and Pattern Summary.",
    create: "Create account to save",
    quick: "Open Quick Reflection",
    scenarios: [
      {
        id: "delayed_reply",
        title: "Delayed reply",
        description: "They have not replied, and your mind starts filling gaps.",
        sample:
          "They have not replied for three hours. I keep checking my phone and now I feel like I did something wrong.",
        card: {
          validation:
            "It makes sense that the silence feels louder when you do not have enough information.",
          trigger: "A delayed reply after sending a message.",
          facts: ["The message has not been answered yet."],
          assumptions: ["They may be upset with me.", "I may have said something wrong."],
          need: "Reassurance and clearer information.",
          pattern: "Mind reading",
          nextStep:
            "Write one fact and two alternative explanations before checking again.",
        },
      },
      {
        id: "study_pressure",
        title: "Study pressure",
        description: "The work feels so large that starting feels impossible.",
        sample:
          "I have so much work that I cannot start anything. Every task feels urgent and I keep freezing.",
        card: {
          validation:
            "When everything feels urgent at once, freezing can be your mind trying to reduce overload.",
          trigger: "Several unfinished tasks competing for attention.",
          facts: ["There are multiple tasks to complete.", "Not everything can be done at once."],
          assumptions: ["If I do not finish everything now, I am failing."],
          need: "A smaller starting point and a sense of control.",
          pattern: "All-or-nothing thinking",
          nextStep: "Choose one 10-minute starter action and stop when the timer ends.",
        },
      },
      {
        id: "low_energy",
        title: "Low-energy mode",
        description: "You feel behind, tired, and hard to move.",
        sample:
          "I feel low and tired. Even simple things feel heavy, and I keep judging myself for not doing more.",
        card: {
          validation:
            "Low energy can make ordinary tasks feel bigger, especially when self-judgment joins in.",
          trigger: "Fatigue plus pressure to perform normally.",
          facts: ["Your energy is lower right now.", "The tasks still exist."],
          assumptions: ["Low energy means I am lazy or failing."],
          need: "Rest, gentleness, and one realistic next action.",
          pattern: "Emotional reasoning",
          nextStep: "Do one body-first reset: water, food, shower, or five slow breaths.",
        },
      },
      {
        id: "conflict_silence",
        title: "Conflict silence",
        description: "After tension, the silence starts to feel like rejection.",
        sample:
          "After our disagreement, they went quiet. I keep replaying it and imagining they are done with me.",
        card: {
          validation:
            "Silence after conflict can feel threatening because your mind is trying to predict what happens next.",
          trigger: "Quiet after a disagreement.",
          facts: ["There was a disagreement.", "They are quiet right now."],
          assumptions: ["This means the relationship is damaged.", "They may be rejecting me."],
          need: "Repair, clarity, and emotional steadiness.",
          pattern: "Catastrophising",
          nextStep:
            "Draft one calm repair sentence, then wait 10 minutes before deciding whether to send it.",
        },
      },
    ] satisfies DemoScenario[],
  },
  zh: {
    eyebrow: "互动预览",
    title: "体验 60 秒反思",
    body:
      "选择一个虚构时刻，也可以编辑示例文字，然后查看结构化反思卡片。无需登录。",
    pick: "选择一个虚构场景",
    edit: "编辑混乱输入",
    editHint: "这个演示只使用虚构文字。这里不会保存任何内容。",
    reveal: "生成反思卡片",
    reset: "重置演示",
    cardTitle: "结构化反思卡片",
    cardBody: "InnerLeaf 会把一次强烈情绪时刻整理成这样的卡片。",
    validation: "情绪确认",
    trigger: "触发点",
    facts: "事实",
    assumptions: "假设 / 想象",
    need: "未被满足的需要",
    pattern: "模式名称",
    nextStep: "一个小的下一步",
    note: "这是一张反思卡片，不是诊断。",
    saveTitle: "想保存你自己的反思吗？",
    saveBody: "只有当你想使用私人历史记录和模式总结时，才需要创建账号。",
    create: "创建账号并保存",
    quick: "打开快速反思",
    scenarios: [
      {
        id: "delayed_reply",
        title: "回复延迟",
        description: "对方没回时，大脑开始填补空白。",
        sample: "对方三个小时没回。我一直看手机，现在觉得是不是我做错了什么。",
        card: {
          validation: "在信息不够的时候，沉默会被放大，这种反应是可以理解的。",
          trigger: "发出消息后，对方迟迟没有回复。",
          facts: ["这条消息目前还没有回复。"],
          assumptions: ["对方可能生气了。", "我可能说错了什么。"],
          need: "确认感和更清楚的信息。",
          pattern: "读心式推断",
          nextStep: "再次查看前，先写下一个事实和两个其他可能解释。",
        },
      },
      {
        id: "study_pressure",
        title: "学习压力",
        description: "任务太大，反而更难开始。",
        sample: "事情太多了，我什么都开始不了。每件事都很急，我一直卡住。",
        card: {
          validation: "当所有事情同时显得紧急时，卡住有时是大脑在处理过载。",
          trigger: "多个未完成任务同时占据注意力。",
          facts: ["确实有多个任务要处理。", "它们不可能同时全部完成。"],
          assumptions: ["如果现在做不完全部，我就是失败了。"],
          need: "一个更小的起点和一点掌控感。",
          pattern: "非黑即白思维",
          nextStep: "选择一个 10 分钟起步动作，计时结束就停下。",
        },
      },
      {
        id: "low_energy",
        title: "低能量模式",
        description: "觉得累、落后，很难行动。",
        sample: "我很低落也很累。简单的事情都很重，我还一直怪自己做得不够。",
        card: {
          validation: "低能量会让普通任务显得更大，尤其当自责也一起出现时。",
          trigger: "疲惫感和“应该正常表现”的压力叠在一起。",
          facts: ["你现在的能量比较低。", "任务还在那里。"],
          assumptions: ["低能量说明我懒，或者我失败了。"],
          need: "休息、温和对待自己，以及一个现实的小动作。",
          pattern: "情绪化推理",
          nextStep: "先做一个身体层面的重置：喝水、吃点东西、洗澡，或慢呼吸五次。",
        },
      },
      {
        id: "conflict_silence",
        title: "冲突后的沉默",
        description: "争执后的安静，很容易被理解成拒绝。",
        sample: "我们吵完之后对方就安静了。我一直回想，脑子里觉得对方是不是不要我了。",
        card: {
          validation: "冲突后的沉默会让人紧张，因为大脑正在努力预测接下来会发生什么。",
          trigger: "争执之后，对方变得安静。",
          facts: ["确实发生了一次争执。", "对方现在比较安静。"],
          assumptions: ["这段关系可能受损了。", "对方可能在拒绝我。"],
          need: "修复、清楚回应和情绪稳定。",
          pattern: "灾难化推断",
          nextStep: "先写一句温和的修复句子，等 10 分钟后再决定是否发送。",
        },
      },
    ] satisfies DemoScenario[],
  },
} as const;

export default function DemoPage() {
  const { language } = useLanguage();
  const copy = demoCopy[language];
  const [scenarioId, setScenarioId] = useState<ScenarioId>("delayed_reply");
  const selectedScenario = useMemo(
    () => copy.scenarios.find((scenario) => scenario.id === scenarioId) ?? copy.scenarios[0],
    [copy.scenarios, scenarioId]
  );
  const [input, setInput] = useState(selectedScenario.sample);
  const [revealed, setRevealed] = useState(false);

  function selectScenario(nextId: ScenarioId) {
    const next = copy.scenarios.find((scenario) => scenario.id === nextId) ?? copy.scenarios[0];
    setScenarioId(next.id);
    setInput(next.sample);
    setRevealed(false);
  }

  return (
    <PageShell maxWidth="max-w-6xl">
      <AnalyticsPageView event="demo_viewed" />
      <PageHeader eyebrow={copy.eyebrow} title={copy.title}>
        {copy.body}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <Card
          variant="elevated"
          className="rounded-[2rem] border-[rgba(31,155,143,0.13)] bg-[linear-gradient(135deg,rgba(255,254,248,0.96),rgba(232,246,241,0.54))] hover:translate-y-0"
        >
          <SectionLabel>{copy.pick}</SectionLabel>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {copy.scenarios.map((scenario) => {
              const active = scenario.id === scenarioId;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => selectScenario(scenario.id)}
                  aria-pressed={active}
                  className={[
                    "rounded-[1.35rem] border p-4 text-left transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
                    active
                      ? "border-[rgba(31,155,143,0.26)] bg-[var(--accent-soft)] shadow-[var(--shadow-soft)]"
                      : "border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.68)] hover:border-[rgba(31,155,143,0.18)]",
                  ].join(" ")}
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                    {active && <CheckCircle2 aria-hidden="true" size={15} />}
                    {scenario.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    {scenario.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-[1.6rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.72)] p-4 shadow-[var(--shadow-sm)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                <Edit3 aria-hidden="true" size={16} className="text-[var(--brand-teal-deep)]" />
                {copy.edit}
              </p>
              <Badge variant="outline">{copy.eyebrow}</Badge>
            </div>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-40 w-full resize-y rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,254,248,0.94)] px-4 py-3 text-sm leading-7 text-[var(--foreground)] outline-none transition placeholder:text-[var(--foreground-subtle)] focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--accent-ring)]"
            />
            <p className="mt-2 flex gap-2 text-xs leading-5 text-[var(--foreground-subtle)]">
              <LockKeyhole aria-hidden="true" size={13} className="mt-0.5 shrink-0" />
              {copy.editHint}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <PrimaryButton
              size="lg"
              onClick={() => setRevealed(true)}
              disabled={!input.trim()}
              className="w-full sm:w-auto"
            >
              {copy.reveal}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => selectScenario(scenarioId)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,254,248,0.72)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
            >
              <RefreshCw aria-hidden="true" size={15} />
              {copy.reset}
            </button>
          </div>
        </Card>

        <Card
          variant="hero"
          className="rounded-[2rem] border-[rgba(31,155,143,0.14)] bg-[rgba(255,254,248,0.95)] shadow-[var(--shadow-xl)] hover:translate-y-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <SectionLabel>{copy.cardTitle}</SectionLabel>
              <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                {copy.cardBody}
              </p>
            </div>
            <IconFrame icon={Leaf} tone="sage" />
          </div>

          {!revealed ? (
            <div className="mt-8 rounded-[1.7rem] border border-dashed border-[rgba(31,155,143,0.2)] bg-[rgba(230,245,239,0.38)] p-6 text-center">
              <Sparkles
                aria-hidden="true"
                size={24}
                className="mx-auto text-[var(--brand-teal-deep)]"
              />
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--foreground-muted)]">
                {language === "zh"
                  ? "点击生成后，这里会显示一张结构化反思卡片。"
                  : "Reveal the card to see the messy moment become structured."}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              <section className="rounded-[1.35rem] border border-[rgba(31,155,143,0.18)] bg-[var(--accent-soft)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-teal-deep)]">
                  {copy.validation}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                  {selectedScenario.card.validation}
                </p>
              </section>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [copy.trigger, selectedScenario.card.trigger, MessageCircle],
                  [copy.need, selectedScenario.card.need, Leaf],
                  [copy.pattern, selectedScenario.card.pattern, Sparkles],
                  [copy.nextStep, selectedScenario.card.nextStep, ArrowRight],
                ].map(([label, value, Icon]) => (
                  <section
                    key={String(label)}
                    className="rounded-[1.25rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.68)] p-4"
                  >
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                      <Icon aria-hidden="true" size={14} />
                      {String(label)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                      {String(value)}
                    </p>
                  </section>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-[1.25rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.68)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                    {copy.facts}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                    {selectedScenario.card.facts.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-[1.25rem] border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.68)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[var(--foreground-subtle)]">
                    {copy.assumptions}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--foreground-muted)]">
                    {selectedScenario.card.assumptions.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </section>
              </div>
              <p className="rounded-full border border-[rgba(40,80,60,0.08)] bg-[rgba(255,254,248,0.72)] px-3 py-2 text-xs font-medium text-[var(--foreground-subtle)]">
                {copy.note}
              </p>
            </div>
          )}

          {revealed && (
            <div className="mt-6 rounded-[1.5rem] border border-[rgba(31,155,143,0.14)] bg-[linear-gradient(135deg,rgba(255,254,248,0.88),rgba(230,245,239,0.5))] p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {copy.saveTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--foreground-muted)]">
                {copy.saveBody}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <LinkButton href="/register" size="sm">
                  {copy.create}
                </LinkButton>
                <LinkButton href="/dashboard/quick" variant="secondary" size="sm">
                  {copy.quick}
                </LinkButton>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card variant="support" className="mt-8 hover:translate-y-0">
        <div className="flex gap-3">
          <FileText
            aria-hidden="true"
            size={18}
            className="mt-0.5 shrink-0 text-[var(--brand-teal-deep)]"
          />
          <p className="text-sm leading-6 text-[var(--foreground-muted)]">
            {language === "zh"
              ? "InnerLeaf 是私人自我反思工具。它不是治疗、诊断、危机支持或医疗建议。"
              : "InnerLeaf is for private self-reflection. It is not therapy, diagnosis, crisis support, or medical advice."}
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
