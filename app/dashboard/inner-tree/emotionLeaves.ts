export type LeafStatus = "dimmed" | "lit" | "veined" | "mapped" | "learned";

export type EmotionLeaf = {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  rotate: number;
  size: number;
  status: LeafStatus;
  count: number;
  explanation: string;
  commonTrigger?: string;
  commonStory?: string;
  commonUrge?: string;
  whatHelped?: string;
};

export const emotionLeaves: EmotionLeaf[] = [
  {
    id: "anxiety",
    label: "Anxiety",
    color: "#8FB996",
    x: 230,
    y: 105,
    rotate: -18,
    size: 1,
    status: "lit",
    count: 3,
    explanation: "This emotion often appears around uncertainty.",
    commonTrigger: "Delayed replies",
    commonStory: "Something is wrong.",
    commonUrge: "Check for reassurance",
    whatHelped: "Creating a short pause before checking again."
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    color: "#C9A96A",
    x: 170,
    y: 150,
    rotate: 22,
    size: 0.95,
    status: "dimmed",
    count: 0,
    explanation: "This leaf lights up when you name this emotion."
  },
  {
    id: "disappointed",
    label: "Disappointed",
    color: "#A7B8D8",
    x: 290,
    y: 165,
    rotate: -35,
    size: 0.9,
    status: "dimmed",
    count: 0,
    explanation: "This leaf lights up when you name this emotion."
  },
  {
    id: "jealous",
    label: "Jealous",
    color: "#B48EAE",
    x: 145,
    y: 220,
    rotate: -8,
    size: 0.85,
    status: "dimmed",
    count: 0,
    explanation: "This leaf lights up when you name this emotion."
  },
  {
    id: "frustrated",
    label: "Frustrated",
    color: "#D48C70",
    x: 315,
    y: 235,
    rotate: 18,
    size: 0.9,
    status: "dimmed",
    count: 0,
    explanation: "This leaf lights up when you name this emotion."
  }
];