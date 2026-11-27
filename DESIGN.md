---
name: Q&A Box Blog
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
    fontFamily: "Arial, sans-serif"
    fontSize: "4em"
    fontWeight: 700
  headline:
    fontFamily: "Arial, sans-serif"
    fontSize: "2em"
    fontWeight: 700
  title:
    fontFamily: "Arial, sans-serif"
    fontSize: "1.5em"
    fontWeight: 700
  body:
    fontFamily: "Arial, sans-serif"
    fontSize: "1em"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Arial, sans-serif"
    fontSize: "0.85em"
    fontWeight: 700
rounded:
  badge: "3px"
  control: "5px"
  panel: "10px"
spacing:
  xs: "5px"
  sm: "10px"
  md: "15px"
  lg: "20px"
  xl: "30px"
  xxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.shiba-red-tan}"
    textColor: "{colors.shiba-cream}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.shiba-red-tan-deep}"
    textColor: "{colors.shiba-cream}"
  button-secondary:
    backgroundColor: "{colors.shiba-yellow}"
    textColor: "{colors.shiba-black}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.shiba-yellow-deep}"
    textColor: "{colors.shiba-black}"
  button-destructive:
    backgroundColor: "{colors.shiba-paper}"
    textColor: "{colors.warn-red}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
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
    padding: "30px"
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

# Design System: Q&A Box Blog

## Overview

**Creative North Star: "The Shiba Coat"**

Every color in the app comes from a Shiba Inu. The page is the pale cream undercoat (urajiro), the header and footer bands are the sesame-light yellow, the ink is the black of a black-and-tan Shiba, and the single strong accent is the red coat. The owner chose this palette and asked for it to be kept and developed. It is the identity, not a placeholder to be replaced.

The app is a working blog that people watch over a screen share, so color does structural work. Two surfaces, one strong accent and dark warm ink keep it legible through video compression and at thumbnail size. The red-tan marks what you can read next or act on: titles, the brand, primary buttons. Everything else stays quiet so the accent stays loud.

This is the color system. Typography, layout and Shiba illustrations are still being redesigned in later steps. Those sections describe the current state and will be updated as those steps land.

**Key Characteristics:**
- Warm cream canvas with one paper-white content surface. No grey anywhere.
- One strong red-tan accent for titles, the brand, links and the primary action.
- Quiet sesame-yellow secondary for everyday actions (Edit, Reply, Cancel, pagination).
- Red appears only on Delete.
- Every text and control pair meets WCAG AA, most well above it.

## Colors

A warm, low-chroma family pulled from one dog's coat, with a single saturated red-tan doing all the pointing.

### Primary
- **Shiba Red-Tan** (`shiba-red-tan`): the accent. Used for question box titles, the navbar brand, section headings, "Read Full Post", inline links, the 404 numeral, the admin's "actually: name" reveal, and the fill of the primary button. It reaches 6.0:1 on the paper surface, 5.9:1 on the cream page and 5.1:1 on the yellow band.
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

### Named Rules
**The One Coat Rule.** Every color comes from the Shiba family or from a status role. No Bootstrap blue, no neutral grey, no borrowed alert palettes.

**The Red Means Delete Rule.** Warning Red appears only on delete actions and error feedback. Edit, Reply and Cancel are never red or blue. They use the quiet yellow secondary.

**The Token-Only Rule.** No hex, rgb or named color appears in a CSS rule outside `:root`. To change the palette, change the primitive. To change what something means, remap the role.

## Typography

**Body Font:** Arial (with sans-serif)

**Character:** Provisional. This is the incumbent system sans, kept unchanged during the color step. The typography step will replace it, and this section will be rewritten then.

### Hierarchy
- **Display** (700, 4em): the 404 numeral only.
- **Headline** (700, 2em): page headings and the question box title on its own page, in red-tan.
- **Title** (700, 1.5em): question box titles in the list, in red-tan, and section headings.
- **Body** (400, 1em, 1.6 line height; 1.8 for full post content): post and comment text in Shiba Black. Post content keeps its whitespace and line breaks.
- **Label** (700, 0.85em): the admin badge, and bold author names in comment headers.

## Layout

