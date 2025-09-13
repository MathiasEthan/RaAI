"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/button";
import { ForwardIcon, StepBackIcon } from "lucide-react";
import { toast } from "sonner";
import { apiClient, authUtils, errorUtils } from "@/lib/api";

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
  const [user, setUser] = useState<{ _id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isLastQuestion = currentId === sentences.length - 1;

  useEffect(() => {
    checkAuthAndPreviousCheckin();
  }, []);

  const checkAuthAndPreviousCheckin = async () => {
    try {
      const currentUser = await authUtils.checkAuth();
      setUser(currentUser);
    } catch (error) {
      console.error("Auth check failed:", error);
    }

    // Check if already completed today
    const lastCheckIn = localStorage.getItem("lastCheckIn");
    const today = new Date().toDateString();

    if (lastCheckIn === today) {
      toast.info("You've already completed today's check-in!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
  };

  const optionsBySentence: { id: number; text: string; score: number }[][] = [
    // options for feeling today
    [
      { id: 0, text: "Really good", score: 10 },
      { id: 1, text: "Pretty okay", score: 8 },
      { id: 2, text: "Neutral", score: 6 },
      { id: 3, text: "Not great", score: 4 },
      { id: 4, text: "Struggling", score: 2 },
    ],
    // options for sleep
    [
      { id: 0, text: "Slept well", score: 10 },
      { id: 1, text: "Decent sleep", score: 7.5 },
      { id: 2, text: "Could be better", score: 5 },
      { id: 3, text: "Poor sleep", score: 2.5 },
      { id: 4, text: "Barely slept", score: 1 },
    ],
    // options for energy
    [
      { id: 0, text: "Very energetic", score: 10 },
      { id: 1, text: "Moderately energetic", score: 7.5 },
      { id: 2, text: "Average energy", score: 5 },
      { id: 3, text: "Low energy", score: 2.5 },
      { id: 4, text: "Very tired", score: 1 },
    ],
    // options for stress (reverse scored)
    [
      { id: 0, text: "Very relaxed", score: 10 },
      { id: 1, text: "Slightly stressed", score: 7.5 },
      { id: 2, text: "Moderately stressed", score: 5 },
      { id: 3, text: "Quite stressed", score: 2.5 },
      { id: 4, text: "Overwhelmed", score: 1 },
    ],
    // options for basic needs
    [
      { id: 0, text: "All needs met", score: 10 },
      { id: 1, text: "Most needs met", score: 7.5 },
      { id: 2, text: "Some needs met", score: 5 },
      { id: 3, text: "Few needs met", score: 2.5 },
      { id: 4, text: "Need attention", score: 1 },
    ],
    // options for main emotion
    [
      { id: 0, text: "Happy", score: 10 },
      { id: 1, text: "Calm", score: 8 },
      { id: 2, text: "Anxious", score: 4 },
      { id: 3, text: "Sad", score: 3 },
      { id: 4, text: "Mixed", score: 5 },
    ],
  ];

  const options = optionsBySentence[currentId] || [];

  const handleCompletion = async () => {
    setSubmitting(true);

    // Calculate scores
    const scores = selections.map((sel, idx) => {
      if (sel === -1) return 0;
      return optionsBySentence[idx][sel - 1]?.score || 0;
    });

    const averageScore =
      scores.reduce((acc, score) => acc + score, 0) / scores.length;
    setTotalScore(averageScore);

    // Prepare answers for API
    const answers: Record<string, number> = {
      feeling: scores[0],
      sleep: scores[1],
      energy: scores[2],
      stress: scores[3],
      basic_needs: scores[4],
      emotion: scores[5],
    };

    try {
      if (user) {
        // Submit to backend
        const result = await apiClient.submitCheckin(answers, user._id);
        toast.success(
          `Daily check-in completed! Mood score: ${result.mood_index.toFixed(
            1
          )}/10`
        );

        // Store result
        localStorage.setItem("lastCheckinResult", JSON.stringify(result));
      } else {
        toast.success("Daily check-in completed! (Demo mode)");
      }

      // Store completion info
      localStorage.setItem("lastCheckIn", new Date().toDateString());
      localStorage.setItem("lastResponses", JSON.stringify(selections));
      localStorage.setItem("dailyScore", averageScore.toString());

      setIsComplete(true);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      errorUtils.handleApiError(error, "Daily check-in");

      // Fallback to local storage only
      localStorage.setItem("lastCheckIn", new Date().toDateString());
      localStorage.setItem("lastResponses", JSON.stringify(selections));
      localStorage.setItem("dailyScore", averageScore.toString());

      setIsComplete(true);
      toast.success("Daily check-in saved locally!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } finally {
      setSubmitting(false);
    }
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
            {submitting
              ? "Saving your check-in..."
              : `Thank you for completing your daily check-in! Score: ${totalScore.toFixed(
                  1
                )}/10. Redirecting...`}
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
                disabled={selections[currentId] === -1 || submitting}
              >
                {submitting
                  ? "Submitting..."
                  : isLastQuestion
                  ? "Finish"
                  : "Next"}{" "}
                <ForwardIcon />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Today;
