import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import {TextGenerateEffect} from "@/components/ui/text-generate-effect"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
const words : string= "decode your emotions, master your life"
  return (
    <div>
      <main className="min-h-screen flex flex-col items-center justify-center mt-[-120]">
        <TextHoverEffect text="Ra.AI" />
        <div className="flex justify-center w-full mt-[-90]">
          <TextGenerateEffect words={words} />
        </div>
      </main>
      <div className="w-full flex justify-center mt-[-90]">
        <div className="flex gap-4">
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
      <div className="w-full mt-4">
        <footer className="text-white p-6 text-center rounded-t-lg">
          <p className="text-sm">&copy; 2025 Ra.AI. All rights reserved.</p>
          <p className="text-xs mt-1">
            <Link href="https://www.instagram.com/ethan.spaamm/" className="hover:underline">Contact Us</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
