import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import {TextGenerateEffect} from "@/components/ui/text-generate-effect"
import { Button } from "@/components/ui/button";

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
      <div className="w-full flex justify-center mt-[-80]">
        <div className="flex gap-4">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" aria-label="Get started">
        Get started
          </Button>
          <Button variant="ghost" aria-label="Learn more">
        Learn more
          </Button>
        </div>
      </div>
    </div>
  );
}
