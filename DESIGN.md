---
name: Question Box Blog
description: A warm, readable question-box blog colored from a Shiba Inu's coat.
colors:
  shiba-cream: "#fffdea"
  shiba-paper: "#fffefa"
  shiba-yellow: "#f5eeae"
  shiba-yellow-deep: "#ece2a0"
  shiba-red-tan: "#a3461a"
  shiba-red-tan-deep: "#8a3712"
  shiba-tan-light: "#eba873"
  shiba-black: "#2b2118"
  shiba-bark: "#6b5a45"
  shiba-whisker: "#8c7a5e"
  shiba-hairline: "#ebe1bd"
  warn-red: "#b3261e"
  warn-red-deep: "#8c1d17"
  leaf-green: "#2f5d1e"
  leaf-wash: "#eef2d8"
  warn-wash: "#fbe6dd"
  sun-wash: "#fbf3cc"
typography:
  display:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(4.5rem, 3.4rem + 5vw, 7rem)"
    fontWeight: 400
    lineHeight: 1
  headline:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(1.875rem, 1.45rem + 1.9vw, 2.625rem)"
    fontWeight: 400
    lineHeight: 1.15
  title:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(1.375rem, 1.2rem + 0.8vw, 1.625rem)"
    fontWeight: 400
    lineHeight: 1.15
  body:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  meta:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
rounded:
  badge: "3px"
  control: "6px"
  panel: "12px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  gutter: "clamp(16px, 4vw, 32px)"
  column: "760px"
  column-narrow: "440px"
components:
  button-primary:
    backgroundColor: "{colors.shiba-red-tan}"
    textColor: "{colors.shiba-cream}"
    rounded: "{rounded.control}"
    padding: "8px 24px"
  button-primary-hover:
    backgroundColor: "{colors.shiba-red-tan-deep}"
    textColor: "{colors.shiba-cream}"
  button-secondary:
    backgroundColor: "{colors.shiba-yellow}"
    textColor: "{colors.shiba-black}"
    rounded: "{rounded.control}"
    padding: "8px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.shiba-yellow-deep}"
    textColor: "{colors.shiba-black}"
  button-destructive:
    backgroundColor: "{colors.shiba-paper}"
    textColor: "{colors.warn-red}"
    rounded: "{rounded.control}"
    padding: "8px 24px"
  button-destructive-hover:
    backgroundColor: "{colors.warn-red}"
    textColor: "{colors.shiba-paper}"
  input:
    backgroundColor: "{colors.shiba-paper}"
    textColor: "{colors.shiba-black}"
    rounded: "{rounded.control}"
    padding: "10px"
  content-surface:
    backgroundColor: "{colors.shiba-paper}"
    textColor: "{colors.shiba-black}"
    rounded: "{rounded.panel}"
    padding: "clamp(20px, 4vw, 40px)"
  nav-band:
    backgroundColor: "{colors.shiba-yellow}"
    textColor: "{colors.shiba-black}"
    padding: "15px 20px"
  admin-badge:
    backgroundColor: "{colors.shiba-black}"
    textColor: "{colors.shiba-tan-light}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    padding: "3px 8px"
  flash-success:
    backgroundColor: "{colors.leaf-wash}"
    textColor: "{colors.leaf-green}"
    rounded: "{rounded.control}"
    padding: "15px"
  flash-error:
    backgroundColor: "{colors.warn-wash}"
    textColor: "{colors.warn-red-deep}"
    rounded: "{rounded.control}"
    padding: "15px"
---

# Design System: Question Box Blog

## Overview

**Creative North Star: "The Shiba Coat"**

Every color in the app comes from a Shiba Inu. The page is the pale cream undercoat (urajiro), the header and footer bands are the sesame-light yellow, the ink is the black of a black-and-tan Shiba, and the single strong accent is the red coat. The owner chose this palette and asked for it to be kept and developed. It is the identity, not a placeholder to be replaced.

The app is a working blog that people watch over a screen share, so color does structural work. Two surfaces, one strong accent and dark warm ink keep it legible through video compression and at thumbnail size. The red-tan marks what you act on: page headings, the brand, links, primary buttons, and a list title the moment you point at it. Everything else stays quiet so the accent stays loud.

