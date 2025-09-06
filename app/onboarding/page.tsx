'use client'
import React from 'react'
import { useState } from 'react'
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
<ArrowLeft />
function Onboarding() {
    const sentences = [
        { id: 0, text: "How would you describe your emotional state most days" },
        { id: 1, text: "How often do you find yourself reacting impulsively to difficult situations?" },
        { id: 2, text: "What is your primary goal for using our platform?" },
        { id: 3, text: "What emotional skill are you most interested in developing right now?" },
        { id: 4, text: "What is the most challenging time of day for you, emotionally?" },
        { id: 5, text: "How do you currently cope with stress?" }
    ];
    const [currentId, setCurrentId] = useState<number>(0);
    const [selected, setSelected] = useState<number>(1);

    // build 5 option objects based on the currentId, wrapping around the sentences array
    // simple editable texts you can modify directly
    // optionsBySentence[i] is an array of 5 option objects for sentence i.
    const optionsBySentence: { id: number; text: string }[][] = [
        // options for sentence 0
        [
            { id: 0, text: "Calm" },
            { id: 1, text: "Anxious" },
            { id: 2, text: "Neutral" },
            { id: 3, text: "Stressed" },
            { id: 4, text: "Unpredictable" }
        ],
        // options for sentence 1
        [
            { id: 0, text: "Rarely" },
            { id: 1, text: "Rarely, Sometimes, " },
            { id: 2, text: "Often, Most of the time" }

        ],
        // options for sentence 2
        [
            { id: 0, text: "Reduce stress and anxiety" },
            { id: 1, text: "Improve my relationships" },
            { id: 2, text: "Build self-confidence" },
            { id: 3, text: "Understand myself better" },
            { id: 4, text: "Stay calm under pressure" }
        ],
        // options for sentence 3
        [
            { id: 0, text: "Managing my anger" },
            { id: 1, text: "Expressing empathy to others" },
            { id: 2, text: "Giving and receiving feedback" },
            { id: 3, text: "Communicating my needs" },
            { id: 4, text: "Staying focused and motivated" }
        ],
        // options for sentence 4
        [
            { id: 0, text: "Mornings" },
            { id: 1, text: "Afternoons" },
            { id: 2, text: "Evenings" },
            { id: 3, text: "Nights" },
        ],
        // options for sentence 5
        [
            { id: 0, text: "Exercise" },
            { id: 1, text: "Listening to music" },
            { id: 2, text: "Journaling" },
            { id: 3, text: "Talking to a friend" },
            { id: 4, text: "Buzzzzz" }
        ]
    ];

    // pick the 5 options for the current sentence id (wrap if needed)
    const options = optionsBySentence[currentId % optionsBySentence.length];

  return (
    <>
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-2xl mt-[-50] rounded-lg text-center">
                <TextGenerateEffect
                    key={currentId} // force remount on id change
                    words={sentences.find(s => s.id === currentId)?.text ?? ''}
                />
                <div role="radiogroup" aria-label="Generated options" className="flex justify-center mt-20 space-x-4">
                    {options.map((opt, i) => {
                        const btnIndex = i + 1;
                        const isSelected = selected === btnIndex;
                        return (
                            <Button
                                key={`${currentId}-${opt.id}`}
                                role="radio"
                                aria-checked={isSelected}
                                variant={isSelected ? "default" : "ghost"}
                                onClick={() => setSelected(btnIndex)}
                            >
                                {opt.text}
                            </Button>
                        );
                    })}
                </div>
                <div className="flex justify-center pt-17 space-x-4">
                    <Button variant="ghost"
                        onClick={() => setCurrentId(prev => (prev - 1 + sentences.length) % sentences.length)}
                    >
                        <ArrowLeft /> Back
                    </Button>
                    <Button
                        onClick={() => setCurrentId(prev => (prev + 1) % sentences.length)}
                    >
                        
                        Next  <ArrowRight />
                    </Button>
                </div>
            </div>
        </div>
        <div className="w-full mt-[-175]">
      </div>
    </>
  )
}

export default Onboarding;
