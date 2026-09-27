---
name: mobile-first-asha-ui
description: UI/UX design standards and accessibility guidelines tailored for ASHA workers on budget mobile devices.
---

# Mobile-First ASHA UI Standards

## Purpose
Enforces ultra-simplified, accessible, mobile-first design tailored for low-resource environments and users with varying levels of digital literacy.

## When to Use
Use when creating frontend layouts, form inputs, navigation patterns, dashboards, and feedback indicators.

## Core Rules & Ergonomics
1. **Target Viewport & Thumb Zone**:
   - Primary target: 360px - 412px width (budget Android devices).
   - Bottom-weighted interactions: Primary action buttons in thumb-friendly reach zones.
2. **Touch Targets & Typography**:
   - Minimum tap target size: 48px × 48px.
   - Text size: Base font 16px minimum for readability; high-contrast font weights.
   - No micro-typography or low-contrast muted grays.
3. **Form Design (Minimal Typing)**:
   - Maximize chips, single-tap segmented buttons, toggle pills, and select dropdowns over text entry.
   - Numeric inputs must invoke numeric keyboards (`inputMode="numeric"` or `"tel"`).
   - Auto-calculate derived fields (e.g., auto-calculate gestational age from Last Menstrual Period LMP).
4. **Visual Hierarchy & Colors**:
   - High accessibility contrast ratio (WCAG AAA for text, minimum AA).
   - Calming healthcare palette: Clinical Emerald / Slate / Saffron accent. Avoid neon colors or distracting gradient effects.
   - Clear status indicators: Red for urgent/danger, Amber for pending/due soon, Green for completed/normal.
5. **Clear Feedback States**:
   - Immediate visual feedback on touch/submit.
   - Prominent sticky offline/sync status pill in header/footer at all times.

## Quality Checklist
- [ ] Forms fit cleanly on small screens without horizontal scroll.
- [ ] Tap targets are minimum 48px.
- [ ] Visual labels accompany every icon (no ambiguous icon-only action buttons).
- [ ] High contrast ratios pass accessibility tests.
