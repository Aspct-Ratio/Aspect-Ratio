import type { ChannelDef, FormatDef, FolderLevel } from '@/types/slicer'

// ── Channel / format catalogue ─────────────────────────────────

export const CHANNELS: Record<string, ChannelDef> = {
  social: {
    label: 'Social Media', icon: '📱', cf: 'Social-Media', pc: 't-soc',
    plats: {
      instagram: { label: 'Instagram', pf: 'Instagram', fmts: [
        { id: 'ig-sq',   n: 'Feed Square',    zf: 'Feed-Square',    w: 1080, h: 1080 },
        { id: 'ig-port', n: 'Feed Portrait',  zf: 'Feed-Portrait',  w: 1080, h: 1350 },
        { id: 'ig-story',n: 'Story / Reels',  zf: 'Stories-Reels',  w: 1080, h: 1920 },
        { id: 'ig-car',  n: 'Carousel',       zf: 'Carousel',       w: 1080, h: 1080 },
        { id: 'ig-prof', n: 'Profile',        zf: 'Profile',        w:  320, h:  320 },
      ]},
      tiktok: { label: 'TikTok', pf: 'TikTok', fmts: [
        { id: 'tt-feed', n: 'Feed / Video',   zf: 'Feed',           w: 1080, h: 1920 },
        { id: 'tt-sq',   n: 'Square Post',    zf: 'Square',         w: 1080, h: 1080 },
        { id: 'tt-prof', n: 'Profile',        zf: 'Profile',        w:  200, h:  200 },
      ]},
      facebook: { label: 'Facebook', pf: 'Facebook', fmts: [
        { id: 'fb-feed',  n: 'Feed Image',    zf: 'Feed',           w: 1200, h:  628 },
        { id: 'fb-sq',    n: 'Square Post',   zf: 'Square',         w: 1080, h: 1080 },
        { id: 'fb-story', n: 'Story',         zf: 'Story',          w: 1080, h: 1920 },
        { id: 'fb-cover', n: 'Page Cover',    zf: 'Page-Cover',     w:  820, h:  312 },
        { id: 'fb-event', n: 'Event Cover',   zf: 'Event-Cover',    w: 1920, h: 1005 },
      ]},
      x: { label: 'X (Twitter)', pf: 'X-Twitter', fmts: [
        { id: 'x-post', n: 'Post / Feed',     zf: 'Post',           w: 1600, h:  900 },
        { id: 'x-sq',   n: 'Square Post',     zf: 'Square',         w: 1200, h: 1200 },
        { id: 'x-hdr',  n: 'Profile Header',  zf: 'Header',         w: 1500, h:  500 },
        { id: 'x-prof', n: 'Profile',         zf: 'Profile',        w:  400, h:  400 },
      ]},
      snapchat: { label: 'Snapchat', pf: 'Snapchat', fmts: [
        { id: 'snap-ad',     n: 'Snap Ad',    zf: 'Snap-Ad',        w: 1080, h: 1920 },
        { id: 'snap-story',  n: 'Story',      zf: 'Story',          w: 1080, h: 1920 },
        { id: 'snap-filter', n: 'Geofilter',  zf: 'Geofilter',      w: 1080, h: 2340 },
      ]},
      youtube: { label: 'YouTube', pf: 'YouTube', fmts: [
        { id: 'yt-thumb', n: 'Video Thumbnail', zf: 'Thumbnail',    w: 1280, h:  720 },
        { id: 'yt-ch',    n: 'Channel Art',     zf: 'Channel-Art',  w: 2560, h: 1440 },
        { id: 'yt-prof',  n: 'Profile',         zf: 'Profile',      w:  800, h:  800 },
        { id: 'yt-banm',  n: 'Banner Mobile',   zf: 'Banner-Mobile',w: 1546, h:  423 },
      ]},
      pinterest: { label: 'Pinterest', pf: 'Pinterest', fmts: [
        { id: 'pin-std', n: 'Standard Pin',   zf: 'Standard',       w: 1000, h: 1500 },
        { id: 'pin-sq',  n: 'Square Pin',     zf: 'Square',         w: 1000, h: 1000 },
        { id: 'pin-wd',  n: 'Wide Pin',       zf: 'Wide',           w: 1000, h:  750 },
      ]},
      linkedin: { label: 'LinkedIn', pf: 'LinkedIn', fmts: [
        { id: 'li-post',  n: 'Post Image',    zf: 'Post',           w: 1200, h:  627 },
        { id: 'li-cover', n: 'Company Cover', zf: 'Cover',          w: 1584, h:  396 },
        { id: 'li-prof',  n: 'Profile',       zf: 'Profile',        w:  400, h:  400 },
      ]},
    },
  },

  ecomm: {
    label: 'Ecommerce', icon: '🛍', cf: 'Ecommerce', pc: 't-eco',
    plats: {
      homepage: { label: 'Homepage', pf: 'Homepage', fmts: [
        { id: 'hp-hero-d',  n: 'Hero Desktop',    zf: 'Hero-Desktop',    w: 1920, h:  600 },
        { id: 'hp-hero-m',  n: 'Hero Mobile',     zf: 'Hero-Mobile',     w:  768, h: 1024 },
        { id: 'hp-feat',    n: 'Feature Banner',  zf: 'Feature-Banner',  w: 1440, h:  500 },
        { id: 'hp-tile-p',  n: 'Tile Portrait',   zf: 'Tile-Portrait',   w:  600, h:  800 },
        { id: 'hp-tile-sq', n: 'Tile Square',     zf: 'Tile-Square',     w:  600, h:  600 },
      ]},
      pdp: { label: 'Product Detail (PDP)', pf: 'PDP', fmts: [
        { id: 'pdp-main',  n: 'Main Product Image', zf: 'Main',      w:  800, h:  800 },
        { id: 'pdp-zoom',  n: 'Zoom / Hi-Res',      zf: 'Zoom',      w: 2000, h: 2000 },
        { id: 'pdp-thumb', n: 'Thumbnail',           zf: 'Thumbnail', w:  200, h:  200 },
        { id: 'pdp-life',  n: 'Lifestyle / Alt',     zf: 'Lifestyle', w:  800, h: 1000 },
      ]},
      category: { label: 'Category / PLP', pf: 'Category-PLP', fmts: [
        { id: 'cat-hero',   n: 'Category Hero',   zf: 'Hero',         w: 1920, h:  500 },
        { id: 'cat-banner', n: 'Category Banner', zf: 'Banner',       w: 1440, h:  400 },
        { id: 'cat-tile',   n: 'Product Tile',    zf: 'Product-Tile', w:  400, h:  500 },
      ]},
      email: { label: 'Email / CRM', pf: 'Email-CRM', fmts: [
        { id: 'eml-hdr',  n: 'Email Header',   zf: 'Header',        w:  600, h:  200 },
        { id: 'eml-hero', n: 'Email Hero',     zf: 'Hero',          w:  600, h:  350 },
        { id: 'eml-prod', n: 'Product Block',  zf: 'Product-Block', w:  200, h:  250 },
        { id: 'eml-ftr',  n: 'Footer',         zf: 'Footer',        w:  600, h:  100 },
      ]},
    },
  },

  paid: {
    label: 'Paid Media / Display', icon: '📢', cf: 'Paid-Media', pc: 't-pai',
    plats: {
      iab_d: { label: 'IAB Display — Desktop', pf: 'IAB-Desktop', fmts: [
        { id: 'iab-leader', n: 'Leaderboard',       zf: 'Leaderboard-728x90',    w:  728, h:  90 },
        { id: 'iab-mrec',   n: 'Med. Rectangle',    zf: 'MREC-300x250',          w:  300, h: 250 },
        { id: 'iab-half',   n: 'Half Page',         zf: 'Half-Page-300x600',     w:  300, h: 600 },
        { id: 'iab-sky',    n: 'Wide Skyscraper',   zf: 'Skyscraper-160x600',    w:  160, h: 600 },
        { id: 'iab-bill',   n: 'Billboard',         zf: 'Billboard-970x250',     w:  970, h: 250 },
        { id: 'iab-super',  n: 'Super Leaderboard', zf: 'Super-970x90',          w:  970, h:  90 },
      ]},
      iab_m: { label: 'IAB Display — Mobile', pf: 'IAB-Mobile', fmts: [
        { id: 'mob-ban', n: 'Mobile Banner',   zf: 'Banner-320x50',         w:  320, h:  50 },
        { id: 'mob-int', n: 'Interstitial',    zf: 'Interstitial-320x480',  w:  320, h: 480 },
        { id: 'mob-mrec',n: 'Mobile MREC',     zf: 'Mobile-MREC-300x250',   w:  300, h: 250 },
      ]},
      google: { label: 'Google / DV360', pf: 'Google-Ads', fmts: [
        { id: 'goog-resp', n: 'Responsive (4:5)',       zf: 'Responsive-4x5',    w:  960, h: 1200 },
        { id: 'goog-disc', n: 'Discovery (4:3)',        zf: 'Discovery-4x3',     w: 1200, h:  900 },
        { id: 'goog-ytc',  n: 'YouTube Companion',     zf: 'YouTube-Companion', w:  300, h:   60 },
      ]},
    },
  },

  retail: {
    label: 'Retail / OOH / Doors', icon: '🏪', cf: 'Retail-OOH', pc: 't-ret',
    plats: {
      instore: { label: 'In-Store Print', pf: 'In-Store', fmts: [
        { id: 'rs-door',  n: 'Door Sign 24"×36"',      zf: 'Door-Sign-24x36',    w: 2400, h: 3600 },
        { id: 'rs-win',   n: 'Window Cling 18"×24"',   zf: 'Window-18x24',       w: 1800, h: 2400 },
        { id: 'rs-floor', n: 'Floor Stand 24"×72"',    zf: 'Floor-Stand-24x72',  w: 2400, h: 7200 },
        { id: 'rs-post',  n: 'Poster 18"×24"',         zf: 'Poster-18x24',       w: 1800, h: 2400 },
        { id: 'rs-shelf', n: 'Shelf Talker 4"×6"',     zf: 'Shelf-Talker-4x6',   w:  400, h:  600 },
      ]},
      digital: { label: 'Digital Signage', pf: 'Digital-Signage', fmts: [
        { id: 'ds-land', n: 'Landscape 16:9',   zf: 'Landscape-1920x1080', w: 1920, h: 1080 },
        { id: 'ds-port', n: 'Portrait 9:16',    zf: 'Portrait-1080x1920',  w: 1080, h: 1920 },
        { id: 'ds-sq',   n: 'Square',           zf: 'Square-1080x1080',    w: 1080, h: 1080 },
        { id: 'ds-uw',   n: 'Ultra-Wide 32:9',  zf: 'Ultra-Wide-3840x1080',w: 3840, h: 1080 },
      ]},
      ooh: { label: 'Out-of-Home (OOH)', pf: 'OOH', fmts: [
        { id: 'ooh-bill', n: 'Billboard',      zf: 'Billboard',   w: 3840, h: 1680 },
        { id: 'ooh-bus',  n: 'Bus Shelter',    zf: 'Bus-Shelter', w: 1535, h: 2050 },
        { id: 'ooh-sub',  n: 'Subway Station', zf: 'Subway-Card', w: 2200, h: 1400 },
      ]},
    },
  },
}

