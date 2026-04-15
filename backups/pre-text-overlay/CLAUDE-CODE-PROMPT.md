# Claude Code Prompt — Add Text Overlay Step (Phase 1)

Paste everything below the line into Claude Code:

---

Add a new "Add Copy" step to the slicer app between the existing Adjust Crops step and the Export step. This lets users add text overlays (headlines, subheaders, eyebrows, CTAs) to their cropped assets before exporting. The text gets composited onto the final exported images.

IMPORTANT: A full backup exists at `backups/pre-text-overlay/` with restore instructions. If this gets too complex, we can revert.

## Architecture overview

Current flow: Upload (Step1) → Formats (Step2) → Adjust Crops (Step3) → Export (Step4)
New flow: Upload (Step1) → Formats (Step2) → Adjust Crops (Step3) → **Add Copy (Step4)** → Export (Step5)

Use the Fabric.js library for the interactive text editor canvas. Install it: `npm install fabric`

## Files to create

### 1. `components/slicer/Step4Copy.tsx` — The main step component

This is the new step. Structure:

**Layout:**
- Header: "ADD COPY TO YOUR ASSETS" with subtitle "Add headlines, subheaders, and CTAs to your assets. This step is optional."
- A "Skip — export without copy" button prominently in the header area (this step must be easily skippable)
- Below header: a grid of format cards (similar to Step3Adjust's crop grid) showing each selected format for the active file
- Each card shows a small static preview of the cropped image with any text layers rendered on top
- Each card has an "Edit" button and an "Expand" button (like CropCard's expand)
- File switcher at top (same pattern as Step3Adjust) when multiple files are uploaded

**Card grid:**
- Group cards by channel (Social Media, Ecommerce, etc.) same as Step3Adjust does
- Each card shows: format name, dimensions, platform tag, small preview with text overlaid, "Edit" button
- Cards that have text layers show a small "Aa" badge indicator
- Cards without text show a subtle "+ Add text" overlay on hover

**"Apply to..." system:**
- After editing text on one format card, show a popover/dropdown button: "Apply to..."
- Options in the dropdown:
  - "All formats" — copies text layers to every selected format
  - "All vertical formats" — copies to formats where h > w
  - "All horizontal formats" — copies to formats where w >= h
  - "Social Media only" — copies to formats with ck === 'social'
  - "Ecommerce only" — copies to formats with ck === 'ecomm'
  - "Paid Media only" — copies to formats with ck === 'paid'
  - "Retail / OOH only" — copies to formats with ck === 'retail'
- When applying, scale font sizes proportionally to the target canvas size relative to the source canvas size. Maintain relative positioning (percentage-based from edges). If the source format was 1080x1080 and text was at position (540, 800) that's (50%, 74%) — place it at the same percentages on the target format.

**Navigation:**
- Back button → goes to Step 3 (Adjust Crops)
- "Continue to Export" button → goes to Step 5
- "Skip — export without copy" → goes directly to Step 5

### 2. `components/slicer/TextEditor.tsx` — The expanded text editor modal

Opens when user clicks "Edit" or "Expand" on a format card. This is a modal similar to `CropCard`'s `CropModal`.

**Layout:**
- Full modal overlay (same backdrop style as CropModal: `bg-black/60 backdrop-blur-sm`)
- Header: format name, dimensions, platform label, close (X) button
- Center: Fabric.js canvas showing the cropped image as background with interactive text objects on top
- Right sidebar or bottom toolbar: text editing controls
- Footer: "Done" button to close, "Apply to..." button

**Fabric.js canvas setup:**
- Background: render the cropped image using the same crop state from Step3 (read from `state.crops[fileId][formatId]`). Use `renderToCanvas()` from `lib/crop.ts` to get the cropped image, then set it as the Fabric.js canvas background.
- Canvas dimensions: use the actual format dimensions (fmt.w × fmt.h) but scale down to fit the modal (max ~600px wide, ~500px tall) using Fabric.js zoom. Store the scale factor so text sizes are in real output pixels.
- All text objects are Fabric.js `fabric.IText` or `fabric.Textbox` objects — they're draggable, resizable, and editable by default.

**Text controls toolbar:**
- "Add Text" button with presets dropdown:
  - "Headline" — creates a textbox with 72px bold font, white, centered
  - "Subheader" — 36px semibold, white, centered
  - "Eyebrow" — 18px uppercase, letter-spacing 2px, white
  - "Body" — 24px regular, white
  - "CTA" — 28px bold, white, with a colored background rectangle behind it
- Font family picker: dropdown with common web-safe fonts (Arial, Helvetica, Georgia, Times New Roman, Courier New, Impact, Verdana) plus Google Fonts loaded via `@fontsource` or the Google Fonts CSS API. Include at least: Inter, Montserrat, Playfair Display, Oswald, Roboto, Bebas Neue, Poppins, Raleway, Open Sans, Lato
- "Import Font" button: file input that accepts .ttf, .woff, .woff2 files. Load via FontFace API: `new FontFace('CustomFont', arrayBuffer)` → `document.fonts.add()` → then it's available in the font picker dropdown
- Font size: number input with +/- buttons (range 8–200px)
- Font weight: dropdown (Light 300, Regular 400, Medium 500, Semibold 600, Bold 700, Black 900)
- Text color: color input picker, plus quick swatches (white, black, and the brand indigo #4F46E5)
- Text alignment: left / center / right buttons
- Letter spacing: number input (-2 to 20)
- Line height: number input (0.8 to 3.0)
- Opacity: slider (0–100%)
- Text shadow: toggle on/off, with color and blur inputs when enabled
- Background box: toggle to add a filled rectangle behind the text (for CTA-style buttons), with padding and corner radius controls and background color picker
- Delete selected: button to remove the currently selected text object
- Layer order: "Bring Forward" / "Send Back" buttons

**Text layer panel (left side or collapsible):**
- List all text objects on the canvas with their content preview (first 20 chars)
- Click to select, drag to reorder
- Eye icon to toggle visibility
- Trash icon to delete

**Zoom/view controls:**
- "50% / 100% / Fit" toggle buttons so users can check text at actual output size
- The Fabric.js canvas zoom handles this naturally

### 3. Update `types/slicer.ts` — Add text layer types

Add these types:

```typescript
export interface TextLayer {
  id: string
  text: string
  fontFamily: string
  fontSize: number          // in output pixels (not display pixels)
  fontWeight: number
  fill: string              // color
  textAlign: 'left' | 'center' | 'right'
  left: number              // x position in output pixels
  top: number               // y position in output pixels
  width: number             // textbox width in output pixels
  scaleX: number
  scaleY: number
  angle: number
  opacity: number           // 0–1
  letterSpacing: number     // Fabric.js charSpacing value
  lineHeight: number
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number } | null
  bgRect?: { fill: string; padding: number; rx: number } | null  // background box
  preset?: 'headline' | 'subheader' | 'eyebrow' | 'body' | 'cta'
}

// textLayers[fileId][formatId] = TextLayer[]
export type TextLayersMap = Record<string, Record<string, TextLayer[]>>
```

Add `textLayers: TextLayersMap` to the `SlicerState` interface.

### 4. Update `components/slicer/SlicerContext.tsx` — Add text layer actions

Add these action types to the Action union:

```typescript
| { type: 'SET_TEXT_LAYERS'; fileId: string; formatId: string; layers: TextLayer[] }
| { type: 'APPLY_TEXT_TO_FORMATS'; fileId: string; sourceFormatId: string; targetFormatIds: string[] }
| { type: 'CLEAR_TEXT_LAYERS'; fileId: string; formatId: string }
```

Add to `initialState`: `textLayers: {}`

Add reducer cases:
- `SET_TEXT_LAYERS`: directly sets the layers array for a specific file+format combo
- `APPLY_TEXT_TO_FORMATS`: reads layers from sourceFormatId, and for each target format, scales/repositions layers proportionally based on the ratio of source format dimensions to target format dimensions. Font sizes scale by `min(targetW/sourceW, targetH/sourceH)`. Positions scale by `targetW/sourceW` for x and `targetH/sourceH` for y.
- `CLEAR_TEXT_LAYERS`: removes all text layers for a file+format
- Make sure `RESET` and `ADD_FILES` initialize textLayers properly (empty objects)

### 5. Update `components/slicer/SlicerApp.tsx` — Add Step 4 and shift Export to Step 5

```typescript
import Step4Copy from './Step4Copy'

type Step = 1 | 2 | 3 | 4 | 5

// In the JSX:
{step === 1 && <Step1Upload onNext={() => setStep(2)} userPlan={userPlan} />}
{step === 2 && <Step2Formats onBack={() => setStep(1)} onNext={() => setStep(3)} />}
{step === 3 && <Step3Adjust onBack={() => setStep(2)} onNext={() => setStep(4)} />}
{step === 4 && <Step4Copy onBack={() => setStep(3)} onNext={() => setStep(5)} onSkip={() => setStep(5)} />}
{step === 5 && <Step4Export onBack={() => setStep(4)} onReset={reset} />}
```

### 6. Update `components/slicer/AppHeader.tsx` — Add step 5

Change the STEPS array:
```typescript
type Step = 1 | 2 | 3 | 4 | 5
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: 'UPLOAD' },
  { n: 2, label: 'FORMATS' },
  { n: 3, label: 'ADJUST' },
  { n: 4, label: 'COPY' },
  { n: 5, label: 'EXPORT' },
]
```

### 7. Update `lib/crop.ts` — Modify `renderToCanvas` to composite text

Add a new function `renderToCanvasWithText` that:
1. Calls the existing `renderToCanvas` to draw the cropped image
2. Then reads `textLayers[fileId][formatId]` from the state passed as a parameter
3. For each text layer, uses the Canvas 2D API to draw the text on top:
   - Set `ctx.font` using the layer's fontWeight, fontSize, and fontFamily
   - Set `ctx.fillStyle` to the layer's fill color
   - Set `ctx.globalAlpha` to the layer's opacity
   - Set `ctx.textAlign` to the layer's textAlign
   - If shadow is defined, set `ctx.shadowColor`, `ctx.shadowBlur`, `ctx.shadowOffsetX`, `ctx.shadowOffsetY`
   - If bgRect is defined, draw a filled rounded rectangle behind the text first
   - Apply rotation via `ctx.save()`, `ctx.translate()`, `ctx.rotate()`, draw, `ctx.restore()`
   - Use `ctx.fillText()` for single lines or handle word wrapping for textbox width
4. Return the canvas

Update `Step4Export.tsx` (now Step 5) to use `renderToCanvasWithText` instead of `renderToCanvas` when text layers exist. Pass the textLayers from state. When no text layers exist for a file+format combo, use the regular `renderToCanvas` (no performance penalty for users who skip the copy step).

### Important implementation notes

- **Fabric.js version**: use `fabric` (v6+). Import as: `import { Canvas, IText, Textbox, Rect } from 'fabric'`
- **Font loading**: when loading Google Fonts, create a `<link>` element in document.head pointing to `https://fonts.googleapis.com/css2?family=FontName:wght@300;400;500;600;700;900&display=swap`. Wait for the font to load before applying.
- **Custom font import**: Use the FontFace API. Store imported font names in component state so they persist in the font picker dropdown for the session.
- **Canvas scaling**: The Fabric.js canvas should work at actual output dimensions internally (e.g., 1080x1080) but display scaled down to fit the modal. Use `canvas.setZoom(displayScale)` and `canvas.setDimensions({ width: scaledW, height: scaledH })` while keeping the internal coordinate system at full resolution. This way, text positions and sizes are stored in real pixels and export correctly without any conversion.
- **Saving layers**: Every time the user makes a change on the Fabric.js canvas (object:modified, text:changed, etc.), serialize all text objects into `TextLayer[]` format and dispatch `SET_TEXT_LAYERS`. This keeps the Redux-style state as the source of truth.
- **Loading layers**: When the modal opens, read `state.textLayers[fileId][formatId]` and recreate the Fabric.js objects from the stored data.
- **Card previews**: The small card previews in the grid should use a regular `<canvas>` element that renders the cropped image + text layers using the Canvas 2D API (not Fabric.js — that's too heavy for thumbnails). Use the same `renderToCanvasWithText` function from lib/crop.ts.
- **Export compositing**: During ZIP export in Step4Export.tsx, after rendering the crop to canvas, draw text layers on top using Canvas 2D before converting to blob. Do NOT use Fabric.js during export — use plain Canvas 2D text rendering for performance.
- **Apply-to proportional scaling**: When applying text from a 1080×1080 source to a 1080×1920 target: fontSize scales by `min(1080/1080, 1920/1080) = 1.0`, left scales by `1080/1080 = 1.0`, top scales by `1920/1080 = 1.78`. For a 1200×628 target: fontSize scales by `min(1200/1080, 628/1080) = 0.58`, positions scale proportionally.

## Style guidelines

- Match the existing app design language: white cards with `border-gray-200`, `rounded-xl`, indigo accent color `#4F46E5`, `text-gray-900` headings, `text-gray-500` descriptions, gray-50 backgrounds
- The modal should match CropModal's visual style (same backdrop, panel style, header layout)
- The "Skip" button should be a ghost/outline style, not hidden — make it obvious this step is optional
- Cards in the grid should match CropCard sizing and style
- Use the same channel tag color classes: `t-soc` indigo, `t-eco` green, `t-pai` amber, `t-ret` red
- Toolbar should feel clean and organized — group related controls, don't dump 20 inputs in a row
- Use the `animate-fade-up` class for step entry animation (same as other steps)

## What NOT to do

- Do NOT modify Step1Upload, Step2Formats, or Step3Adjust
- Do NOT change the format data structure in lib/formats.ts
- Do NOT add any new API routes — all text rendering happens client-side
- Do NOT use Sharp or any server-side processing for text — it's all Canvas 2D
- Do NOT make the step mandatory — users must be able to skip it cleanly

After all changes: `git add . && git commit -m "feat: add text overlay step (Add Copy) between crop and export" && git push`
