/**
 * WCAG contrast, in fourteen lines.
 *
 * The palette page prints the same number the build gate measures; this is the
 * one implementation of the formula they both read. If they disagree, one of
 * them is lying about a colour.
 */

function channel(value: number): number {
  const v = value / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16)
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  )
}

export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

export function ratio(a: string, b: string): string {
  return `${contrast(a, b).toFixed(2)}:1`
}
