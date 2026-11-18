/**
 * This seed's own card. Same shape as the card it publishes at /seed.json, and
 * the same file that `scripts/seed-card.mjs` renders — so the pitch a reader
 * sees on another site is the one written here.
 */
import card from './self-card.json'

export type SeedCard = {
  version: number
  id: string
  name: string
  preferred: string
  verb: string
  kind: 'seed' | 'site' | 'lab' | 'project' | 'isotope'
  live: string
  repo: string
  rung: number
  description: string
  pitches: Record<string, string>
  voices: string[]
  goals: string[]
  ships: string[]
  builtFrom: string[]
}

export const SELF_CARD = card as SeedCard
