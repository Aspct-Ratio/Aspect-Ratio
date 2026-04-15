# How to restore to pre-text-overlay state

If the text overlay feature gets too complicated, restore from these backups:

```bash
# From project root:
cp backups/pre-text-overlay/components/slicer/*.tsx components/slicer/
cp backups/pre-text-overlay/types/slicer.ts types/slicer.ts
cp backups/pre-text-overlay/lib/formats.ts lib/formats.ts
cp backups/pre-text-overlay/app/app/page.tsx app/app/page.tsx
```

Then: `git add . && git commit -m "Revert: restore pre-text-overlay state" && git push`

Backed up on: April 15, 2026