The type, layout and Shiba motif follow the same idea: warm and friendly at a glance, calm and legible while reading. Every value lives as a token on `:root` in `resources/css/main.css`.

**Key Characteristics:**
- Warm cream canvas with one paper-white content surface. No grey anywhere.
- One strong red-tan accent for page headings, the brand, links and the primary action.
- Quiet sesame-yellow secondary for everyday actions (Edit, Cancel, pagination); in the thread, Reply is ink text and only Delete is red.
- Red appears only on Delete.
- Every text and control pair meets WCAG AA, most well above it.

## Colors

A warm, low-chroma family pulled from one dog's coat, with a single saturated red-tan doing all the pointing.

### Primary
- **Shiba Red-Tan** (`shiba-red-tan`): the accent. Used for page headings (including the question box title on its own page), list titles on hover and focus, the brand and the Shiba mark's coat, inline links, the 404 numeral, the outline of the admin's anonymous-author reveal, and the fill of the primary button. It reaches 6.0:1 on the paper surface, 5.9:1 on the cream page and 5.1:1 on the yellow band.
- **Deep Red-Tan** (`shiba-red-tan-deep`): accent hover and the focus ring. 7.9:1 on paper.
- **Tan on Black** (`shiba-tan-light`): the accent as it appears on the black coat. Used only on dark fills such as the admin badge (7.8:1 on Shiba Black).

### Secondary
- **Sesame Yellow** (`shiba-yellow`): the navbar and footer band, the fill of secondary buttons and pagination, nav hover, and text selection.
- **Deep Sesame** (`shiba-yellow-deep`): hover for secondary buttons and nav links.

### Tertiary (status only)
- **Warning Red** (`warn-red`): destructive actions only, meaning the Delete buttons for posts, comments and replies. It is used as an outline and text at rest and as a fill on hover. 6.5:1 on paper.
- **Deep Warning Red** (`warn-red-deep`): text of error flashes on the warm wash (7.6:1).
- **Leaf Green** (`leaf-green`) on **Leaf Wash** (`leaf-wash`): success flashes (6.8:1).
- **Warn Wash** (`warn-wash`): error flash background.
- **Sun Wash** (`sun-wash`): info flash background.

### Neutral
- **Urajiro Cream** (`shiba-cream`): the page canvas. It is also the text color on red-tan fills.
- **Paper** (`shiba-paper`): the one content surface, inputs, and the rest state of destructive buttons.
- **Shiba Black** (`shiba-black`): body ink and headings (15.6:1 on paper). It is also the admin badge fill.
- **Bark** (`shiba-bark`): muted ink for authors, dates, comment counts, page info and the footer (6.6:1 on paper, 5.6:1 on yellow).
- **Whisker** (`shiba-whisker`): outlines of inputs and secondary buttons. It reaches 4.1:1 on paper, which clears the 3:1 non-text minimum.
- **Hairline** (`shiba-hairline`): decorative dividers between posts, comments and replies, and the border of the content surface. It never marks a control.

### Token roles

Rules use semantic roles only, never primitives or raw values. The roles are defined once on `:root` in `resources/css/main.css`:

| Role | Primitive |
|---|---|
| page | Urajiro Cream |
| surface | Paper |
| band | Sesame Yellow |
| ink / ink-muted | Shiba Black / Bark |
| accent / accent-hover / accent-on-dark / on-accent | Red-Tan / Deep Red-Tan / Tan on Black / Urajiro Cream |
| secondary / secondary-hover | Sesame Yellow / Deep Sesame |
| border / border-strong | Hairline / Whisker |
| destructive / destructive-hover / on-destructive | Warning Red / Deep Warning Red / Paper |
| success, success-bg, error-bg, info-bg | Leaf Green, Leaf Wash, Warn Wash, Sun Wash |
| focus | Deep Red-Tan |
| highlight | Sun Wash (a just-posted comment or reply, for 2.4s) |
| scrim | Shiba Black at 45% (behind the delete dialog) |

### Named Rules
**The One Coat Rule.** Every color comes from the Shiba family or from a status role. No Bootstrap blue, no neutral grey, no borrowed alert palettes.

