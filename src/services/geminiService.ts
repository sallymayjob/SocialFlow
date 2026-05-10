import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type SocialPlatform = 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'reddit' | 'substack';
export type ContentTone = 'professional' | 'engaging' | 'minimalist' | 'bold';

interface ArrangementOptions {
  platform: SocialPlatform;
  tone: ContentTone;
  includeHashtags: boolean;
  useEmojis: boolean;
}

export async function arrangePost(text: string, options: ArrangementOptions) {
  const { platform, tone, includeHashtags, useEmojis } = options;

  const platformSpecs: Record<SocialPlatform, string> = {
    linkedin: "Professional, industry-focused, value-driven. Use a hook at the start. Maximize readability with bullet points if applicable.",
    twitter: "Concise, punchy, under 280 characters. Focus on a single clear message or 'hook'. If too long, suggest a thread structure.",
    instagram: "Aesthetic, visual-first storytelling. Use line breaks for clean captions. Focus on community engagement.",
    facebook: "Friendly, community-oriented, slightly longer but engaging. Good for stories and personal updates.",
    tiktok: "Short, extremely engaging, trend-focused text. Use hooks that grab attention in the first 2 seconds. Use trending slang if appropriate.",
    pinterest: "Descriptive, keyword-rich, aesthetic. Focus on helpfulness, DIY, or 'how-to' vibes. Use clear value propositions.",
    reddit: "Authentic, community-specific, often longer and detailed. Avoid sounding corporate. Focus on providing real value or starting a discussion.",
    substack: "Editorial, thoughtful, and high-value. Focus on building curiosity for a newsletter. Use 'Subscribe' hooks and structured paragraphs."
  };

  const toneSpecs: Record<ContentTone, string> = {
    professional: "Polished, authoritative, and corporate yet accessible.",
    engaging: "Conversational, use questions, encourage comments.",
    minimalist: "Direct, very few words, high impact.",
    bold: "Provocative, energetic, high urgency."
  };

  const prompt = `
    You are an expert Social Media Manager and Content Optimizer.
    I will provide you with raw text for a social media post.
    Your task is to RE-ARRANGE and OPTIMIZE this text for ${platform.toUpperCase()}.

    PLATFORM GUIDELINES:
    ${platformSpecs[platform]}

    TONE:
    ${toneSpecs[tone]}

    CONSTRAINTS:
    - Include hashtags: ${includeHashtags ? 'Yes' : 'No'}
    - Use emojis: ${useEmojis ? 'Yes (tastefully)' : 'No'}
    - Output ONLY the arranged post content. No introductory or concluding remarks.
    - If for Twitter/X and the content is significantly over 280 chars, provide the first tweet and indicate it's the start of a thread.

    SEO & INDEXING GUIDELINES (CRITICAL):
    1. Use the first 10 to 12 words to specifically describe the service or primary value.
    2. Avoid keyword stuffing. Use named entities (specific brand names, locations, concepts) instead.
    3. Include the company or brand name naturally in the post.
    4. ${includeHashtags ? 'Use relevant hashtags' : 'Do NOT use hashtags (for cleaner indexing)'}.
    5. Minimize outgoing links where possible.
    6. If links are necessary, prioritize cross-linking to other social media platforms or unique content.
    7. Ensure the content is unique and avoid duplicating text from previous posts.

    RAW TEXT:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Could not generate content.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to arrange post. Please check your connection.");
  }
}

export async function generateEngagementComments(postText: string, platform: SocialPlatform) {
  const prompt = `
    Based on the following social media post for ${platform.toUpperCase()}, generate 5 diverse and engaging comments that could be used as the "first 5 comments" to boost engagement.
    
    The comments should:
    1. Vary in tone (one inquisitive, one supportive, one conversational, one insightful, one enthusiast).
    2. Be short and natural-sounding.
    3. Encourage further discussion.
    4. Include emojis where appropriate.
    5. Be formatted as a numbered list from 1 to 5.

    POST CONTENT:
    "${postText}"
    
    Output ONLY the 5 comments.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Could not generate comments.";
  } catch (error) {
    console.error("Gemini Engagement Comments Error:", error);
    return "Failed to generate engagement comments.";
  }
}

export async function generateImagePrompt(postText: string) {
  const prompt = `
    Create a highly descriptive and artistic image generation prompt for a social media visual that fits this post.
    The prompt should be suitable for DALL-E 3 or Midjourney.
    
    POST CONTENT:
    "${postText}"
    
    Output ONLY a JSON object with:
    {
      "prompt": "the detailed image prompt",
      "style": "photorealistic | illustration | 3d-render | abstract",
      "visualDescription": "a short 1-sentence summary of what the image shows"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text || "{}";
    // Clean up potential markdown code blocks
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Image Prompt Error:", error);
    return {
      prompt: "A minimalist workspace with professional lighting, representing digital strategy.",
      style: "photorealistic",
      visualDescription: "A professional workspace setup."
    };
  }
}
