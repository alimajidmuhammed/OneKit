import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { jobTitle, keywords, experience } = await req.json();

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json(
                { error: "AI API Key not configured" },
                { status: 500 }
            );
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);

        // 1. Get all available models for this key
        let candidateModels = [];
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await response.json();

            candidateModels = data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace("models/", ""));

            // Sort to prefer "flash" models first as they are usually more available in free tier
            candidateModels.sort((a, b) => {
                const aIsFlash = a.includes("flash") ? -1 : 1;
                const bIsFlash = b.includes("flash") ? -1 : 1;
                return aIsFlash - bIsFlash;
            });
        } catch (e) {
            console.warn("Failed to list models, using absolute defaults:", e.message);
            candidateModels = ["gemini-1.5-flash", "gemini-pro", "gemini-2.0-flash-exp"];
        }

        const prompt = `
      You are a professional resume writer. Generate a concise, impactful professional summary (approx 2-3 sentences) for a CV.
      
      Job Title: ${jobTitle || "Professional"}
      Keywords: ${keywords || "skills, experience"}
      Top Experience: ${experience || "various projects"}

      Return ONLY the summary text.
    `;

        // 2. Try generation with each candidate until one works
        let generatedText = null;
        let lastError = "";

        for (const modelName of candidateModels) {
            try {
                console.log(`Attempting AI generation with: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
                const result = await model.generateContent(prompt);
                generatedText = result.response.text().trim();

                if (generatedText) {
                    console.log(`Success with model: ${modelName}`);
                    break;
                }
            } catch (err) {
                console.warn(`Model ${modelName} failed:`, err.message);
                lastError = err.message;
                continue; // Try next model
            }
        }

        if (!generatedText) {
            throw new Error(`AI Service Unavailable. All available models failed your quota. Last error: ${lastError}`);
        }

        return NextResponse.json({ summary: generatedText });
    } catch (error) {
        console.error("AI Summary Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate summary" },
            { status: 500 }
        );
    }
}
