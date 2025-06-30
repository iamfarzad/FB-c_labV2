/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CODE_REGION_CLOSER,
  CODE_REGION_OPENER,
  SPEC_ADDENDUM,
} from './constants'

export const SPEC_FROM_VIDEO_PROMPT = `You are a pedagogist and product designer with deep expertise in crafting engaging learning experiences via interactive web apps.

Examine the contents of the attached video. Then, write a detailed and carefully considered spec for an interactive web app designed to complement the video and reinforce its key idea or ideas. The recipient of the spec does not have access to the video, so the spec must be thorough and self-contained (the spec must not mention that it is based on a video). Here is an example of a spec written in response to a video about functional harmony:

"In music, chords create expectations of movement toward certain other chords and resolution towards a tonal center. This is called functional harmony.

Build me an interactive web app to help a learner understand the concept of functional harmony.

SPECIFICATIONS:
1. The app must feature an interactive keyboard.
2. The app must showcase all 7 diatonic triads that can be created in a major key (i.e., tonic, supertonic, mediant, subdominant, dominant, submediant, leading chord).
3. The app must somehow describe the function of each of the diatonic triads, and state which other chords each triad tends to lead to.
4. The app must provide a way for users to play different chords in sequence and see the results.
[etc.]"

The goal of the app that is to be built based on the spec is to enhance understanding through simple and playful design. The provided spec should not be overly complex, i.e., a junior web developer should be able to implement it in a single html file (with all styles and scripts inline). Most importantly, the spec must clearly outline the core mechanics of the app, and those mechanics must be highly effective in reinforcing the given video's key idea(s).

Provide the result as a JSON object containing a single field called "spec", whose value is the spec for the web app.`;

export interface VideoToAppOptions {
  videoUrl: string;
  preSeededSpec?: string;
  preSeededCode?: string;
}

export interface VideoToAppResult {
  spec: string;
  code: string;
  videoUrl: string;
  title?: string;
}

/**
 * Parse HTML content from AI response
 */
export function parseHTML(response: string, opener: string, closer: string): string {
  const startIndex = response.indexOf(opener);
  if (startIndex === -1) return response;
  
  const endIndex = response.indexOf(closer, startIndex + opener.length);
  if (endIndex === -1) return response;
  
  return response.substring(startIndex + opener.length, endIndex).trim();
}

/**
 * Parse JSON content from AI response
 */
export function parseJSON(response: string): any {
  try {
    // Try to find JSON in code blocks first
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                     response.match(/```\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Try to find JSON object directly
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    
    // Fallback: try to parse the entire response
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return { spec: response };
  }
}

/**
 * Generate learning app spec from video
 */
export async function generateSpecFromVideo(videoUrl: string): Promise<string> {
      const response = await fetch('/api/ai?action=generateVideoSpec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoUrl,
      prompt: SPEC_FROM_VIDEO_PROMPT,
      modelName: 'gemini-2.5-flash'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to generate spec: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate spec');
  }

  let spec = parseJSON(result.data.text).spec;
  spec += SPEC_ADDENDUM;
  
  return spec;
}

/**
 * Generate HTML code from spec
 */
export async function generateCodeFromSpec(spec: string): Promise<string> {
      const response = await fetch('/api/ai?action=generateCodeFromSpec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: spec,
      modelName: 'gemini-2.5-flash'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to generate code: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to generate code');
  }

  const code = parseHTML(result.data.text, CODE_REGION_OPENER, CODE_REGION_CLOSER);
  return code;
}

/**
 * Complete video-to-app generation process
 */
export async function generateVideoToApp(options: VideoToAppOptions): Promise<VideoToAppResult> {
  const { videoUrl, preSeededSpec, preSeededCode } = options;

  // If we have pre-seeded content, return it
  if (preSeededSpec && preSeededCode) {
    return {
      spec: preSeededSpec,
      code: preSeededCode,
      videoUrl
    };
  }

  // Generate spec from video
  const spec = await generateSpecFromVideo(videoUrl);
  
  // Generate code from spec
  const code = await generateCodeFromSpec(spec);

  return {
    spec,
    code,
    videoUrl
  };
} 