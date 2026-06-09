import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test InnerLeaf — User testing",
  description:
    "Try InnerLeaf and share whether structured reflection cards feel clear, useful, and worth returning to.",
};

export default function TestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
