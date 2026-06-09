import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InnerLeaf Demo Flow",
  description:
    "A static product demo showing how InnerLeaf turns one emotional reaction into a structured reflection card.",
};

export default function DemoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
