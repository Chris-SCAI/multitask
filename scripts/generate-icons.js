const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
  { name: 'icon-add.png', size: 96 },
  { name: 'icon-list.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
]

function drawSparkle(ctx, x, y, size, color = '#fbbf24') {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = size * 0.08
  ctx.lineCap = 'round'

  // Main 4-point star
  const points = 4
  const outerRadius = size * 0.5
  const innerRadius = size * 0.15

  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / points - Math.PI / 2
    const px = Math.cos(angle) * radius
    const py = Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()

  // Small sparkles around
  const smallSize = size * 0.12
  const offsets = [
    { x: -size * 0.4, y: -size * 0.3 },
    { x: size * 0.35, y: size * 0.4 },
  ]

  offsets.forEach(offset => {
    ctx.beginPath()
    ctx.arc(offset.x, offset.y, smallSize, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.restore()
}

function generateIcon(size, maskable = false) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background gradient - violet to magenta (Focus IA style)
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#7c3aed') // violet-600
  gradient.addColorStop(0.5, '#a855f7') // purple-500
  gradient.addColorStop(1, '#c084fc') // purple-400

  if (maskable) {
    // Maskable icons need safe zone (80% of icon)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  } else {
    // Rounded rectangle for regular icons
    const radius = size * 0.2
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size, radius)
    ctx.fillStyle = gradient
    ctx.fill()
  }

  // Draw sparkle (top-left area) - white/light color
  const sparkleSize = size * 0.16
  drawSparkle(ctx, size * 0.22, size * 0.25, sparkleSize, 'rgba(255, 255, 255, 0.9)')

  // Letter M (larger, centered)
  const fontSize = Math.round(size * 0.5)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.fillStyle = 'white'
  ctx.fillText('M', size * 0.55, size * 0.6)

  return canvas.toBuffer('image/png')
}

function generateAddIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background - matching purple gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#7c3aed') // violet-600
  gradient.addColorStop(1, '#a855f7') // purple-500

  const radius = size * 0.2
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, radius)
  ctx.fillStyle = gradient
  ctx.fill()

  // Plus sign
  ctx.strokeStyle = 'white'
  ctx.lineWidth = size * 0.12
  ctx.lineCap = 'round'

  const margin = size * 0.25
  ctx.beginPath()
  ctx.moveTo(size / 2, margin)
  ctx.lineTo(size / 2, size - margin)
  ctx.moveTo(margin, size / 2)
  ctx.lineTo(size - margin, size / 2)
  ctx.stroke()

  return canvas.toBuffer('image/png')
}

function generateListIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#6366f1')
  gradient.addColorStop(1, '#8b5cf6')

  const radius = size * 0.2
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, radius)
  ctx.fillStyle = gradient
  ctx.fill()

  // List lines
  ctx.strokeStyle = 'white'
  ctx.lineWidth = size * 0.08
  ctx.lineCap = 'round'

  const margin = size * 0.25
  const lineSpacing = size * 0.2

  for (let i = 0; i < 3; i++) {
    const y = margin + (i * lineSpacing) + size * 0.1
    ctx.beginPath()
    ctx.moveTo(margin, y)
    ctx.lineTo(size - margin, y)
    ctx.stroke()
  }

  return canvas.toBuffer('image/png')
}

// Generate all icons
const publicDir = path.join(__dirname, '..', 'public')

sizes.forEach(({ name, size, maskable }) => {
  let buffer

  if (name === 'icon-add.png') {
    buffer = generateAddIcon(size)
  } else if (name === 'icon-list.png') {
    buffer = generateListIcon(size)
  } else {
    buffer = generateIcon(size, maskable)
  }

  const filePath = path.join(publicDir, name)
  fs.writeFileSync(filePath, buffer)
  console.log(`Generated: ${name} (${size}x${size})`)
})

console.log('\nAll icons generated successfully!')
