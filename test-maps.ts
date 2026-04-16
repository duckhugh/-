import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Find 1 restaurant near Taipei 101. Return a JSON object with its name and a direct URL to its Google Maps photo (a working image URL).",
    tools: [{ googleMaps: {} }],
  });
  console.log(response.text);
}
test();
