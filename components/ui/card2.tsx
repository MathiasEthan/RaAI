'use client'
import React, { ReactNode } from 'react'
import Image from 'next/image'

interface CardProps {
  title: string
  description: string
  imageUrl: string
  className?: string
  children?: ReactNode
}

export default function Card({ title, description, imageUrl, className = '', children }: CardProps) {
  return (
    <div className={`max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-500 hover:scale-105 hover:-rotate-1 ${className}`}>
      <div className="relative h-64 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-700">{description}</p>
        {children}
      </div>
    </div>
  )
}