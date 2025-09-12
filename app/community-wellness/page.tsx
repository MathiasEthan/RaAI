'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { twMerge } from 'tailwind-merge';
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
// Define the shape of our data
interface Challenge {
    id: string;
    title: string;
    description: string;
    reward: string;
}

interface UserChallenge {
    challengeId: string;
    currentStreak: number;
    lastCompletedDate: string;
}

const cn = (...classNames: any[]) => twMerge(classNames);
const mockChallenges: Challenge[] = [
    { id: '1', title: 'Daily Gratitude', description: 'Write down three things you are grateful for each day.', reward: 'A sense of calm' },
    { id: '2', title: 'Mindful Breathing', description: 'Practice 5 minutes of focused breathing.', reward: 'Reduced stress' },
    { id: '3', title: 'Positive Affirmations', description: 'Repeat a positive affirmation to yourself.', reward: 'Increased confidence' },
    { id: '4', title: 'Random Acts of Kindness', description: 'Perform a kind act for someone else.', reward: 'Boosted mood' },
    { id: '5', title: 'Digital Detox', description: 'Spend one hour without any digital devices.', reward: 'Mental clarity' },
    { id: '6', title: 'Nature Walk', description: 'Take a 20-minute walk outside.', reward: 'Improved focus' },
];

export const Challenges = () => {
    const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
    const [userChallenges, setUserChallenges] = useState<{ [key: string]: UserChallenge }>({});
    const [userId, setUserId] = useState<string | null>('mock-user-1234');
    const [loading, setLoading] = useState<boolean>(false);
    const handleJoinChallenge = (challengeId: string) => {
        setUserChallenges(prev => ({
            ...prev,
            [challengeId]: { challengeId, currentStreak: 0, lastCompletedDate: '' }
        }));
    };

    const handleCompleteDay = (challengeId: string) => {
        const today = new Date().toISOString().slice(0, 10);
        setUserChallenges(prev => {
            const currentData = prev[challengeId];
            if (currentData.lastCompletedDate === today) {
                return prev;
            }
            return {
                ...prev,
                [challengeId]: {
                    ...currentData,
                    currentStreak: currentData.currentStreak + 1,
                    lastCompletedDate: today
                }
            };
        });
    };

    if (loading) {
        return <div className="text-center text-white text-xl">Loading challenges...</div>;
    }

    if (!userId) {
        return <div className="text-center text-white text-xl">Please wait, authenticating...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-center text-5xl font-bold mb-4">Community Challenges</h1>
            <p className="text-center text-xl text-gray-400 mb-12">Join a challenge and build your emotional wellness streak. Your User ID: {userId}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map(challenge => {
                    const userHasJoined = !!userChallenges[challenge.id];
                    const userStreak = userHasJoined ? userChallenges[challenge.id].currentStreak : 0;
                    const canCompleteToday = userHasJoined && userChallenges[challenge.id].lastCompletedDate !== new Date().toISOString().slice(0, 10);

                    return (
                        <Card key={challenge.id} className="bg-gray-800 text-white rounded-xl shadow-lg border-none flex flex-col justify-between">
                            <div>
                                <CardHeader>
                                    <CardTitle>{challenge.title}</CardTitle>
                                    <CardDescription className="text-gray-400 mt-2">{challenge.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-lg font-semibold">Reward: <span className="text-purple-400">{challenge.reward}</span></div>
                                    <div className="flex items-center text-lg">
                                        Your Streak: <span className="ml-2 font-bold text-yellow-400">{userStreak}</span>
                                        <span className="ml-1 text-yellow-400">🔥</span>
                                    </div>
                                </CardContent>
                            </div>
                            <CardFooter>
                                {!userHasJoined ? (
                                    <Button
                                        onClick={() => handleJoinChallenge(challenge.id)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                    >
                                        Join Challenge
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleCompleteDay(challenge.id)}
                                        disabled={!canCompleteToday}
                                        className={cn(
                                            "w-full font-bold",
                                            canCompleteToday ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-700 text-gray-500 cursor-not-allowed"
                                        )}
                                    >
                                        {canCompleteToday ? "Complete Today" : "Completed!"}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            <BackgroundBeams className="absolute top-0 left-0 w-full h-full z-0" />
        </div>
    );
};
export default Challenges;
