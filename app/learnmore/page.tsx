
'use client'
import React from 'react'
import { useState } from 'react'
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";



function Learnmore() {
    return (
        <>
            <div className='flex justify-left mt-10 ml-10'>
                <TextGenerateEffect
                    words="The Ra.AI Solution"
                    duration={0.6}
                    filter={true}
                />
            </div>
            <div className='flex justify-center ml-10 mt-10 px-5'>
                <TextGenerateEffect
                    words="Ra.AI is a personalized emotional intelligence platform designed to empower individuals by helping them understand, track, and improve their emotional well-being. Unlike generic wellness apps, Ra.AI uses a dynamic and adaptive approach to assess a user's Emotional Quotient (EQ) levels and provide a deeply personalized experience. Through a series of intelligent daily check-ins and interactive journaling, the platform tracks emotional patterns over time, providing users with a visual and data-driven understanding of their emotional triggers and states. Our core innovation lies in a proprietary EQ assessment model that, combined with AI-powered analysis, generates a tailored curriculum of exercises and insights. These aren't one-size-fits-all suggestions; they are unique, actionable steps designed to improve an individual's self-awareness, emotional regulation, motivation, and interpersonal skills. Ra.AI is your personal guide to building a more resilient, empathetic, and emotionally intelligent self. "
                    duration={0.6}
                    filter={true}
                    className='font-light text-md md:text-lg lg:text-xl'
                />
            </div>
            <div className='flex justify-center ml-10 mt-10 px-5'>
                <TextGenerateEffect
                    words="Key Points of Our Solution"
                    duration={0.6}
                    filter={true}
                />
            </div>
            <div className='flex justify-left ml-10 mt-10 px-5'>
                <TextGenerateEffect
                    words="1. Personalized EQ Assessment: Our platform begins with a comprehensive evaluation of the user's emotional intelligence, identifying strengths and areas for growth."
                    duration={0.6}
                    filter={true}
                    className='font-light text-md md:text-lg lg:text-xl'
                />
            </div>
            <div className='flex justify-left ml-10 mt-10 px-5'>
                <TextGenerateEffect
                    words="2. Daily Emotional Check-ins: Users engage in brief, daily check-ins that capture their emotional states, providing real-time data for analysis."
                    duration={0.6}
                    filter={true}   
                    className='font-light text-md md:text-lg lg:text-xl'
                />
            </div>
            <div className='flex justify-left ml-10 mt-10 px-5'>
                <TextGenerateEffect
                    words="3. Interactive Journaling: The platform encourages reflective journaling, helping users articulate their feelings and experiences."
                    duration={0.6}
                    filter={true}
                    className='font-light text-md md:text-lg lg:text-xl'
                />
            </div>
            <div className='flex justify-left ml-10 mt-10 px-5'>
                <TextGenerateEffect 
                    words="4. AI-Powered Insights: Advanced algorithms analyze emotional data to identify patterns and provide personalized insights."
                    duration={0.6}
                    filter={true}
                    className='font-light text-md md:text-lg lg:text-xl'
                />
            </div>
            <div className='flex justify-left ml-10 mt-10 px-5'>
                <TextGenerateEffect
                    words="5. Tailored Improvement Plans: Based on the analysis, users receive customized exercises and strategies to enhance their emotional intelligence."
                    duration={0.6}
                    filter={true}
                    className='font-light text-md md:text-lg lg:text-xl'
                />
            </div>
            <div className='flex justify-left ml-10 mt-10 px-5 mb-20'>
                <TextGenerateEffect
                    words="6. Progress Tracking: Users can monitor their emotional growth over time through visual dashboards and reports."
                    duration={0.6}
                    filter={true}
                    className='font-light text-md md:text-lg lg:text-xl'
                />
            </div>
            
        </>
    )
}

export default Learnmore