**The Red Means Delete Rule.** Warning Red appears only on delete actions and error feedback. Edit, Reply and Cancel are never red, red-tan or blue. Edit and Cancel use the quiet yellow secondary; Reply is ink text that takes the yellow fill on hover, focus, or while its form is open.

**The Token-Only Rule.** No hex, rgb or named color appears in a CSS rule outside `:root`. To change the palette, change the primitive. To change what something means, remap the role.

## Typography

**Display font:** Young Serif (fallback Georgia, serif), one weight (400).
**Body font:** Atkinson Hyperlegible Next (fallback Segoe UI, system-ui), 400 and 700, plus italic 400.

Both load from Google Fonts with one `<link>` in `views/layout.pug` and `display=swap`, so there is no build step.

**Character:** Young Serif is chunky and soft-cornered: warm and a little playful, like the dog, and it carries a brand at thumbnail size. Atkinson Hyperlegible Next was designed for legibility, so long multi-line posts, small meta text and the `0`/`O`, `1`/`l` in dates stay clear through screen-share compression. Never Arial or Inter.

### Scale (tokens on `:root`)
| Token | Size | Use |
|---|---|---|
| `--text-display` | clamp(4.5rem … 7rem) | the 404 numeral only |
| `--text-xl` | clamp(1.875rem … 2.625rem) | page h1, question box title on its page |
| `--text-lg` | clamp(1.375rem … 1.625rem) | list titles, h2 |
| `--text-md` | 1.25rem | h3, brand, empty-state line |
| `--text-base` | 1.0625rem | body, post content, comments |
| `--text-sm` | 0.9375rem | meta lines, nav links, replies, buttons (small) |
| `--text-xs` | 0.8125rem | badges, helper text, the admin reveal |

Line heights: `--leading-tight` 1.15 (headings), `--leading-snug` 1.35 (buttons, short display lines), `--leading-body` 1.6, `--leading-reading` 1.75 (post bodies). Weights: 400 and 700 only.

### Rules
- Headings are display, weight 400, `text-wrap: balance`. Body text uses `text-wrap: pretty`.
- Bodies, comments, list previews and intro lines are capped at `--measure` (56ch). `ch` is the width of a "0", wider than Atkinson's average letter, so 56ch holds about 73 characters. Post bodies keep `white-space: pre-wrap`.
- Titles, bodies, comments and author names use `overflow-wrap: anywhere`, so one very long word wraps instead of overflowing.
- Meta lines (author · date · comments) are `--text-sm` in Bark, separated by middle dots. They support the title and never compete with it. Every item carries a leading dot that is clipped at the start of a line, so a wrapped meta line never opens with "·". In the list, a non-zero comment count is bold Shiba Black ("No comments yet" stays muted), so rows with a conversation stand out.
- **List hierarchy:** title in Young Serif `--text-lg`, Shiba Black, turning red-tan with an underline on hover or focus; then the meta line; then the preview at `--text-sm`. Every list title in red-tan made the list a monotone wall, so the accent is reserved for the page h1 and for the row under the pointer.
- Dates use one format everywhere, with no seconds: `Nov 27, 2026, 3:04 PM` (`formatDate` in `server.js`, the same `Intl.DateTimeFormat` options in `main.js`). They render in `<time datetime>`.

## Layout

**One column.** There is no sidebar. The page shell is a flex column at least `100dvh` tall: the yellow header band, `main.page` (which grows), and the yellow footer band, so the footer sits at the bottom of short pages.

- The content column is `--column` (760px) wide plus fluid `--gutter` (16–32px) on each side. The header and footer content align to the same column.
- Login, register and 404 use the narrow column (`--column-narrow`, 440px). A page opts in from its `block vars` with `- var pageWidth = 'narrow'`.
- The content surface pads with `--panel-pad` (20–40px).
- The header is a size container. Under 520px of header width it stacks: brand on top, the user line, then the links.
- Meta lines, comment headers, form rows, action rows and pagination all `flex-wrap`, so nothing overflows at 390px.
- Spacing uses the `--space-1` … `--space-8` steps (4, 8, 12, 16, 24, 32, 48, 64px).
- The `h1` is the first heading on every page. The current nav target has `aria-current="page"` and a red-tan underline.

