'use client'
import React from 'react'
import { useState } from 'react'
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { cn } from "@/lib/utils"
import  Slider  from '../../components/ui/slider';

<ArrowLeft />
function Onboarding() {
    
    const sentences = [
        { id: 0, text: "How often do you take time to reflect on your emotions and understand why you feel a certain way?" },
        { id: 1, text: "How often do you recognize and understand the feelings of others in different situations?" },
        { id: 2, text: "How often are you able to stay calm and manage your emotions during stressful or challenging situations?" },
        { id: 3, text: "How often do you communicate your feelings clearly and respectfully to others?" },
        { id: 4, text: "How often do you stay motivated and positive, even when faced with setbacks?" },
        { id: 5, text: "How often do you bounce back quickly after experiencing disappointment or failure?" }
    ];
    const [currentId, setCurrentId] = useState<number>(0);
    const [selected, setSelected] = useState<number>(1);

    // build 5 option objects based on the currentId, wrapping around the sentences array
    // simple editable texts you can modify directly
    // optionsBySentence[i] is an array of 5 option objects for sentence i.
    const optionsBySentence: { id: number; text: string }[][] = [
        // options for sentence 0
        [
            { id: 0, text: "Rarely" },
            { id: 1, text: "Sometimes" },
            { id: 2, text: "Often" },
            { id: 3, text: "Very Often" },
            { id: 4, text: "Always" }
        ],
        // options for sentence 1
        [
            { id: 0, text: "Rarely" },
            { id: 1, text: "Sometimes " },
            { id: 2, text: "Often" },
            { id: 3, text: "Very Often" },
            { id: 4, text: "Always" },

        ],
        // options for sentence 2
        [
            { id: 0, text: "Rarely" },
            { id: 1, text: "Sometimes" },
            { id: 2, text: "Often" },
            { id: 3, text: "Very Often" },
            { id: 4, text: "Always" }
        ],
        // options for sentence 3
        [
            { id: 0, text: "Rarely" },
            { id: 1, text: "Sometimes" },
            { id: 2, text: "Often" },
            { id: 3, text: "Very Often" },
            { id: 4, text: "Always" }
        ],
        // options for sentence 4
        [
            { id: 0, text: "Rarely" },
            { id: 1, text: "Sometimes" },
            { id: 2, text: "Often" },
            { id: 3, text: "Very Often" },
        ],
        // options for sentence 5
        [
            { id: 0, text: "Rarely" },
            { id: 1, text: "Sometimes" },
            { id: 2, text: "Often" },
            { id: 3, text: "Very Often" }
           
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
                        <ArrowLeft />Back
                    </Button>
                    <Button
                        onClick={() => setCurrentId(prev => (prev + 1) % sentences.length)}
                    >
                        
                        Next  <ArrowRight />
                    </Button>
                </div>
            </div>    
        </div>
        <Slider></Slider>    
    </>
  )
}

export default Onboarding;