// ── Default selected format IDs ────────────────────────────────

export const DEFAULT_SELECTED = new Set([
  'ig-sq', 'ig-story', 'fb-feed', 'tt-feed',
  'yt-thumb', 'hp-hero-d', 'pdp-main', 'iab-mrec',
])

// ── Default folder levels ──────────────────────────────────────

export const DEFAULT_FOLDER_LEVELS: FolderLevel[] = [
  { id: 'fl-channel',  label: 'Channel',  exampleDefault: 'Social-Media', key: 'cf',  enabled: true, customName: '' },
  { id: 'fl-platform', label: 'Platform', exampleDefault: 'Instagram',    key: 'pf',  enabled: true, customName: '' },
  { id: 'fl-format',   label: 'Format',   exampleDefault: 'Feed-Square',  key: 'zf',  enabled: true, customName: '' },
]

// ── Helpers ────────────────────────────────────────────────────

/** All built-in formats, enriched with channel/platform metadata */
export function getAllFormats(custom: FormatDef[] = []): FormatDef[] {
  const out: FormatDef[] = []
  for (const [ck, ch] of Object.entries(CHANNELS)) {
    for (const [, pl] of Object.entries(ch.plats)) {
      for (const fmt of pl.fmts) {
        out.push({ ...fmt, ck, cl: ch.label, cf: ch.cf, pc: ch.pc, pl: pl.label, pf: pl.pf })
      }
    }
  }
  for (const f of custom) {
    out.push({ ...f, ck: 'cust', cl: 'Custom', cf: 'Custom', pc: 't-soc', pl: f.platform, pf: f.platform })
  }
  return out
}

export function getFormatById(id: string, custom: FormatDef[] = []): FormatDef | undefined {
  return getAllFormats(custom).find(f => f.id === id)
}

export function getSelectedFormats(selected: Set<string>, custom: FormatDef[] = []): FormatDef[] {
  return getAllFormats(custom).filter(f => selected.has(f.id))
}