## Elevation & Depth

Flat. There are no shadows. Depth comes from exactly two tonal planes, the cream page and the paper content surface, separated by a hairline border. Items inside the surface are separated by dividers and spacing, never by another filled box.

**The Two Surfaces Rule.** There is the page and there is the surface. Do not put a filled or bordered card inside the content surface. Group with hairline dividers (solid between siblings, dashed for replies and the inline reply form) and indentation instead.

**The No Side-Tab Rule.** Don't put a colored bar on one side of a box. Use a full hairline divider, a tint, or a label.

## Shapes

Gently rounded and consistent. The content surface and the dialog have 12px corners. Buttons, inputs, flashes and nav links have 6px corners. The admin badge is a pill (`--radius-pill`); the admin reveal tag has a 3px corner. All borders are 1px. Focus is a 2px Deep Red-Tan outline with a 2px offset (0 offset on text fields, where it sits on the border).

## Components

### Buttons
Three roles that are distinct in fill as well as hue, so they can't be confused at a glance.
- **Shape:** 6px corners, a 1px border, bold label. Links and buttons share one box (`inline-flex`, explicit line height, 44px min height; 40px for `.btn-small`), so Edit and Delete line up.
- **Primary:** a red-tan fill with cream text (5.9:1). Use one per view: Publish / Save Changes, Log In, Register, Add Comment, Add Reply, Write the First One, Go Back Home. Hover deepens to Deep Red-Tan.
- **Secondary:** the default button. A sesame-yellow fill, Shiba Black text and a Whisker outline. Used for Edit, Cancel and pagination. Hover goes to Deep Sesame.
- **Destructive:** on a question box, a paper fill with a Warning Red outline and text, filling solid red on hover. On comments and replies, a quiet red text button that only gains its outline on hover or focus, and it always comes after Reply.
- **Thread actions (Reply, comment/reply Delete):** quiet text buttons, so a comment outweighs its actions. Reply is Shiba Black ink text that takes the sesame fill on hover or focus; Delete is Warning Red text that takes its outline on hover or focus, so in the thread ink means act and red means delete. Both keep a 40px hit area. While its form is open, Reply keeps its label and shows as pressed (sesame fill and outline, `aria-expanded="true"`); its width never changes, so Delete never moves. Accessible names include the author ("Reply to comment by demo_viewer").
- **States:** hover, `:active` (1px press), `:focus-visible` (2px Deep Red-Tan outline, offset 2px) and `:disabled` (60% opacity, not-allowed cursor). While a request runs, the button says so ("Posting…", "Deleting…").
- **Delete dialog:** a `<dialog>` with a Young Serif heading ("Delete this comment?") and a plain message that names what goes with it, mentioning replies only when there are some. Cancel has focus; Esc cancels.

### Cards / Containers
- **Content surface:** Paper, with a 1px hairline border, 10px corners and 30px padding. It is the only container.
- **Question boxes in the list:** not cards. Each is an `article` row divided by hairlines; the title link's `::after` covers the whole row, so the row is one link target. Keyboard focus outlines the whole row. The preview is cut on a word boundary (200-character budget) and clamped to three lines.
- **Comment count:** the thread's heading leads with the count as a red-tan Young Serif numeral at `--text-xl`, then "comment"/"comments" at `--text-lg` (`main.js` keeps both in sync).
- **Comment thread order:** the count heading (with a "Write a comment" jump link when there are comments), then the comments, then the "Leave a Comment" form, or the guest's log-in prompt, closing the thread after a hairline and `--space-6`. Reading comes before writing; a new comment lands just above the form.
- **Comments and replies:** rows divided by hairlines. Replies are indented 24px under their comment with dashed dividers. A just-posted comment or reply gets a short Sun Wash tint.

### Inputs / Fields
- **Style:** Paper fill, Shiba Black text, a 1px Whisker border and 5px corners.
- **Focus:** the border turns red-tan and gets a 2px Deep Red-Tan outline.
- Checkboxes, the caret and text selection are themed from the palette: red-tan accent and caret, sesame-yellow selection.