Provisional: the layout step will remove the sidebar and rework the grid. Currently there is a full-width yellow band header, a 1200px max container holding a 250px navigation column and the content surface, and a yellow band footer. The spacing steps are 5, 10, 15, 20, 30 and 40px. Inside the content surface, items are separated by hairline dividers with 15–20px of space, not by boxes.

## Elevation & Depth

Flat. There are no shadows. Depth comes from exactly two tonal planes, the cream page and the paper content surface, separated by a hairline border. Items inside the surface are separated by dividers and spacing, never by another filled box.

**The Two Surfaces Rule.** There is the page and there is the surface. Do not put a filled or bordered card inside the content surface. Group with hairline dividers (solid between siblings, dashed for replies and the inline reply form) and indentation instead.

**The No Side-Tab Rule.** Don't put a colored bar on one side of a box. Use a full hairline divider, a tint, or a label.

## Shapes

Gently rounded and consistent. The content surface has 10px corners. Buttons, inputs, flashes and nav links have 5px corners. The admin badge has a 3px corner. All borders are 1px. Focus is a 2px Deep Red-Tan outline with a 2px offset (0 offset on text fields, where it sits on the border).

## Components

### Buttons
Three roles that are distinct in fill as well as hue, so they can't be confused at a glance.
- **Shape:** 5px corners and a 1px border. Default size is 10px 20px; the small size is 5px 10px at 0.85em.
- **Primary:** a red-tan fill with cream text (5.9:1). Use one per view: Publish/Update, Login, Register, Submit Comment, Submit Reply, Go Back Home. Hover deepens to Deep Red-Tan.
- **Secondary:** the default button. A sesame-yellow fill, Shiba Black text and a Whisker outline. Used for Edit, Reply, Cancel and pagination. Hover goes to Deep Sesame.
- **Destructive:** a paper fill with a Warning Red outline and text at rest. It fills solid red with paper text on hover. Used only for Delete on posts, comments and replies.
- **Focus:** a 2px Deep Red-Tan outline, offset 2px.

### Cards / Containers
- **Content surface:** Paper, with a 1px hairline border, 10px corners and 30px padding. It is the only container.
- **Question boxes, comments, replies:** not cards. They are rows divided by hairlines. Replies are indented 20px under their comment with dashed dividers.

### Inputs / Fields
- **Style:** Paper fill, Shiba Black text, a 1px Whisker border and 5px corners.
- **Focus:** the border turns red-tan and gets a 2px Deep Red-Tan outline.
- Checkboxes, the caret and text selection are themed from the palette: red-tan accent and caret, sesame-yellow selection.

### Navigation
- **Band:** a full-width sesame-yellow bar. The brand is in bold red-tan and darkens on hover. Nav links are Shiba Black and take a Deep Sesame fill on hover.
- **Admin badge:** a Shiba Black chip with Tan on Black label text. It is the one dark element on the page, so admin mode is unmistakable.

### Flash messages
A full 1px border in the status color over its wash, with bold centered text. Success uses Leaf Green on Leaf Wash, error uses Deep Warning Red on Warn Wash with a Warning Red border, and info uses Shiba Black on Sun Wash.

## Do's and Don'ts

### Do:
- **Do** use the semantic roles in `:root` for every color, and add a new role before adding a one-off value.
- **Do** keep red-tan for things the reader reads next or acts on: titles, the brand, links and the one primary action.
- **Do** check every new text pair against 4.5:1 (3:1 for large text and control outlines) on the surface it actually sits on, including the yellow band.
- **Do** separate items inside the content surface with hairline dividers and space.
- **Do** develop the Shiba identity (coat colors, Shiba motifs) rather than introducing an unrelated palette.

### Don't:
- **Don't** reintroduce Bootstrap blue (#007bff), red (#dc3545) or grey (#6c757d) buttons or alert colors.
- **Don't** use Warning Red for anything except delete actions and error feedback.
- **Don't** nest a filled or bordered card inside the content surface.
- **Don't** add a colored bar down one side of a box.
- **Don't** use neutral greys (#999, #ccc, #f0f0f0) for text or fills. Use Bark for muted text and Hairline for dividers.
