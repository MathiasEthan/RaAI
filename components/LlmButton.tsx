'use client';

import { Button } from "@/components/ui/button";
import { call } from "@/genai";

export async function LlmButton() {
  const handleClick = async () => {
    await call();
  };

  return (
    <Button onClick={handleClick}>Call LLM</Button>
  );
}