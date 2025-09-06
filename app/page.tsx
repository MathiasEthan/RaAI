import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import {TextGenerateEffect} from "@/components/ui/text-generate-effect"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import adi from "@/public/adi.jpg"
import ethan from "@/public/ethan.jpg"
import muaaz from "@/public/muaaz.jpg"
import arnav from "@/public/arnav.jpg"
import mox from "@/public/mox.jpg"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export default function Home() {
const words : string= "decode your emotions, master your life."
const weAre = [ {
      quote:
        "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
      name: "Aditya Parameswar",
      designation: "Head of Web Dev at Gautam Tech Solutions",
      src: adi.src,
    },
    {
      quote:
        "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: "Muaaz Shaikh",
      designation: "3x Google SWE Interview Reject",
      src: muaaz.src,
    },
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Ethan Mathias",
      designation: "15x Bumble Reject Streak  ",
      src: ethan.src,
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "Rajesh Codemarika",
      designation: "Engineering Lead at Gupta Vada Pav",
      src: arnav.src,
    },
    
  ];
  return (
    <div className="p-5 m-5">
      <main className="min-h-screen flex flex-col items-center justify-center mt-[-120] ">
        <TextHoverEffect text="Ra.AI" />
        <div className="flex justify-center w-full md:mt-[-90] sm:mt-20">
          <TextGenerateEffect words={words} />
        </div>
      </main>
      <div className="w-full flex justify-center mt-[-90]">
        <div className="flex gap-4 mt-[-100] md:mt-0">
          <Link href="/onboarding">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" aria-label="Get started">
              Get started
            </Button>
          </Link>
          <Button variant="ghost" aria-label="Learn more">
            Learn more
          </Button>
        </div>
        
      </div>
      <AnimatedTestimonials testimonials={weAre}/>
      <div className="w-full mt-4">
      </div>
    </div>
  );
}
