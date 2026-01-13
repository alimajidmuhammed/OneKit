import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { jobTitle, keywords, experience, availableTemplates } = await req.json();

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json(
                { error: "AI API Key not configured" },
                { status: 500 }
            );
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);

        const prompt = `
      You are a professional brand designer and resume expert. Analyze this professional profile and recommend the best CV template style and color palette.
      
      Job Title: ${jobTitle || "Professional"}
      Keywords: ${keywords || "skills, experience"}
      Experience Summary: ${experience || "various projects"}

      Available Template Styles (Choose the most fitting ID):
      ${availableTemplates.map(t => `- ${t.id}: ${t.description}`).join('\n')}

      Guidelines for Color Recommendation:
      - Primary Color: A professional hex code (e.g., Deep Blues for Finance, Vibrant Indigos for Tech, Warm Reds for Creative).
      - Accent Color: A light harmonized background hex code.

      Return ONLY a JSON object in this format:
      {
        "templateId": "selected_id",
        "primaryColor": "#hexcode",
        "accentColor": "#hexcode",
        "rationale": "One sentence explaining why this style fits the job title."
      }
    `;

        // 1. Get available models
        let candidateModels = ["gemini-1.5-flash", "gemini-pro", "gemini-2.0-flash-exp"];
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await response.json();
            candidateModels = data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace("models/", ""));
        } catch (e) {
            console.warn("Model list failed, using defaults");
        }

        // 2. Try generation
        let recommendation = null;
        let lastError = "";

        for (const modelName of candidateModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();

                // Clean the text in case AI added markdown blocks
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    recommendation = JSON.parse(jsonMatch[0]);
                    break;
                }
            } catch (err) {
                lastError = err.message;
                continue;
            }
        }

        if (!recommendation) {
            throw new Error(`AI Styling failed. Last error: ${lastError}`);
        }

        return NextResponse.json(recommendation);
    } catch (error) {
        console.error("AI Style Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to recommend style" },
            { status: 500 }
        );
    }
}
