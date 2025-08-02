/**
 * AI prompts for video to learning app generation
 */

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

Provide the result as a JSON object containing a single field called "spec", whose value is the spec for the web app.`

export const CODE_REGION_OPENER = "```"
export const CODE_REGION_CLOSER = "```"

export const SPEC_ADDENDUM = `

IMPORTANT IMPLEMENTATION REQUIREMENTS:

1. **Modern shadcn/ui Design System**: Use a clean, modern design inspired by shadcn/ui with:
   - Clean typography (Inter or similar font)
   - Subtle shadows and rounded corners
   - Neutral color palette (slate/gray tones)
   - Proper spacing and padding
   - Modern button styles with hover effects

2. **Component Styling**: Style components to match shadcn/ui patterns:
   - Cards with subtle borders and shadows
   - Buttons with proper hover and active states
   - Form inputs with focus rings
   - Clean, minimal icons (use Unicode symbols or simple SVG)
   - Consistent spacing using 4px grid system

3. **Color Scheme**: Use a professional color palette:
   - Background: #ffffff or #f8fafc
   - Text: #0f172a (primary), #64748b (secondary)
   - Borders: #e2e8f0
   - Primary: #3b82f6 (blue)
   - Success: #10b981 (green)
   - Warning: #f59e0b (amber)

4. **Interactive Elements**: Include engaging components:
   - Buttons with smooth transitions
   - Cards with hover effects
   - Progress indicators
   - Form elements with validation
   - Tabs or accordion sections

5. **Responsive Design**: Ensure the app works on all devices with:
   - Mobile-first approach
   - Flexible layouts using CSS Grid/Flexbox
   - Proper touch targets (44px minimum)
   - Readable typography at all sizes

The app must be fully responsive and function properly on both desktop and mobile. Provide the code as a single, self-contained HTML document. All styles and scripts must be inline. In the result, encase the code between "${CODE_REGION_OPENER}" and "${CODE_REGION_CLOSER}" for easy parsing.`
