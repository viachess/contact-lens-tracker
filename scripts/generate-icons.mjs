import path from 'node:path'
import { promises as fs } from 'node:fs'
import sharp from 'sharp'

async function generateIcons() {
  const sourcePng = path.resolve('public', 'icon-lens.png')
  const outputDir = path.resolve('public', 'icons')

  await fs.mkdir(outputDir, { recursive: true })

  const targets = [
    { size: 192, name: 'icon-192x192.png' },
    { size: 512, name: 'icon-512x512.png' },
    { size: 512, name: 'icon-512x512-maskable.png' }
  ]

  for (const { size, name } of targets) {
    const outputPath = path.join(outputDir, name)
    await sharp(sourcePng)
      .resize(size, size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(outputPath)
  }

  // eslint-disable-next-line no-console
  console.log('Generated icons in', outputDir)
}

generateIcons().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to generate icons:', error)
  process.exit(1)
})
