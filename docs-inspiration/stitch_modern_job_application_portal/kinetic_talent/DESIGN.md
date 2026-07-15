---
name: Kinetic Talent
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: auto
  max-width: 1280px
---

## Brand & Style

The design system is anchored in the concept of "Efficient Professionalism." It targets job seekers and recruiters who value speed, clarity, and reliability. The aesthetic is a fusion of **Modern Corporate** and **Minimalism**, stripping away decorative elements to focus entirely on information density and task completion.

The UI should evoke a sense of calm authority. By utilizing a structured grid and a high-contrast typographic scale, the design system ensures that the platform feels like a high-performance tool rather than a social network. The emotional response is one of confidence—users should feel that their career data is handled with precision and that the path to their next role is unobstructed.

## Colors

This design system uses a logic-driven color palette to establish hierarchy and trust. 

- **Primary (Corporate Blue):** Used for primary actions, progress indicators, and active states. It represents the "energy" of the search.
- **Secondary (Deep Indigo):** Reserved for high-level navigation, headings, and critical text elements to provide a grounded, authoritative feel.
- **Tertiary (Soft Slate):** A collection of background tints used to differentiate sections without the need for heavy borders.
- **Neutral (Cool Grays):** Systematically applied to secondary text, icons, and disabled states to maintain a clean, tech-forward aesthetic.

Success, Warning, and Error states should follow standard semantic conventions (Green/Amber/Red) but at a slightly lower saturation to align with the professional palette.

## Typography

Inter is the sole typeface for this design system to ensure maximum legibility and a systematic, utilitarian appearance. The scale relies on weight and tight tracking in headings to create a modern "tech" feel.

- **Headlines:** Utilize semi-bold and bold weights with slight negative letter-spacing to appear compact and impactful.
- **Body:** Standardized at 16px for optimal long-form reading of job descriptions.
- **Labels:** Used for metadata (location, salary, date posted). Label-sm is often used in uppercase with increased letter spacing to distinguish it from body text.

## Layout & Spacing

The design system utilizes a **12-column fixed grid** for desktop environments with a maximum width of 1280px. For tablet and mobile, the layout transitions to a fluid model with 8 and 4 columns respectively.

A strict 4px/8px baseline grid is used to ensure vertical rhythm.
- **Margins:** 16px on mobile, increasing to 24px on tablet. Desktop is centered with auto-margins.
- **Gaps:** Standardize on 24px (lg) for component spacing (e.g., distance between cards in a feed) and 16px (md) for internal element spacing.
- **Density:** Provide "comfortable" spacing for seeker-facing views and "compact" spacing for recruiter dashboards where data density is prioritized.

## Elevation & Depth

This design system avoids heavy shadows and physical metaphors in favor of **Tonal Layers** and **Low-Contrast Outlines**.

1.  **Level 0 (Base):** The main background color (#FFFFFF or #F8FAFC).
2.  **Level 1 (Cards):** Use a 1px solid border (#E2E8F0) to define card boundaries. No shadow is applied unless the card is interactive.
3.  **Level 2 (Hover/Active):** On hover, an element may gain a subtle, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) to indicate interactivity.
4.  **Level 3 (Overlays):** Modals and dropdowns use a slightly more pronounced shadow and a backdrop blur to maintain focus on the task at hand.

## Shapes

The shape language is "Soft Professional." We avoid sharp 90-degree angles to remain approachable, but also avoid pill-shapes to keep the UI looking structured and efficient.

- **Standard Elements:** Buttons, inputs, and small cards use a 0.5rem (8px) radius.
- **Containers:** Large sections or main content areas use a 1rem (16px) radius.
- **Subtle Indicators:** Progress bars and small status dots use a fully rounded (pill) radius for clear visual distinction from structural blocks.

## Components

### Buttons
- **Primary:** Solid Blue background with white text. High-contrast, used for "Apply Now" or "Post a Job."
- **Secondary:** White background with a 1px Blue border and Blue text. Used for "Save Job" or "Cancel."
- **Ghost:** No background or border. Used for tertiary actions like "Learn More."

### Job Cards
- White background with a 1px Gray-200 border.
- 24px internal padding.
- Company logo should be 48x48px with a 4px radius.
- Metadata (salary, location) uses `label-md` with neutral slate color.

### Filter Chips
- Unselected: Light gray background (#F1F5F9) with Slate text.
- Selected: Primary Blue background or a light-blue tint with Blue text.
- Interactions: Include a "remove" icon on selected chips for quick modification.

### Input Fields
- 1px border (#CBD5E1). On focus, the border changes to Primary Blue with a 2px outer glow (ring).
- Placeholder text should be `neutral_color_hex` at 50% opacity.

### Lists & Navigation
- List items in the dashboard should use a hover state with a subtle Tertiary background (#F8FAFC).
- Navigation links use a 2px bottom border (Primary Blue) to indicate the active page.