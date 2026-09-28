# Accessibility & Inclusive UX Report — ASHA Saathi

**Platform Version:** Phase 9 Production Hardening  
**Target User Persona:** Frontline ASHA Workers, ANMs, and PHC Staff across diverse digital literacy and linguistic backgrounds  
**Standard Evaluated:** WCAG 2.1 Level AA & Mobile Health Accessibility Guidelines  

---

## 1. Executive Summary

ASHA workers in India operate in dynamic physical environments — conducting outdoor doorstep surveys, verifying immunization under direct sunlight, and typing while walking between villages. Phase 9 audited and reinforced accessibility standards across all components:
1. **Target Sizes:** Every clickable button, navigation item, and input field maintains a minimum touch target size of 44×44px (with 48×48px standard for primary field action buttons).
2. **Color Contrast & Sunlight Legibility:** High-contrast text palettes (contrast ratio > 4.5:1 for normal text, > 3:1 for large text and UI components) with semantic color badges.
3. **Bilingual Localization:** Seamless toggling between English and Hindi (`hi`), including bilingual labels (`Record Home Visit • गृह भ्रमण दर्ज करें`).
4. **Assistive Technologies & Semantic HTML:** All icon buttons include explicit `aria-label` or accessible text descriptions.
5. **Accessible Alternatives for Data Visualizations:** Every chart, trend bar, and analytical view provides an accessible data table fallback.

---

## 2. Touch Target Compliance (Mobile Ergonomics)

Mobile devices used in field campaigns often have 5.0" to 6.2" screens with varying touchscreen digitizer sensitivity.

| Component Category | Minimum Dimension | Implementation Pattern |
| :--- | :---: | :--- |
| **Primary Action Buttons** | 48px height | `min-h-[48px] px-4 py-3 rounded-xl font-bold` |
| **Bottom Navigation Tabs** | 56px height | Equal grid columns with clear tap padding (`min-h-[48px] py-2`) |
| **Filter Chips** | 36px–40px height | `min-h-[36px] px-3.5 py-1.5 rounded-full whitespace-nowrap` |
| **Form Input Fields** | 48px height | `min-h-[48px] px-3.5 py-2.5 rounded-xl border` |
| **Card Tap Containers** | Full card surface | Cards marked with `role="button"` and `tabIndex={0}` for keyboard/switch-access activation |

---

## 3. Sunlight Visibility & Color Contrast

Field workers frequently review screens in high ambient daylight. The UI eliminates low-contrast pastel gray text:
- **Primary Body Text:** `text-slate-800` / `text-slate-900` on white cards (contrast ratio ~ 12:1).
- **Secondary Helper Text:** `text-slate-600` on light backgrounds (contrast ratio > 5.5:1).
- **Status Badges:** Text colors are paired with distinct background shades and recognizable emoji or iconography (e.g., 🟢 green for Synced, 🟡 amber for Pending Sync, 🔴 red for Overdue). Color is never used as the sole conveyor of information.

---

## 4. Bilingual Localization & Cognitive Accessibility

- **Accessible Language Selector:** Accessible dropdown component with ARIA listbox semantics (`aria-haspopup="listbox"`, `aria-expanded`, `role="listbox"`, `role="option"`, `aria-selected`). Displays clear native language labels (`English` and `हिन्दी`) rather than ambiguous national flags.
- **Mobile Touch Targets:** Dropdown triggers and options maintain minimum 44px–48px touch targets for easy finger tapping on mobile viewports.
- **HTML Lang Synchronization:** Dynamically updates `document.documentElement.lang` (`en` or `hi`) so screen readers, text-to-speech, and braille displays pronounce and interpret syllables accurately.
- **Bilingual Context Hints:** Form headers and confirmation dialogs present dual-language headings to assist workers transitioning from paper registers (e.g., *Maternal Checkup • मातृ जांच*, *Due Today • आज देय*).
- **Clear Empty and Error States:** System errors display human-readable guidance in plain language with prominent "Try Again" / "पुनः प्रयास करें" buttons.

---

## 5. Screen Readers & Keyboard Navigation

- **Semantic Landmark Roles:** Pages utilize `<header>`, `<main>`, `<nav aria-label="Bottom Navigation">`, and `<footer>`.
- **Icon-Only Buttons:** All icon-only elements (e.g., notification bell, search trigger, close modal, logout) are equipped with `aria-label` and `title` attributes.
- **Accessible Data Visualizations:** Analytical views built in Phase 8 provide a Toggle Switch between "Visual Charts" and "Data Table", enabling screen readers to read tabular numbers and percentages directly.
