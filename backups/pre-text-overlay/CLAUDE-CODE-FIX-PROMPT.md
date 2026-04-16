# Claude Code Prompt — Fix Text Editor Bugs

Paste everything below the line into Claude Code:

---

There are several bugs in the text overlay editor (Step 4 — Add Copy). Fix all of them. The key files are `components/slicer/TextEditor.tsx`, `lib/crop.ts`, and `components/slicer/Step4Copy.tsx`.

## Bug 1: Background image doesn't fill the canvas in the editor modal

**Problem:** When you click "Edit" on a format card, the cropped image only covers part of the Fabric.js canvas. It should fill the entire canvas.

**Root cause:** In `TextEditor.tsx` around line 234-239, the background image is created from a `renderToCanvas` offscreen canvas (which is at full output resolution, e.g. 1080×1080), then set as `canvas.backgroundImage`. But the Fabric.js canvas is using `setZoom(scale)` where `scale = dw / fmt.w` (display pixels / output pixels). The background `FabricImage` is at full resolution but needs to be scaled to match the Fabric.js zoom level, OR the canvas dimensions need to be set properly.

**Fix:** After creating the FabricImage from the data URL, scale it so it fits the Fabric.js canvas coordinate system. Since the Fabric canvas is zoomed (internal coords are in output pixels), the background image width/height should match `fmt.w` × `fmt.h`. Set:
```typescript
bgImg.set({
  selectable: false,
  evented: false,
  hoverCursor: 'default',
  scaleX: fmt.w / bgImg.width!,
  scaleY: fmt.h / bgImg.height!,
})
```
This ensures the background image fills the full canvas area in Fabric's coordinate space.

Also, the Fabric canvas needs its internal dimensions set to the full output size, with zoom applied for display. After `new Canvas(...)`, set:
```typescript
canvas.setDimensions({ width: dw, height: dh })  // display size in CSS pixels
canvas.setZoom(scale)                              // zoom factor
```
And make sure the `<canvas>` element in the JSX does NOT set explicit width/height attributes — let Fabric control it. Currently the canvas element is:
```html
<canvas ref={canvasElRef} style={{ display: ready ? 'block' : 'none', border: '1px solid #e5e7eb', borderRadius: 8 }} />
```
That's correct — no width/height on the element itself. But double check that the Canvas constructor isn't conflicting. In Fabric v7, the constructor `new Canvas(el, { width, height })` sets the internal width/height (the coordinate space). We want the coordinate space to be `fmt.w × fmt.h` (full output resolution) and the display to be `dw × dh`. So:
```typescript
const canvas = new Canvas(canvasElRef.current!, {
  width: fmt.w,
  height: fmt.h,
  selection: true,
})
canvas.setZoom(scale)
// Fabric v7: the CSS dimensions need to be set explicitly after zoom
canvas.setDimensions({ width: dw, height: dh }, { cssOnly: true })
```
Then the background image should be set at 1:1 scale since the canvas coords now match the output size:
```typescript
bgImg.set({
  selectable: false,
  evented: false,
  hoverCursor: 'default',
  scaleX: fmt.w / bgImg.width!,
  scaleY: fmt.h / bgImg.height!,
})
```

## Bug 2: Text objects are not clickable, draggable, or editable

**Problem:** After adding a text preset (Headline, Subheader, etc.), you cannot click to select, drag to move, or double-click to edit the text. The text just sits there unresponsive.

**Likely root causes (check all of these):**

1. **Zoom/coordinate mismatch:** If the canvas zoom is wrong, Fabric's hit detection doesn't line up with where the text visually appears. The fix in Bug 1 (setting canvas coords to full output size and using proper zoom) should fix this too — when Fabric knows the true coordinate space and zoom factor, mouse events translate correctly.

2. **Canvas CSS dimensions vs internal dimensions mismatch:** Fabric v7 needs both the internal dimensions (coordinate space) and CSS dimensions (display size) to be set. If only one is set, click targets will be offset. Make sure both are set as shown in Bug 1.

3. **Background image blocking events:** The `bgImg` is set with `evented: false` which is correct, but double-check that it's set as `canvas.backgroundImage` (a special Fabric property) and NOT added via `canvas.add(bgImg)`. If it's added as a regular object, it would sit on top and intercept all clicks. Currently the code does `canvas.backgroundImage = bgImg` which is correct.

4. **Text object configuration:** Make sure textbox objects have these properties when created in `addPreset()`:
```typescript
{
  selectable: true,
  evented: true,
  editable: true,
  hasControls: true,
  hasBorders: true,
  lockUniScaling: false,
}
```

