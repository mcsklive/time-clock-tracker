# Design Brief

## Direction

"สมุดโค้ช" (Coach's Ledger) — a dark, precise coaching log where each entry reads like a filed report and the summary panel is the team's scoreboard.

## Tone

Refined utilitarian: instrument-panel calm with editorial report structure, because team leads write entries between chats and need to scan history fast.

## Differentiation

A fixed two-column workspace — dense entry form on the left, live per-person summary on the right — makes writing a log and reading team coverage feel like one continuous motion.

## Color Palette

| Token      | OKLCH (dark)    | Role                                   |
| ---------- | --------------- | -------------------------------------- |
| background | 0.185 0.018 255 | Deep cool charcoal page canvas         |
| foreground | 0.945 0.008 95  | Off-white text, warm-neutral           |
| card       | 0.235 0.02 255  | Raised form and panel surfaces         |
| primary    | 0.79 0.145 72   | Amber save action, active filter, focus |
| accent     | 0.34 0.05 68    | Muted amber tint for selected states   |
| success    | 0.78 0.11 168   | Teal-green session counts and email pills |
| muted      | 0.28 0.018 255  | Secondary panels, row stripes          |

Light mode mirrors the palette: warm paper `0.985 0.004 95` background, same amber `0.62 0.14 62` primary.

## Typography

- Display: Space Grotesk — wordmark, section headings, stat numerals labels
- Body: Figtree — Thai UI labels, form text, history rows
- Mono: Geist Mono — dates, session counts, email chips
- Scale: stat `text-4xl md:text-5xl font-medium tracking-tight text-tabular`, h2 `text-xl md:text-2xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase text-muted-foreground`, body `text-base`

## Elevation & Depth

Cards sit on the canvas with 1px `border-border` and `shadow-subtle`; the entry form card gets `shadow-elevated` and a `hairline-top` amber edge so it reads as the primary instrument.

## Structural Zones

| Zone    | Background      | Border     | Notes                                                |
| ------- | --------------- | ---------- | ---------------------------------------------------- |
| Header  | `bg-card`       | `border-b` | Wordmark left, Thai user name + logout right          |
| Content | `bg-background` | —          | Two-column: entry form + summary, then history below  |
| Footer  | `bg-muted/40`   | `border-t` | Quiet app line, no links                              |

## Spacing & Rhythm

Section gaps `gap-6 md:gap-8`, card padding `p-5 md:p-7`, form field rhythm `space-y-4`, micro-spacing `gap-2`/`gap-3`; history rows use tighter `py-4` density.

## Component Patterns

- Buttons: primary save is full-width `rounded-xl` amber filled, min height 56px, `text-base font-semibold`; secondary actions outlined `border-border`; destructive confirm uses destructive tint
- Cards: `rounded-2xl` (14px), `bg-card`, 1px border, `shadow-subtle`
- Badges: pill `rounded-full`; filter chips `bg-accent text-accent-foreground` when active, `bg-muted text-muted-foreground` when idle; email pills `bg-success/15 text-success` mono
- Inputs: `bg-background` inset, 1px `border-input`, `rounded-lg`, amber `ring` on focus

## Motion

- Entrance: `animate-fade-up` on cards, 0.4s staggered by 60ms
- Hover: buttons lift to `bg-primary/90` with `transition-smooth` 0.3s; history rows tint `bg-muted/40`
- Decorative: `animate-pulse-dot` only on the unsaved-changes status dot; numerals never animate

## Constraints

- All UI text in Thai; dates and counts use Thai locale formatting
- Status must be readable from color + text, never color alone
- No gradients on surfaces beyond `bg-gradient-subtle`, no glassmorphism, no neon glow
- Dates, counts, and email lists always use `text-tabular` / mono so columns align

## Signature Detail

The summary panel's per-person list pairs a teal session count with the latest coaching date in mono — a scoreboard for coverage, not decoration.