### Navigation
- **Band:** a full-width sesame-yellow bar. The brand is the Shiba mark plus "Question Box Blog" in Young Serif red-tan. Nav links are Shiba Black and take a Deep Sesame fill on hover; the current page is underlined in red-tan.
- **Admin badge:** a Shiba Black pill with a Tan on Black paw and the label "Admin". It is the one dark element on the page, so admin mode is unmistakable.

### Admin reveal
On an anonymous comment or reply, admins see a tag under the author line: "Posted anonymously by **name** · only admins see this". It is a dashed red-tan outline on Sun Wash with Deep Red-Tan text (about 7:1), never stray text in the header row.

### Flash messages
Below the header, inside the page column, above the content surface. On narrow pages (login, register, 404) it narrows to the 440px card under it. Success flashes start with the paw, the same acknowledgement as a posted comment. A 1px border in the status color over its wash, bold text, and a dismiss (×) button; dismissing moves focus to the page heading. Errors use `role="alert"`, everything else `role="status"`. Success uses Leaf Green on Leaf Wash, error uses Deep Warning Red on Warn Wash with a Warning Red border, and info uses Shiba Black on Sun Wash.

## Shiba Motif

The Shiba is the identity anchor. It is an original geometric head (triangle ears, red coat, cream urajiro mask, the two "maro" eyebrow dots), drawn as inline SVG in `views/mixins/shiba.pug` and colored by the palette tokens. `resources/images/shiba-mark.svg` is the favicon copy with the hex values inlined.

**Where it may appear (and nowhere else):**
- **Brand mark** in the header, 36px, `mood: 'happy'`. Its head tilts a few degrees on hover.
- **Home hero**, 64–120px (fluid), `mood: 'happy'`, beside the "Question Boxes" h1 and a one-line lede on a continuation of the sesame header band (`block hero` in `layout.pug`). It is the list page's one bold moment and replaces the old definition sentence. The band is chrome, not a box inside the content surface.
- **Favicon.**
- **404**, 120px, `mood: 'lost'` (round eyes and a "?"), with one slow head tilt on load.
- **Empty question box list**, 96px, `mood: 'sleepy'` (closed eyes and a "z"), with a way forward under it.
- **Empty comment thread**, 56px, `mood: 'sleepy'`, left-aligned beside "No comments yet. Start the conversation." (the `noComments` mixin, also cloned by `main.js` from a `<template>` when the last comment is deleted).
- **Paw** on the admin badge and in the "Comment posted. Thanks for joining in!" / "Reply posted. Thanks for joining in!" acknowledgements, which are announced through the existing `role="status"` regions.

**Rules:**
- Decorative art is `aria-hidden`; meaningful text sits next to it.
- Art never pushes content below the fold on the list or question box pages: with the hero, the first question box still starts in the first viewport at 390×844. No mark inside list rows, comments or forms.
- Motion uses transforms and opacity only, 160–600ms (`--duration-quick`, `--duration-gentle`, `--duration-tap`), one shot (no loops), and lives inside `@media (prefers-reduced-motion: no-preference)`. With reduced motion the new-item tint stays but nothing moves.
- No named mascot, no speech bubbles, no confetti, no sound. Don't copy an existing mascot or logo.

## Do's and Don'ts

### Do:
- **Do** use the semantic roles in `:root` for every color, and add a new role before adding a one-off value.
- **Do** keep red-tan for things the reader acts on: page headings, the brand, links, the one primary action, and the list row under the pointer. List titles at rest are ink.
- **Do** check every new text pair against 4.5:1 (3:1 for large text and control outlines) on the surface it actually sits on, including the yellow band.
- **Do** separate items inside the content surface with hairline dividers and space.
- **Do** develop the Shiba identity (coat colors, Shiba motifs) rather than introducing an unrelated palette.

### Don't:
- **Don't** reintroduce Bootstrap blue (#007bff), red (#dc3545) or grey (#6c757d) buttons or alert colors.
- **Don't** use Warning Red for anything except delete actions and error feedback.
- **Don't** nest a filled or bordered card inside the content surface.
- **Don't** add a colored bar down one side of a box.
- **Don't** use neutral greys (#999, #ccc, #f0f0f0) for text or fills. Use Bark for muted text and Hairline for dividers.