5. **Canvas `selection` option:** Verify `selection: true` is passed to the Canvas constructor (it already is, but confirm it's not being overridden).

After making the zoom/dimension fixes, test that: clicking a text object selects it (blue bounding box appears), dragging moves it, and double-clicking enters edit mode (cursor appears inside text).

## Bug 3: Background box (bgRect) shows in card preview but not in the editor

**Problem:** When a CTA preset is added, the small card preview in Step4Copy shows an orange/indigo rectangle behind the text, but in the TextEditor modal the rectangle is not visible.

**Root cause:** The `bgRect` data is stored on `textbox.data.bgRect` as metadata, but Fabric.js doesn't know how to render it — it's just a custom data property. The card preview works because it uses `renderToCanvasWithText()` in `lib/crop.ts` which manually draws the bgRect using Canvas 2D API. But in the Fabric.js editor canvas, nothing draws it.

**Fix:** Implement bgRect rendering in the Fabric.js canvas by using an actual `Rect` object behind each textbox that has a bgRect. When a textbox has `data.bgRect`:

Option A (recommended): Use Fabric's `textbox.set('backgroundColor', bgFill)` with padding. Fabric v7 Textbox supports `backgroundColor` and `padding` properties natively. Set:
```typescript
if (bgRect) {
  tb.set({
    backgroundColor: bgRect.fill,
    padding: bgRect.padding,
    // For rounded corners, we'll need a custom approach (see below)
  })
}
```
Note: Fabric's built-in `backgroundColor` doesn't support border radius. If rounded corners are needed, use a custom `clipPath` or override the render method. For now, using `backgroundColor` + `padding` gets 90% of the way there and is much simpler.

Apply this in both places:
- `addPreset()` function — when creating new textboxes with bgRect presets
- The layer restore loop in `init()` — when loading saved layers that have bgRect

Also update `readSel()` to read the backgroundColor/padding from the object, and `updateObj()` / `setBgRect()` to set backgroundColor/padding when toggling the background box in the sidebar.

When bgRect is toggled ON in the sidebar (`setBgRect` function), set:
```typescript
obj.set({
  backgroundColor: bgFill,
  padding: bgPadding,
})
obj.data = { ...obj.data, bgRect: { fill: bgFill, padding: bgPadding, rx: bgRx } }
```
When toggled OFF:
```typescript
obj.set({
  backgroundColor: '',
  padding: 0,
})
obj.data = { ...obj.data, bgRect: null }
```

Make sure `canvas.requestRenderAll()` is called after these changes.

## Bug 4: Background box doesn't align with text in the card preview

**Problem:** In the small card preview thumbnails, the orange/indigo background box doesn't line up properly with the text — it's offset or sized wrong.

**Root cause:** In `lib/crop.ts` `renderToCanvasWithText()`, the bgRect position calculation doesn't account for `textAlign`. When text is center-aligned, the bgRect's x position is calculated from `layer.left`, but the text is drawn from a centered x position (`layer.left + effectiveWidth / 2`). The rect should be centered on the text, not anchored to `layer.left`.

**Fix:** In `renderToCanvasWithText()`, update the bgRect drawing section (around line 171-183). The bgRect x position should use the same alignment logic as the text:
```typescript
if (layer.bgRect?.fill) {
  const totalH = lines.length * lineH
  const maxLineW = Math.max(...lines.map(l => ctx.measureText(l).width))
  const { padding, rx, fill: bgFill } = layer.bgRect
  
  // Calculate bgRect x based on text alignment
  let bgX: number
  if (layer.textAlign === 'center') {
    bgX = layer.left + effectiveWidth / 2 - maxLineW / 2 - padding
  } else if (layer.textAlign === 'right') {
    bgX = layer.left + effectiveWidth - maxLineW - padding
  } else {
    bgX = layer.left - padding
  }
  
  ctx.save()
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0
  ctx.fillStyle = bgFill
  _roundRect(ctx, bgX, layer.top - padding,
             maxLineW + padding * 2, totalH + padding * 2, rx)
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = layer.fill
}
```

## Bug 5: Not enough font weight options

**Problem:** The weight dropdown only has 6 options (300, 400, 500, 600, 700, 900). Users need more granular control.

**Fix:** In `TextEditor.tsx`, expand `WEIGHT_OPTIONS` to include all standard CSS weights:
```typescript
const WEIGHT_OPTIONS = [
  { value: 100, label: 'Thin 100' },
  { value: 200, label: 'Extra Light 200' },
  { value: 300, label: 'Light 300' },
  { value: 400, label: 'Regular 400' },
  { value: 500, label: 'Medium 500' },
  { value: 600, label: 'Semibold 600' },
  { value: 700, label: 'Bold 700' },
  { value: 800, label: 'Extra Bold 800' },
  { value: 900, label: 'Black 900' },
]
```

Also update the Google Fonts CSS URL in `loadGoogleFont()` to request all weights:
```typescript
link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@100;200;300;400;500;600;700;800;900&display=swap`
```

## Bug 6 (bonus fix): Fabric.js double-init error

**Already fixed** in `TextEditor.tsx` — the useEffect now uses a `disposed` flag and cleans up via `fabricRef.current` instead of the stale `canvas` closure variable. Verify this fix is still in place (check for `let disposed = false` at the top of the useEffect). Do not revert this.

## Summary of files to change

1. **`components/slicer/TextEditor.tsx`**:
   - Fix Canvas constructor to use `fmt.w`/`fmt.h` as internal dimensions, `dw`/`dh` as CSS-only dimensions, with proper zoom
   - Fix background image scaling to fill canvas
   - Add `selectable: true, evented: true, editable: true, hasControls: true, hasBorders: true` to textbox creation in both `addPreset()` and the layer restore loop
   - Implement bgRect using Fabric's `backgroundColor` + `padding` properties (in addPreset, layer restore, setBgRect, readSel)
   - Expand WEIGHT_OPTIONS to all 9 standard CSS weights (100–900)
   - Update Google Font loader to request weights 100–900
   - Keep the `disposed` flag fix that's already in place

2. **`lib/crop.ts`**:
   - Fix bgRect alignment in `renderToCanvasWithText()` to account for textAlign

After all changes: first delete the git lock file if it exists (`rm -f .git/index.lock`), then `git add . && git commit -m "fix: text editor - image display, interactivity, bgRect rendering, font weights" && git push`
