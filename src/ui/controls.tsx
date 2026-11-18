/**
 * The interactive Parts.
 *
 * Same division as tuiparts.sh: the state lives in the component, the look
 * lives in CSS you can edit. Where tuiparts leans on OpenTUI for editing,
 * focus and pointer handling, this leans on the platform — a real <button>,
 * a real <input>, a real <select> — and only re-implements the one behaviour
 * the platform does not give you: roving focus in a tab list.
 */
import { useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'quiet' | 'ghost'
type Size = 'compact' | 'comfortable'

export function Button({
  children,
  variant = 'quiet',
  size = 'comfortable',
  type = 'button',
  className = '',
  ...rest
}: {
  children: ReactNode
  variant?: ButtonVariant
  size?: Size
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
  error,
}: {
  label: string
  hint?: ReactNode
  children: ReactNode
  htmlFor?: string
  error?: string | null
}) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${className}`} {...rest} />
}

export function Select({
  children,
  className = '',
  ...rest
}: { children: ReactNode; className?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`input select ${className}`} {...rest}>
      {children}
    </select>
  )
}

/**
 * A switch is a button with `role="switch"`: the pressed state is `aria-checked`,
 * and the thumb is only the visible half of it. Keyboard activation is the
 * button's own; there is no second key handler to get out of step.
 */
export function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="switch"
      onClick={() => onChange(!checked)}
    >
      <span className="switch__track" aria-hidden="true">
        <span className={`switch__thumb ${checked ? 'is-on' : ''}`} />
      </span>
      <span className="switch__label">
        {label}
        {hint ? <span className="switch__hint">{hint}</span> : null}
      </span>
    </button>
  )
}

/**
 * Tabs, with roving focus. One tab is in the tab order; arrow keys move
 * between them, Home and End jump to the ends, and selection follows focus.
 * The role is `tablist`/`tab`, and the panel is associated by id, not by
 * proximity.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string }[]
  value: T
  onChange: (next: T) => void
  label: string
}) {
  const base = useId()
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const move = (from: number, delta: number) => {
    const next = (from + delta + tabs.length) % tabs.length
    const tab = tabs[next]
    onChange(tab.id)
    refs.current[tab.id]?.focus()
  }

  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[tab.id] = node
            }}
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={`tabs__tab ${selected ? 'is-selected' : ''}`}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                move(index, 1)
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault()
                move(index, -1)
              } else if (event.key === 'Home') {
                event.preventDefault()
                move(index, -index)
              } else if (event.key === 'End') {
                event.preventDefault()
                move(index, tabs.length - 1 - index)
              }
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="tabpanel" role="tabpanel" id={id} aria-label={label}>
      {children}
    </div>
  )
}
