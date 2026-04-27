import { type NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const MAX_FORMATS = 100
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const limiter = rateLimit({ windowMs: 60_000, max: 30 })

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = limiter.check(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Auth guard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const formatsRaw = formData.get('formats') as string | null
    const quality = parseInt(formData.get('quality') as string ?? '90', 10)
    const outputFormat = (formData.get('outputFormat') as string | null) ?? 'jpeg'

    if (!file || !formatsRaw) {
      return NextResponse.json({ error: 'Missing file or formats' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 })
    }

    // Parse formats: [{id, w, h, cropX, cropY, cropW, cropH}]
    const formats: Array<{
      id: string
      w: number
      h: number
      cropX: number
      cropY: number
      cropW: number
      cropH: number
    }> = JSON.parse(formatsRaw)

    if (formats.length > MAX_FORMATS) {
      return NextResponse.json({ error: `Too many formats (max ${MAX_FORMATS})` }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const results: Array<{ id: string; data: string; mimeType: string }> = []

    const mime =
      outputFormat === 'png' ? 'image/png' :
      outputFormat === 'webp' ? 'image/webp' : 'image/jpeg'

    for (const fmt of formats) {
      const cropX = Math.round(fmt.cropX)
      const cropY = Math.round(fmt.cropY)
      const cropW = Math.round(fmt.cropW)
      const cropH = Math.round(fmt.cropH)

      let pipeline = sharp(buffer)
        .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
        .resize(fmt.w, fmt.h, { fit: 'fill' })

      if (outputFormat === 'png') {
        pipeline = pipeline.png({ compressionLevel: 9 })
      } else if (outputFormat === 'webp') {
        pipeline = pipeline.webp({ quality })
      } else {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true })
      }

      const data = await pipeline.toBuffer()
      results.push({
        id: fmt.id,
        data: data.toString('base64'),
        mimeType: mime,
      })
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error('[/api/process]', err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

// ── GET: health check ──────────────────────────────────────────
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
