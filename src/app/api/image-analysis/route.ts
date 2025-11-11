import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';

const prompt = `
Given an image, analyze its visual content and return the following:

1. Description:
- Write 1–3 sentences describing what can be seen in the image directly.
- Avoid meta phrases like “the image shows” or “this picture features.”
- Include key visual details such as color, material, texture, and composition.
- Capture the overall mood or aesthetic naturally (e.g., cozy, vintage, elegant).

2. Keywords:
- Provide 15–40 concise keywords related to the image.
- Include relevant objects, colors, materials, fashion/style terms, moods, and photographic attributes.
- Favor descriptive, searchable terms useful for cataloging, fashion tagging, or creative databases.
- Do not include redundant plural/singular variations unless contextually distinct.
- Use only lowercase single words or short phrases (no sentences).

## Output Format (in JSON):
{ description: string,  keywords: string[] }
`;

const AnalysisResponse = z.object({
  description: z.string(),
  keywords: z.array(z.string()),
});

export async function POST(request: Request) {
  const { imageUrl } = await request.json();

  if (!imageUrl || !imageUrl.startsWith('https://')) {
    return NextResponse.json(
      { error: 'Invalid or non-HTTPS URL' },
      { status: 400 }
    );
  }

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error('Failed to fetch image');

    const buffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get('content-type') || 'image/jpeg';
    const base64Image = Buffer.from(buffer).toString('base64');
    const imageDataUrl = `data:${contentType};base64,${base64Image}`;

    const response = await openai.responses.parse({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            {
              type: 'input_image',
              image_url: imageDataUrl,
              detail: 'auto',
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(AnalysisResponse, 'analysis_response'),
      },
    });

    return NextResponse.json(response.output_parsed);
  } catch (error) {
    console.error('Keyword extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract keywords' },
      { status: 500 }
    );
  }
}
