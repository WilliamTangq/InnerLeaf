import { EmotionTree } from "../components/emotion-tree";

export default function InnerTreePage() {
  return (
    <main className="min-h-screen bg-[#F4F7F1] px-4 py-12">
      <EmotionTree activeEmotion="Anxiety" className="mx-auto max-w-6xl" />
    </main>
  );
}
