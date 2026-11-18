/**
 * The token contract, after tuiparts.sh.
 *
 * tuiparts divides a component in two: behaviour is a packaged Primitive, and
 * presentation is source you own — a token file, a glyph set, a border style,
 * a density. There is no theme runtime that repaints things behind your back.
 *
 * This file is that token file, for a browser instead of a terminal. The
 * contract is copied deliberately, field for field, from
 * https://tuiparts.sh/docs/theming — same names, same intent pairs, same glyph
 * vocabulary, same `density.paddingX` in character cells — so a control lifted
 * from the tuiparts catalogue lands here with its names intact.
 *
 * The wall itself (aubergine, lilac grain, incense, dark pink) is not part of
 * the tuiparts contract: it is le.seo's own ground, and it lives in Wall below.
 * Keeping the two apart is what lets the parts be replaced without repainting
 * the room.
 */

export type ColorInput = string

export interface Tokens {
  colors: {
    background: ColorInput
    surface: ColorInput
    foreground: ColorInput
    mutedForeground: ColorInput
    border: ColorInput
    focus: ColorInput
    primary: ColorInput
    primaryForeground: ColorInput
    destructive: ColorInput
    destructiveForeground: ColorInput
    success: ColorInput
    successForeground: ColorInput
    warning: ColorInput
    warningForeground: ColorInput
    disabled: ColorInput
    disabledForeground: ColorInput
  }
  glyphs: {
    check: string
    radio: string
    thumb: string
    track: string
  }
  borders: {
    style: 'single' | 'rounded' | 'double' | 'heavy'
  }
  density: {
    paddingX: number
    comfortablePaddingX: number
  }
}

/**
 * le.seo's own ground. Not a tuiparts token, and not negotiable at runtime:
 * a tree under a different wall is a different tree.
 */
export interface Wall {
  ink: ColorInput
  inkDeep: ColorInput
  panel: ColorInput
  panel2: ColorInput
  line: ColorInput
  lineSoft: ColorInput
  smoke: ColorInput
  smokeDim: ColorInput
  pink: ColorInput
  pinkInk: ColorInput
  pinkDeep: ColorInput
  night: ColorInput
  lilac: ColorInput
  mint: ColorInput
  butter: ColorInput
}

export const WALL: Wall = {
  ink: '#241634',
  inkDeep: '#1A0E29',
  panel: '#2E1B45',
  panel2: '#190D27',
  line: '#7B5A9E',
  lineSoft: '#523670',
  smoke: '#F6EDFB',
  smokeDim: '#CFBAE4',
  pink: '#EA0C79',
  pinkInk: '#FF8AC9',
  pinkDeep: '#A3084F',
  night: '#0F0519',
  lilac: '#A98CFF',
  mint: '#9BE3C4',
  butter: '#F2D48A',
}

/** The default: a violet wall with grain, and one dark-pink accent. */
const DESK: Tokens = {
  colors: {
    background: WALL.ink,
    surface: WALL.panel,
    foreground: WALL.smoke,
    mutedForeground: WALL.smokeDim,
    border: WALL.line,
    focus: WALL.pinkInk,
    primary: WALL.pink,
    primaryForeground: WALL.night,
    destructive: WALL.pinkDeep,
    destructiveForeground: WALL.smoke,
    success: WALL.mint,
    successForeground: WALL.night,
    warning: WALL.butter,
    warningForeground: WALL.night,
    disabled: WALL.lineSoft,
    disabledForeground: WALL.smokeDim,
  },
  glyphs: {
    check: '✓',
    radio: '●',
    thumb: '▮',
    track: '╌',
  },
  borders: { style: 'single' },
  density: { paddingX: 2, comfortablePaddingX: 4 },
}

/**
 * The same tree with the grain turned down and the accent reserved for the
 * held state. Registered, so the toggle in the footer is a real theme switch
 * and not a class name.
 */
const QUIET: Tokens = {
  ...DESK,
  colors: {
    ...DESK.colors,
    focus: WALL.smoke,
    primary: WALL.inkDeep,
    primaryForeground: WALL.smoke,
  },
  borders: { style: 'rounded' },
}

export type ThemeName = 'desk' | 'quiet'

const REGISTRY = new Map<ThemeName, Tokens>([
  ['desk', DESK],
  ['quiet', QUIET],
])

type Listener = (tokens: Tokens, name: ThemeName) => void

function freeze(tokens: Tokens): Tokens {
  return JSON.parse(JSON.stringify(tokens)) as Tokens
}

const listeners = new Set<Listener>()
let active: ThemeName = 'desk'

/**
 * A deliberately small store: get, subscribe, setActive. tuiparts also carries
 * `setMode('system'|'dark'|'light')`; le.ad is a dark desk by construction, so
 * this returns false for a mode it cannot honour rather than pretending.
 */
export const theme = {
  get(): Tokens {
    return freeze(REGISTRY.get(active) ?? DESK)
  },
  name(): ThemeName {
    return active
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setActive(name: ThemeName): boolean {
    if (!REGISTRY.has(name)) return false
    active = name
    const tokens = freeze(REGISTRY.get(name) as Tokens)
    for (const listener of listeners) listener(tokens, name)
    return true
  },
  setMode(mode: 'system' | 'dark' | 'light'): boolean {
    return mode !== 'light'
  },
}

/** The border characters a `style` expands to, for text-drawn parts. */
export const BORDERS = {
  single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  heavy: { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
} as const

export type BorderStyle = keyof typeof BORDERS
