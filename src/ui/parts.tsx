/**
 * The Parts layer, after tuiparts.sh.
 *
 * A tuiparts Primitive is a Root that owns state, and Parts that read it:
 * `Switch.Root` owns `checked`, `Switch.Thumb` reads it and leaves its
 * position and content to the caller. Presentation — glyphs, spacing, colour,
 * density — stays in the consumer's source, which is the trade the whole
 * library makes.
 *
 * These are the presentation Parts, not the behaviour ones. They exist so a
 * desk is assembled out of the same nouns a Recipe uses (a Box, a Row, a
 * Text, an Indicator) instead of a pile of divs with class names invented per
 * page. Controls with behaviour live in controls.tsx and own their state.
 */
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

type Pad = 'none' | 'compact' | 'comfortable'
type Gap = 0 | 1 | 2 | 3 | 4 | 5

const padClass: Record<Pad, string> = {
  none: '',
  compact: 'p-pad',
  comfortable: 'p-pad-comfortable',
}

const gapClass = (gap: Gap) => `gap-${gap}`

export function Box({
  children,
  pad = 'none',
  gap = 0,
  className = '',
  ...rest
}: {
  children?: ReactNode
  pad?: Pad
  gap?: Gap
  className?: string
} & CSSProperties &
  Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>) {
  return (
    <div className={`box ${padClass[pad]} ${gap ? gapClass(gap) : ''} ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function Row({
  children,
  gap = 2,
  className = '',
  wrap = false,
  ...rest
}: {
  children?: ReactNode
  gap?: Gap
  className?: string
  wrap?: boolean
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`row ${gapClass(gap)} ${wrap ? 'row-wrap' : ''} ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function Stack({
  children,
  gap = 2,
  className = '',
  ...rest
}: {
  children?: ReactNode
  gap?: Gap
  className?: string
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`stack ${gapClass(gap)} ${className}`} {...rest}>
      {children}
    </div>
  )
}

/** The Span a terminal would call a Text node: it carries content and no box. */
export function Text({
  children,
  tone = 'foreground',
  size = 'body',
  as: Tag = 'span',
  className = '',
  ...rest
}: {
  children?: ReactNode
  tone?: 'foreground' | 'muted' | 'accent'
  size?: 'body' | 'small' | 'label'
  as?: 'span' | 'p' | 'div' | 'dt' | 'dd'
  className?: string
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`text tone-${tone} size-${size} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function Panel({
  children,
  tone = 'panel',
  className = '',
  as: Tag = 'section',
  ...rest
}: {
  children?: ReactNode
  tone?: 'panel' | 'panel-2' | 'none'
  className?: string
  as?: 'section' | 'div' | 'article' | 'aside'
} & HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`panel panel--${tone} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function Rule({ className = '' }: { className?: string }) {
  return <hr className={`rule ${className}`} />
}

/** A status mark and its label. Non-interactive, so: presentation only. */
export function Badge({
  label,
  intent = 'neutral',
  className = '',
}: {
  label: string
  intent?: 'neutral' | 'accent' | 'muted' | 'mint' | 'butter' | 'lilac'
  className?: string
}) {
  return <span className={`badge badge--${intent} ${className}`}>{label}</span>
}

/** The indicator a Part reads. Colour is the caller's; the dot is the contract. */
export function Dot({ intent = 'accent' }: { intent?: 'accent' | 'muted' | 'live' }) {
  return <span className={`dot dot--${intent}`} aria-hidden="true" />
}
