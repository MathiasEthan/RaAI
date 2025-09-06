import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({});

export async function call() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

