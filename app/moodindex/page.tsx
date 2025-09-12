'use client'
import React from 'react'
import Card from '@/components/ui/card2'
import { Textarea } from "@/components/ui/textarea"
import Footer from '@/components/Footer'

const MoodIndexPage = () => {
  return (
    <>
      <h2>Vibe of the day....</h2>

      <Textarea className="mdindex-txtarea"></Textarea>
      <button className="mdindex-submit-btn">Submit</button>
      {/* <Footer></Footer> */}
    </>
  )
}


export default MoodIndexPage;
