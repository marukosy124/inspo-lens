import { openai } from '@/lib/openai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';
import { capitalize } from '@/lib/utils';
import { ExtractedColor } from '@/lib/color-extractor';
import { env } from '@/lib/env';

const prompt = `
Given an image and its colors, analyze its visual content and return the following:

1. Description:
- Write 1-3 concise, precise sentence directly describing the main visual content of the image.
- Focus on the primary objects, style, color, and atmosphere.
- Avoid meta phrases like “the image shows” or “this picture features.”
- Be direct and avoid filler detail.

2. Keywords:
- Provide 5-10 concise keywords related to the image.
- Include relevant objects, colors, materials, style terms, moods, and photographic attributes.
- Favor descriptive, searchable terms useful for cataloging, fashion tagging, or creative databases.
- Use only lowercase single words or short phrases (no sentences).
- Do not include redundant plural/singular variations unless contextually distinct.

3. Search term:
- Return a single, short one-line search term summarizing the image, optimized for quick searching.

4. Color names:
- Return the name for each given color.
- If no colors are provided, return up to 5 dominant colors from the image, including their hex codes and names.

## Output Format (in JSON):
{ description: string, keywords: string[], searchTerm: string, colors: [{ hex: string, name: string }] }
`;

const AnalysisResponse = z.object({
  description: z.string(),
  keywords: z.array(z.string()),
  searchTerm: z.string(),
  colors: z.array(z.object({ hex: z.string(), name: z.string() })),
});

function mergeColorsWithNames(
  namedColors: { hex: string; name: string }[],
  extractedColors: ExtractedColor[]
) {
  const nameMap = new Map();
  namedColors.forEach((color) => {
    const hex = color.hex.toLowerCase();
    nameMap.set(hex, capitalize(color.name)); // capitialize the name
  });

  return extractedColors.map((color) => {
    const hexLower = color.hex.toLowerCase();
    const name = nameMap.get(hexLower);

    return {
      ...color,
      name: name || null,
    };
  });
}

export async function POST(request: Request) {
  const { imageUrl, colors } = await request.json();

  if (
    (!imageUrl || !imageUrl.startsWith('https://')) &&
    env.APP_ENV !== 'dev'
  ) {
    return NextResponse.json(
      { error: 'Failed to analyze: Invalid or non-HTTPS URL' },
      { status: 400 }
    );
  }

  try {
    let inputImageUrl = imageUrl;

    // for local, convert to base64 for testing
    if (imageUrl.startsWith('http://')) {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) throw new Error('Failed to fetch image');

      const buffer = await imageResponse.arrayBuffer();
      const contentType =
        imageResponse.headers.get('content-type') || 'image/jpeg';
      const base64Image = Buffer.from(buffer).toString('base64');
      inputImageUrl = `data:${contentType};base64,${base64Image}`;
    }

    const response = await openai.responses.parse({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            {
              type: 'input_text',
              text: `colors: ${colors.map((color: ExtractedColor) => color.hex).join(', ')}`,
            },
            {
              type: 'input_image',
              image_url: inputImageUrl,
              detail: 'auto',
            },
          ],
        },
      ],
      text: {
        format: zodTextFormat(AnalysisResponse, 'analysis_response'),
      },
    });

    const result = response.output_parsed;
    // add color names to original extracted colors array; use AI analyed color if no original colors are given
    if (result?.colors) {
      result.colors =
        colors.length > 0
          ? mergeColorsWithNames(result.colors, colors)
          : result.colors;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Image analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}
