'use client'
import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import { BackgroundBeams } from '@/components/ui/BackgroundBeams' 

const MoodIndexPage = () => {
    return (
        <div className="h-screen w-full relative flex flex-col items-center justify-center antialiased">
            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-20 mb-20">
                <h2 className="text-3xl md:text-5xl font-bold mb-10 text-center bg-gradient-to-r from-purple-400 to-indigo-600 text-transparent bg-clip-text">
                    Vibe of the day....
                </h2>
                <Textarea
                    className="mdindex-txtarea w-full min-h-[200px] border border-gray-700 bg-gray-900 text-white rounded-xl p-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    placeholder="How are you feeling today?"
                ></Textarea>
                <div className="flex justify-center mt-6">
                    <button
                        className="mdindex-submit-btn px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                        Submit
                    </button>
                </div>
            </div>
            <BackgroundBeams className="absolute top-0 left-0 w-full h-full z-0" />
        </div>
    )
}
export default MoodIndexPage;
