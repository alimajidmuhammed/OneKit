import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rateLimit';

interface GenerateSummaryRequest {
    jobTitle?: string;
    keywords?: string;
    experience?: string;
}

interface GenerateSummaryResponse {
    summary?: string;
    error?: string;
}

interface GeminiModel {
    name: string;
    supportedGenerationMethods: string[];
}

interface GeminiModelsResponse {
    models: GeminiModel[];
}

/**
 * POST /api/ai/generate-summary
 * Generate a professional summary for a CV using Gemini AI
 */
export async function POST(req: NextRequest): Promise<NextResponse<GenerateSummaryResponse>> {
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

        const body: GenerateSummaryRequest = await req.json();
        const { jobTitle, keywords, experience } = body;

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json(
                { error: "AI API Key not configured" },
                { status: 500 }
            );
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);

        // 1. Get all available models for this key
        let candidateModels: string[] = [];
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data: GeminiModelsResponse = await response.json();

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
            const error = e instanceof Error ? e.message : 'Unknown error';
            console.warn("Failed to list models, using absolute defaults:", error);
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
        let generatedText: string | null = null;
        let lastError = "";

        for (const modelName of candidateModels) {
            try {
                console.log(`Attempting AI generation with: ${modelName}`);
                const model: GenerativeModel = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                generatedText = result.response.text().trim();

                if (generatedText) {
                    console.log(`Success with model: ${modelName}`);
                    break;
                }
            } catch (err) {
                const error = err instanceof Error ? err.message : 'Unknown error';
                console.warn(`Model ${modelName} failed:`, error);
                lastError = error;
                continue;
            }
        }

        if (!generatedText) {
            throw new Error(`AI Service Unavailable. All available models failed your quota. Last error: ${lastError}`);
        }

        return NextResponse.json({ summary: generatedText });
    } catch (error) {
        console.error("AI Summary Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate summary";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
