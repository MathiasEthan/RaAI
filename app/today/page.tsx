"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";
import { ForwardIcon, StepBackIcon } from "lucide-react";

function Today() {
  const sentences = [
    { id: 0, text: "How are you feeling today?" },
    { id: 1, text: "How did you sleep last night?" },
    { id: 2, text: "What's your energy level right now?" },
    { id: 3, text: "How would you rate your stress level?" },
    { id: 4, text: "Have you taken care of your basic needs today?" },
    { id: 5, text: "What's your main emotion right now?" },
  ];

  const [currentId, setCurrentId] = useState<number>(0);
  const [selections, setSelections] = useState<number[]>(
    Array(sentences.length).fill(-1)
  );
  const [isComplete, setIsComplete] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const isLastQuestion = currentId === sentences.length - 1;

  const optionsBySentence: { id: number; text: string; score: number }[][] = [
    // options for feeling today
    [
      { id: 0, text: "Really good", score: 1.0 },
      { id: 1, text: "Pretty okay", score: 0.8 },
      { id: 2, text: "Neutral", score: 0.6 },
      { id: 3, text: "Not great", score: 0.4 },
      { id: 4, text: "Struggling", score: 0.2 },
    ],
    // options for sleep
    [
      { id: 0, text: "Slept well", score: 1.0 },
      { id: 1, text: "Decent sleep", score: 0.75 },
      { id: 2, text: "Could be better", score: 0.5 },
      { id: 3, text: "Poor sleep", score: 0.25 },
      { id: 4, text: "Barely slept", score: 0.1 },
    ],
    // options for energy
    [
      { id: 0, text: "Very energetic", score: 1.0 },
      { id: 1, text: "Moderately energetic", score: 0.75 },
      { id: 2, text: "Average energy", score: 0.5 },
      { id: 3, text: "Low energy", score: 0.25 },
      { id: 4, text: "Very tired", score: 0.1 },
    ],
    // options for stress
    [
      { id: 0, text: "Very relaxed", score: 1.0 },
      { id: 1, text: "Slightly stressed", score: 0.75 },
      { id: 2, text: "Moderately stressed", score: 0.5 },
      { id: 3, text: "Quite stressed", score: 0.25 },
      { id: 4, text: "Overwhelmed", score: 0.1 },
    ],
    // options for basic needs
    [
      { id: 0, text: "All needs met", score: 1.0 },
      { id: 1, text: "Most needs met", score: 0.75 },
      { id: 2, text: "Some needs met", score: 0.5 },
      { id: 3, text: "Few needs met", score: 0.25 },
      { id: 4, text: "Need attention", score: 0.1 },
    ],
    // options for main emotion
    [
      { id: 0, text: "Happy", score: 1.0 },
      { id: 1, text: "Calm", score: 0.8 },
      { id: 2, text: "Anxious", score: 0.6 },
      { id: 3, text: "Sad", score: 0.4 },
      { id: 4, text: "Mixed", score: 0.2 },
    ],
  ];

  const options = optionsBySentence[currentId] || [];

  // This useEffect was causing the immediate redirect.
  // The logic is now correctly handled only within the handleCompletion function.
  /*
  useEffect(() => {
    const lastCheckIn = localStorage.getItem("lastCheckIn");
    const today = new Date().toDateString();

    if (lastCheckIn === today) {
      window.location.href = "/dashboard";
    }
  }, []);
  */

  const handleCompletion = () => {
    setIsComplete(true);
    const score = selections.reduce((acc, sel, idx) => {
      // sel is 1-based index from buttons, need 0-based for array access
      if (sel === -1) return acc;
      return acc + (optionsBySentence[idx][sel - 1]?.score || 0);
    }, 0);
    setTotalScore(score);

    localStorage.setItem("lastCheckIn", new Date().toDateString());
    localStorage.setItem("lastResponses", JSON.stringify(selections));
    localStorage.setItem("dailyScore", score.toString());

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentId((prev) => prev + 1);
    } else {
      handleCompletion();
    }
  };

  const handleBack = () => {
    if (currentId > 0) {
      setCurrentId((prev) => prev - 1);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl mt-[-50] rounded-lg text-center">
        {isComplete ? (
          <div className="text-xl font-medium text-green-600 mb-4">
            Thank you for completing your daily check-in! Redirecting...
          </div>
        ) : (
          <>
            <TextGenerateEffect
              key={currentId}
              words={sentences.find((s) => s.id === currentId)?.text ?? ""}
            />
            <div
              role="radiogroup"
              aria-label="Generated options"
              className="flex justify-center mt-20 space-x-2"
            >
              {options.map((opt, i) => {
                const btnIndex = i + 1;
                const isSelected = selections[currentId] === btnIndex;
                return (
                  <Button
                    key={`${currentId}-${opt.id}`}
                    role="radio"
                    aria-checked={isSelected}
                    variant={isSelected ? "default" : "ghost"}
                    onClick={() => {
                      const newSelections = [...selections];
                      newSelections[currentId] = btnIndex;
                      setSelections(newSelections);
                    }}
                  >
                    {opt.text}
                  </Button>
                );
              })}
            </div>
            <div className="flex justify-center pt-17 space-x-4">
              <Button
                variant="ghost"
                disabled={currentId === 0}
                onClick={handleBack}
              >
                <StepBackIcon /> Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={selections[currentId] === -1}
              >
                {isLastQuestion ? "Finish" : "Next"} <ForwardIcon />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Today;