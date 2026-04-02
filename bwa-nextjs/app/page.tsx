"use client";
import { useState } from "react";
import NeuralMesh from "@/components/NeuralMesh";
import Sidebar from "@/components/Sidebar";
import MainPanel from "@/components/MainPanel";
import { useSSEGenerate } from "@/hooks/useSSEGenerate";

export default function Home() {
  const [topic, setTopic]             = useState("");
  const [asOf, setAsOf]               = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedBlog, setSelectedBlog] = useState<string | null>(null);
  const { generate, reset, status, logs, plan, evidence, markdown, imageSpecs } = useSSEGenerate();

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setSelectedBlog(null);
    generate(topic, asOf);
  };

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw",
      overflow: "hidden", background: "var(--bg-base)",
      position: "relative",
    }}>
      {/* Animated neural mesh background */}
      <NeuralMesh />

      {/* App chrome */}
      <Sidebar
        topic={topic} setTopic={setTopic}
        asOf={asOf}   setAsOf={setAsOf}
        status={status}
        onGenerate={handleGenerate}
        onReset={reset}
        selectedBlog={selectedBlog}
        setSelectedBlog={setSelectedBlog}
      />
      <MainPanel
        status={status}
        plan={plan}
        evidence={evidence}
        markdown={markdown}
        imageSpecs={imageSpecs}
        logs={logs}
      />
    </div>
  );
}
