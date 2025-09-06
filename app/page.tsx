import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import {TextGenerateEffect} from "@/components/ui/text-generate-effect"
import { Spotlight } from "@/components/ui/spotlight-new"

export default function Home() {
const words : string= "decode your emotions, master your life"
  return (
    <div>
      <Spotlight />
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <TextHoverEffect text="RaAI" />
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <TextGenerateEffect words={words} />
        </div>
      </main>
    </div>
  );
}
