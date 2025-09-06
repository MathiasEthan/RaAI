'use client'
import React from 'react'
import { useState } from 'react'
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from '@/components/ui/button';
import { ForwardIcon, StepBackIcon } from 'lucide-react';

function Today() {
    const sentences = [
        { id: 0, text: "The sun rose over the quiet city." },
        { id: 1, text: "The sun rose over the quiet city 222." },
        { id: 2, text: "Coffee steamed in the mug as the first light hit the desk." },
        { id: 3, text: "A gentle breeze carried the scent of rain from the hills." },
        { id: 4, text: "She opened her notebook and began to write without thinking." },
        { id: 5, text: "By noon the market buzzed with colorful stalls and laughter." }
    ];
    const [currentId, setCurrentId] = useState<number>(0);
    const [selected, setSelected] = useState<number>(1);

    // build 5 option objects based on the currentId, wrapping around the sentences array
    // simple editable texts you can modify directly
    // optionsBySentence[i] is an array of 5 option objects for sentence i.
    const optionsBySentence: { id: number; text: string }[][] = [
        // options for sentence 0
        [
            { id: 0, text: "Sunrise over the quiet city" },
            { id: 1, text: "A soft morning hush" },
            { id: 2, text: "Dawn paints the rooftops" },
            { id: 3, text: "First light, slow and warm" },
            { id: 4, text: "City wakes in amber tones" }
        ],
        // options for sentence 1
        [
            { id: 0, text: "Sunrise version two" },
            { id: 1, text: "Echo of the morning" },
            { id: 2, text: "Rising light again" },
            { id: 3, text: "Another quiet dawn" },
            { id: 4, text: "Soft glow over streets" }
        ],
        // options for sentence 2
        [
            { id: 0, text: "Steam curls from the mug" },
            { id: 1, text: "Coffee and first light" },
            { id: 2, text: "Warm cup on the desk" },
            { id: 3, text: "Aromatic morning ritual" },
            { id: 4, text: "Mug and a fresh page" }
        ],
        // options for sentence 3
        [
            { id: 0, text: "Breeze carries rain scent" },
            { id: 1, text: "Wind from the hills" },
            { id: 2, text: "Fresh, rain-tinged air" },
            { id: 3, text: "A gentle, cool draft" },
            { id: 4, text: "Hills whisper of showers" }
        ],
        // options for sentence 4
        [
            { id: 0, text: "Opened notebook, words flow" },
            { id: 1, text: "She writes without thinking" },
            { id: 2, text: "Ink spills honest thoughts" },
            { id: 3, text: "Pages fill in quiet focus" },
            { id: 4, text: "Thoughts become visible lines" }
        ],
        // options for sentence 5
        [
            { id: 0, text: "Market hums at noon" },
            { id: 1, text: "Colorful stalls and laughter" },
            { id: 2, text: "Noon bustle and bright wares" },
            { id: 3, text: "A lively afternoon scene" },
            { id: 4, text: "Vendors call, crowds wander" }
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
                <div
                    role="radiogroup"
                    aria-label="Generated options"
                    className="flex justify-center mt-20 space-x-2"
                    // assign a unique name for each group
                >
                    {options.map((opt, i) => {
                        const btnIndex = i + 1;
                        const isSelected = selected === btnIndex;
                        return (
                            <Button
                                key={`${currentId}-${opt.id}`}
                                role="radio"
                                aria-checked={isSelected}
                                name={`options-group-${currentId}`}
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
                    <StepBackIcon />
                        Back
                    </Button>
                    <Button
                        onClick={() => setCurrentId(prev => (prev + 1) % sentences.length)}
                    >
                        Next
                    <ForwardIcon />
                    </Button>
                </div>
            </div>
        </div>
        
         
    </>
  )
}

export default Today