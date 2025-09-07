'use client'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from '@/components/ui/button';
import { ForwardIcon, StepBackIcon } from 'lucide-react';

function Today() {
    const sentences = [
        { id: 0, text: "How are you feeling today?" },
        { id: 1, text: "How did you sleep last night?" },
        { id: 2, text: "What's your energy level right now?" },
        { id: 3, text: "How would you rate your stress level?" },
        { id: 4, text: "Have you taken care of your basic needs today?" },
        { id: 5, text: "What's your main emotion right now?" }
    ];
    const [currentId, setCurrentId] = useState<number>(0);
    const [selections, setSelections] = useState<number[]>(Array(sentences.length).fill(-1));
    const [isComplete, setIsComplete] = useState(false);

    const isLastQuestion = currentId === sentences.length - 1;

    // build 5 option objects based on the currentId, wrapping around the sentences array
    // simple editable texts you can modify directly
    // optionsBySentence[i] is an array of 5 option objects for sentence i.
    const optionsBySentence: { id: number; text: string }[][] = [
        // options for feeling today
        [
            { id: 0, text: "Really good" },
            { id: 1, text: "Pretty okay" },
            { id: 2, text: "Neutral" },
            { id: 3, text: "Not great" },
            { id: 4, text: "Struggling" }
        ],
        // options for sleep
        [
            { id: 0, text: "Slept well" },
            { id: 1, text: "Decent sleep" },
            { id: 2, text: "Could be better" },
            { id: 3, text: "Poor sleep" },
            { id: 4, text: "Barely slept" }
        ],
        // options for energy
        [
            { id: 0, text: "Very energetic" },
            { id: 1, text: "Moderately energetic" },
            { id: 2, text: "Average energy" },
            { id: 3, text: "Low energy" },
            { id: 4, text: "Very tired" }
        ],
        // options for stress
        [
            { id: 0, text: "Very relaxed" },
            { id: 1, text: "Slightly stressed" },
            { id: 2, text: "Moderately stressed" },
            { id: 3, text: "Quite stressed" },
            { id: 4, text: "Overwhelmed" }
        ],
        // options for basic needs
        [
            { id: 0, text: "All needs met" },
            { id: 1, text: "Most needs met" },
            { id: 2, text: "Some needs met" },
            { id: 3, text: "Few needs met" },
            { id: 4, text: "Need attention" }
        ],
        // options for main emotion
        [
            { id: 0, text: "Happy" },
            { id: 1, text: "Calm" },
            { id: 2, text: "Anxious" },
            { id: 3, text: "Sad" },
            { id: 4, text: "Mixed" }
        ]
    ];

    // pick the 5 options for the current sentence id (wrap if needed)
    const options = optionsBySentence[currentId % optionsBySentence.length];

    // Handle answer selection
    const handleSelection = (btnIndex: number) => {
        const newSelections = [...selections];
        newSelections[currentId] = btnIndex;
        setSelections(newSelections);
    };

    // Add check for daily completion
    useEffect(() => {
        const lastCheckIn = localStorage.getItem('lastCheckIn');
        const today = new Date().toDateString();
        
        if (lastCheckIn === today) {
            // User has already completed today's check-in
            window.location.href = '/dashboard';
        }
    }, []);

    // Modify completion handler
    const handleCompletion = () => {
        setIsComplete(true);
        // Store completion date and responses
        localStorage.setItem('lastCheckIn', new Date().toDateString());
        localStorage.setItem('lastResponses', JSON.stringify(selections));
        
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 2000);
    };

    // Update the button click handler
    const handleNext = () => {
        if (!isLastQuestion) {
            setCurrentId(prev => prev + 1);
        } else {
            handleCompletion();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-2xl mt-[-50] rounded-lg text-center">
                {isComplete ? (
                    <div className="text-xl font-medium text-green-600 mb-4">
                        Thank you for completing your daily check-in!
                    </div>
                ) : (
                    <>
                        <TextGenerateEffect
                            key={currentId}
                            words={sentences.find(s => s.id === currentId)?.text ?? ''}
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
                                onClick={() => setCurrentId(prev => prev - 1)}
                            >
                                <StepBackIcon /> Back
                            </Button>
                            <Button 
                                onClick={handleNext} 
                                disabled={selections[currentId] === -1}
                            >
                                {isLastQuestion ? "Finish" : "Next"} <ForwardIcon/>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Today