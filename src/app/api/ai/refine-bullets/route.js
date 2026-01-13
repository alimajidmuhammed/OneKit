import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rateLimit';

export async function POST(req) {
    try {
        // SECURITY: Authenticate user to prevent API abuse
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        // SECURITY: Rate limiting per user
        const rateCheck = checkRateLimit(`ai:${user.id}`, RATE_LIMITS.AI_ENDPOINTS.maxRequests, RATE_LIMITS.AI_ENDPOINTS.windowMs);
        if (!rateCheck.success) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a minute." },
                { status: 429, headers: getRateLimitHeaders(rateCheck) }
            );
        }


        const { text, position, company, generateNew } = await req.json();

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json(
                { error: "AI API Key not configured" },
                { status: 500 }
            );
        }


        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);

        // 1. Get all available models
        let candidateModels = [];
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await response.json();

            candidateModels = data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace("models/", ""));

            candidateModels.sort((a, b) => {
                const aIsFlash = a.includes("flash") ? -1 : 1;
                const bIsFlash = b.includes("flash") ? -1 : 1;
                return aIsFlash - bIsFlash;
            });
        } catch (e) {
            candidateModels = ["gemini-1.5-flash", "gemini-pro"];
        }

        // Different prompts for generating new vs refining existing
        let prompt;
        if (generateNew || !text || text.trim() === '') {
            prompt = `
You are a professional resume writer. Generate a concise, impactful job description paragraph for the following position.

Position: "${position}"
${company ? `Company: "${company}"` : ''}

Write 2-3 sentences describing key responsibilities and achievements typical for this role.
Use strong action verbs and be specific about skills and accomplishments.
Write in first person past tense (e.g., "Managed...", "Developed...", "Led...").
Return ONLY the description paragraph. No quotes, no bullet points, no extra formatting.
`;
        } else {
            prompt = `
You are a professional resume editor. Rewrite the following work experience description to be more professional, impactful, and action-oriented.

Position: "${position}"
${company ? `Company: "${company}"` : ''}
Current Text: "${text}"

Improve the language, use strong action verbs, and make it more compelling.
Keep a similar length to the original.
Return ONLY the refined text. No quotes.
`;
        }

        // 2. Try until success
        let refinedText = null;
        let lastError = "";

        for (const modelName of candidateModels) {
            try {
                console.log(`Attempting AI generation with: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
                const result = await model.generateContent(prompt);
                refinedText = result.response.text().trim();
                if (refinedText) {
                    console.log(`Success with model: ${modelName}`);
                    break;
                }
            } catch (err) {
                console.log(`Model ${modelName} failed: ${err.message}`);
                lastError = err.message;
                continue;
            }
        }

        if (!refinedText) {
            throw new Error(`AI generation failed. No working models found. Last error: ${lastError}`);
        }

        return NextResponse.json({ refinedText });
    } catch (error) {
        console.error("AI Refine Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate description" },
            { status: 500 }
        );
    }
}
