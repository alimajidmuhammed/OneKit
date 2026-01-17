import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/utils/rateLimit';

interface TemplateOption {
    id: string;
    description: string;
}

interface RecommendStyleRequest {
    jobTitle?: string;
    keywords?: string;
    experience?: string;
    availableTemplates: TemplateOption[];
}

interface StyleRecommendation {
    templateId: string;
    primaryColor: string;
    accentColor: string;
    rationale: string;
}

interface RecommendStyleResponse extends Partial<StyleRecommendation> {
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
 * POST /api/ai/recommend-style
 * Recommend CV template style and colors using Gemini AI
 */
export async function POST(req: NextRequest): Promise<NextResponse<RecommendStyleResponse>> {
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

        const body: RecommendStyleRequest = await req.json();
        const { jobTitle, keywords, experience, availableTemplates } = body;

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
        let candidateModels: string[] = ["gemini-1.5-flash", "gemini-pro", "gemini-2.0-flash-exp"];
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data: GeminiModelsResponse = await response.json();
            candidateModels = data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace("models/", ""));
        } catch (e) {
            console.warn("Model list failed, using defaults");
        }

        // 2. Try generation
        let recommendation: StyleRecommendation | null = null;
        let lastError = "";

        for (const modelName of candidateModels) {
            try {
                const model: GenerativeModel = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();

                // Clean the text in case AI added markdown blocks
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    recommendation = JSON.parse(jsonMatch[0]) as StyleRecommendation;
                    break;
                }
            } catch (err) {
                const error = err instanceof Error ? err.message : 'Unknown error';
                lastError = error;
                continue;
            }
        }

        if (!recommendation) {
            throw new Error(`AI Styling failed. Last error: ${lastError}`);
        }

        return NextResponse.json(recommendation);
    } catch (error) {
        console.error("AI Style Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to recommend style";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
