# Extracted Color Theme

This theme was extracted from the current Vue app styles. It should be used as the starting point for the Next.js + shadcn/ui migration.

## Dominant Palette

| Role | Token | Current color | Notes |
| --- | --- | --- | --- |
| Brand navy | `brand.navy` | `#26355d` | Main dark brand color. Used for headings, checkout buttons, cart text, loader, and shipping/checkout text. |
| Brand purple | `brand.purple` | `#af47d2` | Primary action color. Used for buttons, product hover borders, icons, pagination, favorites, and form focus. |
| Purple hover | `brand.purpleHover` | `#7a2eb5` | Input focus/hover and password icon hover. |
| Purple action | `brand.actionPurple` | `#a240de` | Header cart badge/icon accents and cart price accent. |
| Soft lavender | `brand.lavender` | `#f0dff5` | Main light panel/section background for hero, auth forms, product bands, shipping/checkout summaries. |
| Pale lavender | `brand.lavenderSubtle` | `#f9f3fc` | User account and sidebar background. |
| Service lavender | `brand.lavenderMuted` | `#f3e5f5` | Service/feature card background. |
| Amber CTA | `accent.amber` | `#ff8f00` | Hero CTA, add-to-cart, checkout button, loader. |
| Amber status | `accent.orange` | `#ff9800` | Active checkout/shipping steps and service button. |
| Brand yellow | `accent.yellow` | `#ffdb00` | Logo/header highlight and loader. |
| Footer navy | `footer.navy` | `#1f2b57` | Main footer background. |
| Footer dark | `footer.dark` | `#0c1b37` | Footer copyright strip. |
| Footer slate | `footer.slate` | `#3b4a6b` | Footer social icon background. |
| Footer gold | `footer.gold` | `#fdb813` | Footer links/highlights. |

## Semantic Colors

| Role | Token | Current color | Notes |
| --- | --- | --- | --- |
| Success | `semantic.success` | `#4caf50` | Completed shipping/checkout steps. |
| Stock success | `semantic.stockSuccess` | `rgb(12, 192, 72)` | Product detail stock status. |
| Warning | `semantic.warning` | `rgb(207, 200, 13)` | Low stock status. |
| Destructive | `semantic.destructive` | `rgba(231, 8, 0)` | Promotion labels and out-of-stock status. |
| Delete | `semantic.delete` | `#ff4d4d` | Remove cart/payment actions. |
| Error red | `semantic.error` | `#dc3545` | Logout confirmation and destructive dialogs. |
| Link blue | `semantic.link` | `#007bff` | Back links and utility links. |

## Neutral Colors

| Role | Token | Current color |
| --- | --- | --- |
| Background | `neutral.white` | `#ffffff` |
| Surface subtle | `neutral.surface` | `#f9f9f9` |
| Surface muted | `neutral.muted` | `#f7f7f7` |
| Surface soft | `neutral.soft` | `#f4f4f4` |
| Border | `neutral.border` | `#ddd` |
| Border strong | `neutral.borderStrong` | `#ccc` |
| Text strong | `neutral.text` | `#333` |
| Text body | `neutral.textBody` | `#555` |
| Text muted | `neutral.textMuted` | `#7e8b99` |
| Text faint | `neutral.textFaint` | `#aaa` |
| Overlay | `neutral.overlay` | `rgba(0, 0, 0, 0.5)` |
| Shadow light | `neutral.shadowLight` | `rgba(0, 0, 0, 0.1)` |
| Shadow medium | `neutral.shadowMedium` | `rgba(0, 0, 0, 0.2)` |

## Usage Frequency Snapshot

Most repeated values in the current app:

| Color | Count |
| --- | ---: |
| `white` | 64 |
| `#af47d2` | 50 |
| `rgba(0, 0, 0, 0.1)` | 26 |
| `#f0dff5` | 25 |
| `#26355d` | 22 |
| `#ffffff` | 22 |
| `#ff8f00` | 20 |
| `#ddd` | 19 |
| `#ffdb00` | 10 |
| `gray` | 10 |

This confirms the core identity: purple primary, navy text/structure, lavender surfaces, amber/yellow action accents, and white cards.

## shadcn/ui Theme Mapping

Use this mapping as the first pass for `globals.css` theme variables. Keep exact syntax aligned with the shadcn/ui version installed during migration.

```css
:root {
  --background: #ffffff;
  --foreground: #26355d;

  --card: #ffffff;
  --card-foreground: #26355d;

  --popover: #ffffff;
  --popover-foreground: #26355d;

  --primary: #af47d2;
  --primary-foreground: #ffffff;

  --secondary: #f0dff5;
  --secondary-foreground: #26355d;

  --muted: #f9f3fc;
  --muted-foreground: #7e8b99;

  --accent: #ff8f00;
  --accent-foreground: #ffffff;

  --destructive: #dc3545;
  --destructive-foreground: #ffffff;

  --border: #dddddd;
  --input: #cccccc;
  --ring: #af47d2;

  --success: #4caf50;
  --warning: #ff9800;
  --brand-yellow: #ffdb00;
  --footer: #1f2b57;
  --footer-foreground: #ffffff;
}
```

## Tailwind Token Names

When defining custom Tailwind theme tokens, use names like:

```ts
colors: {
  brand: {
    navy: "#26355d",
    purple: "#af47d2",
    purpleHover: "#7a2eb5",
    actionPurple: "#a240de",
    lavender: "#f0dff5",
    lavenderSubtle: "#f9f3fc",
    lavenderMuted: "#f3e5f5",
    yellow: "#ffdb00",
  },
  accent: {
    amber: "#ff8f00",
    orange: "#ff9800",
    gold: "#fdb813",
  },
  footer: {
    navy: "#1f2b57",
    dark: "#0c1b37",
    slate: "#3b4a6b",
  },
}
```

## Migration Recommendations

- Use `#af47d2` as shadcn `primary`.
- Use `#26355d` as the main foreground and dark button/background alternative.
- Use `#f0dff5` and `#f9f3fc` for section and account surfaces.
- Use `#ff8f00` sparingly for high-emphasis CTAs like hero actions and add-to-cart.
- Use `#ffdb00` only as a brand highlight, not a general CTA.
- Replace generic named colors like `gray`, `red`, `blue`, `white`, and `black` with tokens during migration.
- Consolidate multiple close purple values only when behavior allows it. Keep `#af47d2`, `#7a2eb5`, and `#a240de` separate at first because they currently represent primary, hover, and header/cart accents.
- Check contrast before finalizing buttons that use amber/yellow backgrounds with white text.
