'use client'
import React from 'react'
import { useState } from 'react'
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
    const [selections, setSelections] = useState<number[]>(Array(sentences.length).fill(-1));

    // build 5 option objects based on the currentId, wrapping around the sentences array
    // simple editable texts you can modify directly
    // optionsBySentence[i] is an array of 5 option objects for sentence i.
    const optionsBySentence: { id: number; text: string; score:number }[][] = [
        // options for sentence 0
        [
            { id: 0, text: "Sunrise over the quiet city",score:0},
            { id: 1, text: "A soft morning hush",score:0.2 },
            { id: 2, text: "Dawn paints the rooftops" ,score:0.4},
            { id: 3, text: "First light, slow and warm" ,score:0.6},
            { id: 4, text: "City wakes in amber tones" ,score:0.8}
        ],
        // options for sentence 1
        [
            { id: 0, text: "Sunrise version two" ,score:0},
            { id: 1, text: "Echo of the morning",score:0.2 },
            { id: 2, text: "Rising light again",score:0.4 },
            { id: 3, text: "Another quiet dawn",score:0.6 },
            { id: 4, text: "Soft glow over streets",score:0.8 }
        ],
        // options for sentence 2
        [
            { id: 0, text: "Steam curls from the mug" ,score:0},
            { id: 1, text: "Coffee and first light",score:0.2 },
            { id: 2, text: "Warm cup on the desk",score:0.4 },
            { id: 3, text: "Aromatic morning ritual" ,score:0.6},
            { id: 4, text: "Mug and a fresh page" ,score:0.8}
        ],
        // options for sentence 3
        [
            { id: 0, text: "Breeze carries rain scent" ,score:0},
            { id: 1, text: "Wind from the hills",score:0.2 },
            { id: 2, text: "Fresh, rain-tinged air",score:0.4 },
            { id: 3, text: "A gentle, cool draft",score:0.6 },
            { id: 4, text: "Hills whisper of showers" ,score:0.8}
        ],
        // options for sentence 4
        [
            { id: 0, text: "Opened notebook, words flow",score:0 },
            { id: 1, text: "She writes without thinking",score:0.2 },
            { id: 2, text: "Ink spills honest thoughts",score:0.4 },
            { id: 3, text: "Pages fill in quiet focus",score:0.6 },
            { id: 4, text: "Thoughts become visible lines",score:0.8 }
        ],
        // options for sentence 5
        [
            { id: 0, text: "Market hums at noon",score:0 },
            { id: 1, text: "Colorful stalls and laughter",score:0.2 },
            { id: 2, text: "Noon bustle and bright wares",score:0.4 },
            { id: 3, text: "A lively afternoon scene",score:0.6 },
            { id: 4, text: "Vendors call, crowds wander",score:0.8 }
        ]
    ];

    const isLastQuestion = currentId === sentences.length - 1;
    const currentSentence = sentences[currentId]?.text;
    const [isComplete, setIsComplete] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const options = optionsBySentence[currentId] || [];

     const handleBack = () => {
        if (currentId > 0) {
            setCurrentId(prev => prev - 1);
        }
    };

    const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentId(prev => prev + 1);
    } else {
     
      let score = selections.reduce((acc, sel, idx) => {
        if (sel === -1) return acc;
        return acc + (optionsBySentence[idx][sel]?.score || 0);
      }, 0);
      setTotalScore(score);
      setIsComplete(true);

     
      localStorage.setItem('onboardingScore', score.toString());

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000); 
    }
  };

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
                      const isSelected = selections[currentId] === opt.id;

                        return (
                            <Button
                                                          key={`${currentId}-${opt.id}`}
                                                          role="radio"
                                                          aria-checked={selections[currentId] === btnIndex}
                                                          variant={selections[currentId] === btnIndex ? "default" : "ghost"}
                                                          onClick={() => {
                                                           const newSelections = [...selections];
                                                           newSelections[currentId] = btnIndex; 
                                                           setSelections(newSelections);
                                                           }}>
                                                           {opt.text}
                           </Button>
                        );
                    })}
                </div>
                <div className="flex justify-center pt-17 space-x-4">
                    <Button variant="ghost" disabled={currentId === 0}
                        onClick={handleBack}
                    >
                        Back
                    </Button>
                    <Button
                     onClick={handleNext}
                    disabled={selections[currentId] === -1}
                       
                    >
                         {isLastQuestion ? "Finish" : "Next"}
                      
                    </Button>
                </div>
            </div>
        </div>
        
         
    </>
  )
}

export default Today