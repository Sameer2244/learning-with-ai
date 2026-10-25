// Curated Design System Topics for Senior / Staff Frontend Developers
// Covers Design Tokens, Component Architecture, Accessibility (a11y), Styling Engines,
// Tooling, Monorepos, Governance, Performance, and System Design Interview Case Studies.

module.exports = [
  {
    id: "ds-tokens-architecture",
    category: "1. Design Tokens Architecture & Engineering",
    badge: "Tokens & Theming",
    description: "Deep dive into 3-tier token hierarchies, W3C DTCG standards, token transform pipelines, naming taxonomies, and modern color spaces.",
    topics: [
      {
        id: "three-tier-tokens",
        title: "Three-Tier Token Architecture (Global, Semantic, Component)",
        tag: "Token Architecture",
        summary: "Architecting a scalable design token hierarchy separating raw values (primitives) from intent (semantic alias) and component scoped tokens.",
        importance: "Without a 3-tier system, theming, dark mode, and multi-brand support break down into chaotic find-and-replace disasters across thousands of components.",
        mentalModel: "Tokens follow a strict unidirectional dependency graph: Component Tokens reference Semantic Tokens, which reference Global Primitive Tokens, which hold raw literal values (hex, rem, ms). Never allow components to reference global tokens directly.",
        traps: "Exposing global tokens directly to component authors (e.g., `color: var(--blue-500)` instead of `color: var(--color-interactive-primary)`), which prevents dark mode or brand rebranding without rewriting component CSS.",
        interviewQuestions: [
          "How would you design a token hierarchy that supports dark mode and multiple sub-brands without duplicating component code?",
          "What are the trade-offs of having a 3-tier token system versus a flat 2-tier system?"
        ],
        defaultGuide: `## 🏛️ Core Mental Model: The 3-Tier Design Token Hierarchy

In enterprise design systems (like Adobe Spectrum, Shopify Polaris, GitHub Primer), design tokens are structured into a strict **three-tier unidirectional dependency graph**:

\`\`\`
[ Tier 1: Global / Primitive Tokens ]
  e.g., --color-blue-500: #0284c7; --space-4: 16px; --font-sans: 'Inter';
              ▲
              │ referenced by
[ Tier 2: Semantic / Alias Tokens (Intent-driven) ]
  e.g., --color-bg-surface: var(--color-neutral-900);
        --color-action-primary: var(--color-blue-500);
        --color-text-danger: var(--color-red-600);
              ▲
              │ referenced by
[ Tier 3: Component-Scoped Tokens ]
  e.g., --btn-primary-bg: var(--color-action-primary);
        --btn-primary-padding: var(--space-3) var(--space-4);
        --input-border-error: var(--color-text-danger);
\`\`\`

### 1. Tier 1: Global / Primitive Tokens
- **Purpose**: Literal constants defining the entire palette of options available to the design system.
- **Characteristics**: Agnostic of meaning or context. They have no concept of dark mode or interactive states.
- **Example**:
  \`\`\`css
  :root {
    --palette-neutral-0: #ffffff;
    --palette-neutral-100: #f1f5f9;
    --palette-neutral-900: #0f172a;
    --palette-blue-500: #0284c7;
    --palette-blue-600: #0369a1;
  }
  \`\`\`

### 2. Tier 2: Semantic / Alias Tokens (Context & Intent)
- **Purpose**: Map primitives to semantic intent (surface, text, action, border, feedback).
- **Dark Mode & Theming**: **Theming lives entirely in Tier 2.** To switch to Dark Mode or Brand B, you only redefine Tier 2 variables. Tier 1 and Tier 3 stay completely unchanged!
- **Example**:
  \`\`\`css
  :root[data-theme="light"] {
    --color-surface-base: var(--palette-neutral-0);
    --color-text-primary: var(--palette-neutral-900);
    --color-action-interactive: var(--palette-blue-500);
  }

  :root[data-theme="dark"] {
    --color-surface-base: var(--palette-neutral-900);
    --color-text-primary: var(--palette-neutral-100);
    --color-action-interactive: var(--palette-blue-400);
  }
  \`\`\`

### 3. Tier 3: Component Tokens (Encapsulation & Override Points)
- **Purpose**: Provide local styling hooks for specific components without leaking internal implementation details.
- **Example**:
  \`\`\`css
  .ds-button--primary {
    /* Component token default */
    --btn-bg: var(--color-action-interactive);
    --btn-text: var(--color-surface-base);

    background-color: var(--btn-bg);
    color: var(--btn-text);
  }
  \`\`\`

---

## ⚠️ The Senior Interview Trap & Production Anti-Patterns
1. **Token Proliferation**: Creating a token for every single CSS rule until you have 5,000 unmaintainable tokens.
2. **Global Leakage**: Allowing engineers to use \`color: var(--palette-blue-500)\` in component code. When a rebrand or dark mode is requested, every single component breaks.
3. **Circular Dependencies**: Allowing Semantic tokens to reference Component tokens or vice versa.

---

## 🗣️ How to Pitch This in a Senior/Staff Frontend Interview
> *"I structure design tokens into three clean layers: Global Primitives, Semantic Aliases, and Component Tokens. By isolating theming and dark mode strictly within the Semantic Alias layer, we can support multi-brand and dark theme switching at zero component code modification cost. Component tokens serve as targeted CSS Custom Property extension points for consumers."*`
      },
      {
        id: "w3c-dtcg-spec",
        title: "W3C DTCG Standard & Token Taxonomies (CTI)",
        tag: "Token Architecture",
        summary: "The W3C Design Tokens Community Group specification, `$value` and `$type` schemas, and Category-Type-Item (CTI) naming taxonomies.",
        importance: "The W3C DTCG format has become the universal JSON schema standard across Figma, Tokens Studio, Style Dictionary, and enterprise tooling.",
        mentalModel: "DTCG standardizes token representation in JSON using `$value`, `$type`, and `$description`. Combined with Category-Type-Item (CTI) structuring, tools can reliably transform tokens into CSS variables, Android XML, and iOS Swift.",
        traps: "Inventing proprietary ad-hoc JSON formats for tokens that cannot be ingested by modern design tools or Style Dictionary transforms.",
        interviewQuestions: [
          "How does the W3C DTCG specification enable automated design-to-code syncing between Figma and frontend codebases?",
          "Explain the CTI (Category-Type-Item) naming structure and how it prevents collision in large multi-team systems."
        ],
        defaultGuide: `## 📜 W3C Design Tokens Community Group (DTCG) Standard

The W3C DTCG format standardizes design token definition in JSON so that designers in Figma and engineers in React/CSS share a single source of truth:

\`\`\`json
{
  "color": {
    "brand": {
      "primary": {
        "$value": "#0284c7",
        "$type": "color",
        "$description": "Primary brand color for primary CTA buttons and active states"
      }
    }
  },
  "spacing": {
    "sm": {
      "$value": "8px",
      "$type": "dimension"
    },
    "md": {
      "$value": "16px",
      "$type": "dimension"
    }
  }
}
\`\`\`

### CTI (Category, Type, Item) Taxonomy
CTI organizes tokens into a deterministic hierarchy:
1. **Category**: High-level domain (\`color\`, \`font\`, \`size\`, \`motion\`, \`elevation\`).
2. **Type**: Specific subset (\`surface\`, \`text\`, \`border\`, \`icon\`).
3. **Item**: The distinct component or element (\`button\`, \`card\`, \`dialog\`).
4. **Sub-item / State**: Variant or interactive state (\`primary\`, \`hover\`, \`disabled\`).

\`\`\`
Taxonomy Formula: {category}-{type}-{item}-{subitem}-{state}
Example: color-background-button-primary-hover
\`\`\``
      },
      {
        id: "style-dictionary-pipelines",
        title: "Token Transformation Pipelines with Style Dictionary & Design Sync",
        tag: "Token Pipelines",
        summary: "Automating cross-platform token compilation to CSS variables, SCSS, TypeScript declarations, Android XML, and iOS Swift using Style Dictionary v4.",
        importance: "Senior developers must build resilient CI/CD pipelines that pull design changes from Figma/GitHub, validate them, and distribute compiled token packages with zero manual copy-pasting.",
        mentalModel: "Tokens in JSON -> Style Dictionary Parses & Filters -> Transforms (px to rem, hex to oklch) -> Formats (CSS, TS, iOS, Android) -> Artifacts published to npm and mobile repositories.",
        traps: "Manually updating CSS variables when designs change, leading to token drift between Figma libraries and code.",
        interviewQuestions: [
          "Walk me through the pipeline that takes a token change in Figma Tokens Studio and lands it in production npm packages.",
          "How do you handle breaking token changes in Style Dictionary without breaking legacy consumers?"
        ],
        defaultGuide: `## ⚙️ Style Dictionary v4 Token Pipeline

Style Dictionary is the industry-standard build system for design tokens created by Amazon. It transforms a single JSON token catalog into platform-specific outputs:

\`\`\`javascript
// style-dictionary.config.js
import StyleDictionary from 'style-dictionary';

export default {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: { outputReferences: true }
      }]
    },
    typescript: {
      transformGroup: 'js',
      buildPath: 'dist/ts/',
      files: [{
        destination: 'tokens.ts',
        format: 'javascript/es6'
      }]
    }
  }
};
\`\`\`

### Automated CI/CD Sync Loop
1. Designer edits token in **Figma Tokens Studio** and commits to token repo.
2. **GitHub Action** triggers:
   - Runs **Style Dictionary** build.
   - Validates WCAG contrast ratios via automated script.
   - Generates typed \`@company/tokens\` npm package.
   - Creates a pull request with visual diff screenshots.`
      },
      {
        id: "color-spaces-oklch",
        title: "Modern Color Spaces: OKLCH, Display P3 & Perceptual Uniformity",
        tag: "Color Science",
        summary: "Why modern design systems are abandoning sRGB/hex in favor of OKLCH for perceptually uniform color palettes, accessible contrast calculations, and wide-gamut Display P3.",
        importance: "In sRGB/hex, 50% yellow looks bright white while 50% blue looks pitch dark. OKLCH fixes this with independent Lightness (L), Chroma (C), and Hue (H) ensuring predictable accessible contrast across all hues.",
        mentalModel: "OKLCH separates Lightness (0-100%), Chroma (saturation), and Hue (0-360 deg). Increasing hue from 0 to 360 keeps perceived lightness identical, enabling algorithmic palette generation with guaranteed WCAG contrast.",
        traps: "Assuming hex #808080 or HSL lightness 50% has the same human perceived luminance across different colors. It does not.",
        interviewQuestions: [
          "Why is OKLCH superior to HSL and Hex for building automated multi-shade design system color palettes?",
          "How do you safely support wide-gamut Display P3 colors with fallback for older browsers?"
        ],
        defaultGuide: `## 🎨 OKLCH: The Modern Color Standard for Design Systems

Traditional color spaces (sRGB, HEX, HSL) are not **perceptually uniform**:
- \`hsl(60, 100%, 50%)\` (Yellow) has perceived lightness of ~93%.
- \`hsl(240, 100%, 50%)\` (Blue) has perceived lightness of ~18%.

In **OKLCH** (\`oklch(Lightness Chroma Hue)\`), Lightness represents actual perceived human luminance:
\`\`\`css
/* Perceptually identical brightness across blue and yellow */
--blue-500: oklch(0.65 0.18 245);
--yellow-500: oklch(0.65 0.18 95);
\`\`\`

### Algorithmic Palette Scaling
With OKLCH, creating accessible 100-900 color scales can be computed programmatically:
\`\`\`css
:root {
  --hue-brand: 250;
  --chroma-brand: 0.16;

  --color-100: oklch(0.95 var(--chroma-brand) var(--hue-brand));
  --color-300: oklch(0.80 var(--chroma-brand) var(--hue-brand));
  --color-500: oklch(0.60 var(--chroma-brand) var(--hue-brand));
  --color-700: oklch(0.40 var(--chroma-brand) var(--hue-brand));
  --color-900: oklch(0.20 var(--chroma-brand) var(--hue-brand));
}
\`\`\``
      }
    ]
  },
  {
    id: "ds-component-architecture",
    category: "2. Component Architecture & API Design",
    badge: "API Architecture",
    description: "Designing resilient, ergonomic component APIs: Compound Components, Slot pattern, Polymorphic 'as' props, Headless UI primitives, and Controlled vs Uncontrolled state.",
    topics: [
      {
        id: "compound-components",
        title: "Compound Components & Context Isolation Pattern",
        tag: "Component API",
        summary: "Structuring multi-part components (Tabs, Accordions, Selects, Dialogs) that share implicit state without prop-drilling.",
        importance: "The compound component pattern is the foundational API structure for all enterprise UI libraries (Radix, Chakra, Material UI).",
        mentalModel: "Parent component exposes internal state and handlers through an isolated React Context. Sub-components consume that context and render their specialized roles with complete compositional freedom for the consumer.",
        traps: "Exposing a single massive component with 50 configuration props (\`<Tabs tabs={[{title, content, disabled, icon}]} />\`) instead of composable compound primitives.",
        interviewQuestions: [
          "How would you design a composable Tabs component using the Compound Component pattern?",
          "How do you prevent unnecessary re-renders in compound components when child components share context?"
        ],
        defaultGuide: `## 🧩 Compound Components Pattern

Instead of configuring a complex component through a monolithic array of props:

### ❌ Anti-Pattern: Configuration Prop Explosion
\`\`\`tsx
<Tabs
  items={items}
  defaultActiveTab={0}
  tabPosition="top"
  renderCustomTabHeader={(item) => <CustomHeader item={item} />}
  renderTabContent={(item) => <CustomBody item={item} />}
/>
\`\`\`

### ✅ Production-Grade Compound Pattern
\`\`\`tsx
<Tabs defaultValue="account">
  <Tabs.List aria-label="Manage account">
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">
    <AccountSettingsForm />
  </Tabs.Content>
  <Tabs.Content value="password">
    <PasswordSettingsForm />
  </Tabs.Content>
</Tabs>
\`\`\`

### Architecture & Implementation
1. **Isolated Context**: Create \`TabsContext\` scoped strictly to the parent \`Tabs\` instance.
2. **Compound Namespacing**: Attach sub-components as static properties (\`Tabs.List\`, \`Tabs.Trigger\`, \`Tabs.Content\`) or export them as named sub-modules for tree-shaking.`
      },
      {
        id: "slot-pattern-composition",
        title: "The Slot Pattern & Polymorphic `asChild` API",
        tag: "Component API",
        summary: "Allowing consumers to merge component behavior and props into custom elements or Next.js/React Router Link components using Radix UI's Slot architecture.",
        importance: "Solves the classic 'Button that needs to be an \`<a>\` or Next.js \`<Link>\`' problem cleanly without DOM wrapper pollution or invalid HTML nesting.",
        mentalModel: "The Slot component clones its direct child and merges its own props, event handlers, and refs onto that child rather than rendering its own DOM element.",
        traps: "Rendering an \`<a>\` tag inside a \`<button>\` tag (invalid HTML) or nesting multiple interactive focusable elements.",
        interviewQuestions: [
          "Explain how the `asChild` pattern works in Radix UI and how it compares to the traditional polymorphic `as` prop.",
          "How do you merge event handlers and refs safely when cloning elements in a Slot primitive?"
        ],
        defaultGuide: `## 🔀 The Slot Pattern & \`asChild\` Architecture

In traditional React components, rendering a button styled as a link often led to:
\`\`\`tsx
<Button as="a" href="/dashboard">Dashboard</Button>
\`\`\`
However, TypeScript typing for polymorphic \`as\` props is notoriously complex, slow for the TypeScript compiler, and fragile with custom router links.

### The Radix UI \`asChild\` Approach
When \`asChild\` is true, the component does NOT render its own DOM node. Instead, it clones its direct child and merges props:

\`\`\`tsx
import { Slot } from '@radix-ui/react-slot';

export const Button = ({ asChild, children, className, ...props }) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp className={mergeClassNames('btn-base', className)} {...props}>
      {children}
    </Comp>
  );
};

// Usage with Next.js Link:
<Button asChild variant="primary">
  <Link href="/settings">Settings</Link>
</Button>
// Renders clean single <a class="btn-base" href="/settings">Settings</a>
\`\`\`

### Prop & Ref Merging Mechanics
The Slot merges:
- **ClassNames**: Concatenates outer and inner classes.
- **Event Handlers**: Calls both handlers in sequence unless \`event.defaultPrevented\` is flagged.
- **Refs**: Uses a \`mergeRefs\` utility supporting both callback refs and \`useRef\` objects.`
      },
      {
        id: "headless-ui-architecture",
        title: "Headless UI Primitives Architecture (Radix, Ark UI, React Aria)",
        tag: "Component Architecture",
        summary: "Decoupling logic, keyboard navigation, and accessibility (headless) from visual styling and branding.",
        importance: "Modern enterprise design systems are built on headless primitives to guarantee 100% WCAG compliance while giving design teams absolute styling freedom.",
        mentalModel: "Headless primitives provide the state machine, ARIA attributes, and keyboard listeners. The design system layer provides tokens, layout, and visual styling.",
        traps: "Building complex interactive components like Combobox, Date Picker, or Dialog from scratch instead of relying on battle-tested headless primitives.",
        interviewQuestions: [
          "What are the architectural benefits and trade-offs of building on top of Headless UI libraries versus building completely custom components?",
          "How do headless primitives manage focus traps, keyboard navigation, and virtual announcements?"
        ],
        defaultGuide: `## 🧠 Headless UI Architecture

Headless UI separates concerns into two distinct layers:
1. **Behavioral Engine (Headless)**: ARIA roles, states, focus loops, keyboard handlers, touch interactions, portal mounting.
2. **Presentation Layer (Design System)**: Colors, typography, spacing tokens, animations, themes.

\`\`\`
+------------------------------------------------+
|  Your Enterprise Design System (Tokens, CSS)  |
+------------------------------------------------+
                       ▲
                       │ Styles & Composes
+------------------------------------------------+
|  Headless Engine (Radix / Ark UI / React Aria) |
|  - WAI-ARIA 1.2 keyboard event listeners       |
|  - Roving tabindex & Focus traps              |
|  - State machines & Portals                   |
+------------------------------------------------+
\`\`\`

### Production Benefits
- **Zero Accessibility Debt**: Every keyboard shortcut (Escape, Arrow Up/Down, Home, End) is pre-implemented per WAI-ARIA standards.
- **Styling Agnostic**: Compatible with Tailwind, CSS Modules, Vanilla Extract, or standard CSS variables.
- **Fast Development Velocity**: Your team focuses on design tokens and branding rather than debugging modal backdrop scroll locks.`
      },
      {
        id: "controlled-uncontrolled-sync",
        title: "Controlled vs Uncontrolled State Synchronization & Custom Hooks",
        tag: "Component API",
        summary: "Designing dual-mode components supporting both uncontrolled (defaultValue) and controlled (value + onChange) with zero glitches.",
        importance: "Design system components must work seamlessly in both simple uncontrolled forms and complex controlled state management libraries like React Hook Form.",
        mentalModel: "Use a custom hook (`useControllableState`) that checks whether `value !== undefined`. If controlled, reflect the prop; if uncontrolled, maintain internal state.",
        traps: "Switching from uncontrolled to controlled during component lifecycle, triggering React warnings and unexpected state resets.",
        interviewQuestions: [
          "How do you implement a `useControllableState` hook that cleanly handles both controlled and uncontrolled modes?",
          "Why is an uncontrolled-by-default architecture better for design system performance?"
        ],
        defaultGuide: `## 🔄 Dual-Mode Component State: \`useControllableState\`

Every high-quality design system input, switch, or accordion primitive must support both **controlled** and **uncontrolled** usage without breaking:

\`\`\`tsx
function useControllableState<T>({
  value: valueProp,
  defaultValue,
  onChange
}: {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}) {
  const isControlled = valueProp !== undefined;
  const [internalState, setInternalState] = useState<T | undefined>(defaultValue);

  const value = isControlled ? valueProp : internalState;

  const setValue = useCallback((updater: T | ((prev: T) => T)) => {
    if (!isControlled) {
      setInternalState(updater);
    }
    const nextVal = typeof updater === 'function' ? (updater as Function)(value) : updater;
    onChange?.(nextVal);
  }, [isControlled, onChange, value]);

  return [value, setValue] as const;
}
\`\`\``
      }
    ]
  },
  {
    id: "ds-accessibility-wcag",
    category: "3. Accessibility (a11y) & WCAG 2.2 AAA Compliance",
    badge: "Accessibility",
    description: "Enterprise accessibility architecture: focus traps, roving tabindex, ARIA APG patterns, color contrast algorithms, and automated testing.",
    topics: [
      {
        id: "focus-management-traps",
        title: "Focus Management Architecture: Traps, Restoration & Roving Tabindex",
        tag: "Accessibility",
        summary: "Managing keyboard focus across modals, drawers, dropdowns, and menus with focus trapping and focus restoration.",
        importance: "Keyboard traps and lost focus after closing modals are among the top accessibility audit failures that lead to lawsuits and broken user experiences.",
        mentalModel: "When a modal opens, trap focus within its boundary by cycling Tab from last element to first. When the modal closes, restore focus back to the exact element that triggered it.",
        traps: "Failing to restore focus to the trigger button when a modal or drawer unmounts, dumping the user at the top of the body.",
        interviewQuestions: [
          "How do you implement a focus trap in a Dialog component without causing infinite loops?",
          "Explain the difference between Roving Tabindex and `aria-activedescendant` for managing focus in menus and lists."
        ],
        defaultGuide: `## 🎯 Focus Management Architecture

Accessible focus management requires three critical invariants:

### 1. Focus Trapping (Modals / Drawers)
When an overlay dialog mounts:
- Automatically focus the first interactive element or the dialog container itself.
- Listen for \`Tab\` and \`Shift + Tab\`.
- If on the last focusable element and pressing \`Tab\`, loop focus back to the first.
- If on the first focusable element and pressing \`Shift + Tab\`, loop focus back to the last.
- Mark all external DOM elements with \`aria-hidden="true"\` or use the modern HTML \`inert\` attribute.

### 2. Focus Restoration
Save \`document.activeElement\` before the modal opens in a ref:
\`\`\`tsx
const triggerRef = useRef<HTMLElement | null>(null);

function openModal() {
  triggerRef.current = document.activeElement as HTMLElement;
  setIsModalOpen(true);
}

function closeModal() {
  setIsModalOpen(false);
  // Restore focus to trigger
  requestAnimationFrame(() => {
    triggerRef.current?.focus();
  });
}
\`\`\`

### 3. Roving Tabindex vs \`aria-activedescendant\`
- **Roving Tabindex**: Only the currently active item has \`tabindex="0"\`; all other sibling items have \`tabindex="-1"\`. Arrow keys move focus by updating the \`tabindex\` and calling \`.focus()\`. Ideal for toolbars, tabs, and radio groups.
- **aria-activedescendant**: Focus stays on the parent input container; arrow keys change the \`aria-activedescendant="item-id"\` attribute. Ideal for autocomplete comboboxes where user types in an input while navigating suggestions.`
      },
      {
        id: "wcag-apca-contrast",
        title: "Color Contrast Standards: WCAG 2.2 AA/AAA vs APCA Algorithm",
        tag: "Accessibility",
        summary: "Understanding mathematical contrast ratios, why WCAG 2 contrast ratios fail in dark mode, and how the APCA algorithm provides accurate readability.",
        importance: "A design system's token choices determine the legal compliance of every product in the company.",
        mentalModel: "WCAG 2.1 requires 4.5:1 for normal text and 3:1 for large text/UI borders. APCA (Advanced Perceptual Contrast Algorithm) in WCAG 3 calculates spatial frequency, weight, and polarity (light-on-dark vs dark-on-light).",
        traps: "Assuming 4.5:1 contrast is always legible regardless of font weight; thin font weights (100-300) fail readability even with high numeric contrast.",
        interviewQuestions: [
          "What are the limitations of the WCAG 2.1 contrast formula, and how does APCA address them?",
          "How do you automate contrast checking across your design tokens during CI/CD?"
        ],
        defaultGuide: `## 👁️ Contrast Standards & APCA

### WCAG 2.2 Standards
- **Normal Text (< 18pt or < 14pt bold)**: Minimum **4.5:1** (Level AA), **7:1** (Level AAA).
- **Large Text (≥ 18pt or ≥ 14pt bold)**: Minimum **3:1** (Level AA), **4.5:1** (Level AAA).
- **UI Components & Graphical Objects**: Minimum **3:1** against adjacent colors.

### Why WCAG 2 Fails in Dark Mode
The WCAG 2.1 contrast formula \`(L1 + 0.05) / (L2 + 0.05)\` is symmetrical, meaning it treats white text on black the same as black text on white.
In human vision:
- White text on black causes **halation** (blurring around white letters).
- Pure black on pure white causes glare.

### APCA (Advanced Perceptual Contrast Algorithm)
APCA calculates a Lightness Contrast score (\`Lc\` from -108 to +106) taking into account:
1. Font weight and font size.
2. Background ambient brightness.
3. Contrast polarity (dark-on-light vs light-on-dark).`
      },
      {
        id: "wai-aria-apg-patterns",
        title: "WAI-ARIA Authoring Practices (APG) for Complex Primitives",
        tag: "Accessibility",
        summary: "Implementing authoritative WAI-ARIA keyboard navigation and role semantics for Dialogs, Comboboxes, Accordions, and Menus.",
        importance: "Senior developers must build components that assistive technologies (JAWS, NVDA, VoiceOver) can traverse predictably without confusion.",
        mentalModel: "ARIA is a contract between the DOM and assistive technologies. Rule #1 of ARIA: Do not use ARIA if a native HTML element (like \`<button>\` or \`<dialog>\`) already provides that behavior.",
        traps: "Using \`<div onClick={...}>\` and attaching \`role=\"button\"\` without implementing Space and Enter keyboard listeners and focus management.",
        interviewQuestions: [
          "Explain the First Rule of ARIA and provide a concrete design system example where developers break it.",
          "What ARIA roles, states, and properties are required for an accessible Combobox?"
        ],
        defaultGuide: `## ♿ WAI-ARIA Authoring Practices (APG)

### Essential ARIA Roles & State Mappings
| Component | Roles | Key ARIA Attributes | Keyboard Requirements |
| :--- | :--- | :--- | :--- |
| **Dialog** | \`role="dialog"\` | \`aria-modal="true"\`, \`aria-labelledby\`, \`aria-describedby\` | \`Escape\` closes, \`Tab\` cycles inside |
| **Accordion** | \`role="region"\` | \`aria-expanded="true/false"\`, \`aria-controls\` | \`Enter\` / \`Space\` toggles, Arrow navigation |
| **Tabs** | \`tablist\`, \`tab\`, \`tabpanel\` | \`aria-selected\`, \`aria-controls\`, \`tabindex\` | Arrow Left/Right switches active tab |
| **Combobox** | \`role="combobox"\` | \`aria-autocomplete\`, \`aria-controls\`, \`aria-activedescendant\` | Arrow Down opens list, \`Escape\` dismisses |

### Key WAI-ARIA Invariants
1. **Never override native semantics**: Don't put \`role="presentation"\` on an interactive button.
2. **Dynamic Live Regions**: Use \`aria-live="polite"\` for non-urgent status updates (e.g., search results count) and \`aria-live="assertive"\` for critical error alerts.`
      }
    ]
  },
  {
    id: "ds-styling-css",
    category: "4. Styling Engines & CSS Architecture at Scale",
    badge: "CSS Architecture",
    description: "Evaluating CSS variables runtime theming, Zero-runtime CSS-in-JS (StyleX, Panda, Vanilla Extract), Cascade Layers (@layer), and container queries.",
    topics: [
      {
        id: "css-variables-runtime",
        title: "CSS Custom Properties (Variables) Runtime Theming Engine",
        tag: "CSS Architecture",
        summary: "Architecting a high-performance, dynamic runtime theming engine powered by CSS Custom Properties.",
        importance: "CSS variables enable zero-JS theme switching, inherited styling, and scoped component overrides without runtime CSS-in-JS re-render penalties.",
        mentalModel: "CSS variables cascade down the DOM tree. Defining `--theme-bg: white` on `:root` and changing it to `--theme-bg: black` on `.dark` instantly repaints the page without executing a single line of React code.",
        traps: "Over-relying on JS state to trigger CSS-in-JS style recalculations when native CSS custom properties can handle 100% of the style mutation.",
        interviewQuestions: [
          "How do CSS Custom Properties outperform runtime CSS-in-JS libraries like Emotion and Styled-Components in large enterprise applications?",
          "How do you provide fallback values for CSS variables in design systems?"
        ],
        defaultGuide: `## ⚡ CSS Custom Properties Runtime Theming

Runtime CSS-in-JS (Styled Components, Emotion) was popular for years, but in large applications it causes:
- **JS Thread Blocking**: Parsing CSS strings into JS objects on every render.
- **Style Invalidation**: Injecting \`<style>\` tags dynamically forces the browser to re-calculate styles across the entire page.

### The CSS Custom Properties Advantage
\`\`\`css
/* High-performance zero-runtime theming */
:root {
  --ds-surface: #ffffff;
  --ds-text: #0f172a;
}

[data-theme="dark"] {
  --ds-surface: #0f172a;
  --ds-text: #f8fafc;
}

.card {
  background-color: var(--ds-surface);
  color: var(--ds-text);
}
\`\`\`
Switching theme is as simple as \`document.documentElement.setAttribute('data-theme', 'dark')\`. No React re-renders, no CSS parsing overhead.`
      },
      {
        id: "zero-runtime-css-in-js",
        title: "Zero-Runtime CSS-in-JS (StyleX, Vanilla Extract, Panda CSS)",
        tag: "CSS Architecture",
        summary: "Compile-time CSS extraction, type-safe styles, atomic CSS deduplication, and zero runtime performance overhead.",
        importance: "Meta developed StyleX to power facebook.com and instagram.com with zero-runtime overhead while maintaining full TypeScript safety and predictable specificity.",
        mentalModel: "Styles are written in TypeScript/JavaScript but extracted at build time into static atomic CSS files with deterministic collision resolution.",
        traps: "Using dynamic template strings inside CSS-in-JS that prevent compile-time extraction and force fallback to slow runtime injection.",
        interviewQuestions: [
          "Compare Zero-Runtime CSS-in-JS (like Vanilla Extract / StyleX) with Tailwind CSS and CSS Modules.",
          "How does atomic CSS deduplication keep CSS bundle sizes sub-linear as the number of components grows?"
        ],
        defaultGuide: `## 🚀 Zero-Runtime CSS-in-JS Architecture

Zero-runtime styling engines combine the developer experience of CSS-in-JS (colocation, types, autocomplete) with the performance of static CSS:

\`\`\`
Authoring (TSX)                     Build Time                        Production Bundle
+--------------------+              +-------------------+             +--------------------+
| stylex.create({    |  ═══════>    | Babel/Vite Plugin |  ═══════>   | Static atomic.css  |
|   btn: {           |              | Extracts static   |             | (deduplicated)     |
|     padding: 8     |              | atomic classnames |             +--------------------+
|   }                |              +-------------------+
| })                 |
+--------------------+
\`\`\`

### Key Industry Solutions
1. **Meta StyleX**: Atomic CSS with deterministic resolution (last style applied wins, regardless of declaration order).
2. **Vanilla Extract**: \`.css.ts\` files that run in Node at build time and emit pure static CSS files.
3. **Panda CSS**: High-performance compile-time engine with design token first-class integration.`
      },
      {
        id: "cascade-layers-layer",
        title: "CSS Cascading Layers (`@layer`) for Specificity Management",
        tag: "CSS Architecture",
        summary: "Eliminating specificity wars and `!important` hacks across design systems and consumer applications using native `@layer`.",
        importance: "CSS Cascade Layers solve the #1 complaint of design system consumers: difficulty overriding component styles without escalating specificity.",
        mentalModel: "Layers defined earlier have lower priority than layers defined later, regardless of selector specificity. An element selector in a higher layer beats an ID selector in a lower layer.",
        traps: "Allowing consumer apps to sprinkle `!important` to override design system styles instead of establishing clear Cascade Layers.",
        interviewQuestions: [
          "How do CSS `@layer` rules work, and how do they eliminate specificity wars in design system component overrides?",
          "How should a design system organize its CSS cascade layers?"
        ],
        defaultGuide: `## 🛡️ CSS Cascading Layers (\`@layer\`)

Before Cascade Layers, overriding a component required escalating specificity:
\`\`\`css
/* Legacy battle: */
body #app .sidebar .ds-button.primary { ... }
\`\`\`

### The \`@layer\` Paradigm
With \`@layer\`, the order of layers determines priority, **trumping normal selector specificity**:

\`\`\`css
/* Define layer hierarchy explicitly: */
@layer reset, design-system, components, overrides;

/* 1. Design system layer */
@layer design-system {
  /* Even an ID selector here... */
  #my-button {
    background-color: var(--ds-color-primary);
  }
}

/* 2. Consumer override layer */
@layer overrides {
  /* ...is beaten by a simple class selector in a higher layer! */
  .custom-btn {
    background-color: hotpink; /* WINS! */
  }
}
\`\`\`

### Production Design System Architecture
Export your styles inside an explicit \`@layer design-system\`. This guarantees that consumers can override any component style effortlessly with simple classnames.`
      }
    ]
  },
  {
    id: "ds-theming-dark-mode",
    category: "5. Multi-Theme & Dark Mode Systems",
    badge: "Theming & Color",
    description: "SSR-safe theme switching, flash of unstyled content (FOUC) prevention, surface elevation systems, and high contrast modes.",
    topics: [
      {
        id: "preventing-fouc-foit",
        title: "SSR-Safe Theme Switching & Eradicating Theme Flash (FOUC)",
        tag: "Theming",
        summary: "Preventing the dreaded white flash when a user with Dark Mode enabled loads an SSR/Next.js/Remix web application.",
        importance: "Theme flashing (FOUC) creates a jarring, unpolished experience and is an immediate red flag in senior frontend technical interviews.",
        mentalModel: "Execute a tiny, synchronous blocking inline script in the `<head>` before any HTML renders to read `localStorage` or `matchMedia` and apply the `data-theme` attribute to `<html>`.",
        traps: "Using a `useEffect` hook to set the dark theme classname, which executes *after* the initial server-rendered HTML has already painted.",
        interviewQuestions: [
          "Why does setting theme in `useEffect` cause a flash of light mode, and how do you solve it in Next.js/SSR?",
          "How do you handle cookies vs localStorage for theme persistence in edge-rendered applications?"
        ],
        defaultGuide: `## 🌓 Preventing the Dark Mode Flash (FOUC)

### ❌ The Junior Mistake: \`useEffect\` Theming
\`\`\`tsx
function App() {
  useEffect(() => {
    // RUNS AFTER FIRST PAINT!
    // Result: User sees blinding white screen for 200ms before dark theme kicks in!
    const saved = localStorage.getItem('theme');
    document.documentElement.dataset.theme = saved;
  }, []);
}
\`\`\`

### ✅ The Production Senior Architecture: Blocking Head Script
Inject an inline, blocking script in \`<head>\` before any CSS or body elements are evaluated:

\`\`\`html
<head>
  <script>
    (function() {
      try {
        var local = localStorage.getItem('theme');
        var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = local || (supportDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  </script>
</head>
\`\`\`
Because this runs synchronously before DOM construction and before first paint, the page renders with the correct dark palette on the very first frame.`
      },
      {
        id: "surface-elevation-dark-mode",
        title: "Surface Elevation, Shadows & Depth Systems in Dark Themes",
        tag: "Theming",
        summary: "Why drop shadows fail in dark mode and how to construct depth through surface lightness tiering.",
        importance: "In light mode, drop shadows simulate elevation. In dark mode, shadows are invisible against dark backgrounds, requiring a totally different elevation strategy.",
        mentalModel: "In dark mode, elevated surfaces become progressively lighter rather than casting darker shadows. Higher elevation = closer to ambient light source = higher lightness.",
        traps: "Applying the exact same black box-shadows in dark mode as light mode.",
        interviewQuestions: [
          "How do you represent depth and elevation in a dark theme when box-shadows are invisible?",
          "How would you structure elevation tokens to automatically adapt between light and dark modes?"
        ],
        defaultGuide: `## 🏔️ Surface Elevation in Dark Themes

In real-world physics, objects closer to a light source catch more light:

\`\`\`
Light Mode Elevation:            Dark Mode Elevation:
Surface remains white            Surface becomes lighter
Shadow becomes darker/diffuse    Borders catch subtle ambient rim-light
\`\`\`

### The Elevation Token Scale
\`\`\`css
:root[data-theme="light"] {
  --surface-base: #ffffff;
  --surface-raised: #ffffff;
  --surface-overlay: #ffffff;

  --elevation-1: 0 1px 3px rgba(0,0,0,0.1);
  --elevation-2: 0 4px 6px rgba(0,0,0,0.1);
  --elevation-3: 0 10px 15px rgba(0,0,0,0.15);
}

:root[data-theme="dark"] {
  /* Surfaces get progressively lighter as elevation rises */
  --surface-base: #090a0f;     /* 0dp - canvas */
  --surface-raised: #12141c;   /* 1dp - cards */
  --surface-overlay: #1b1e2b;  /* 8dp - dialogs & menus */

  /* Subtle border rim-lighting replaces heavy shadows */
  --elevation-1: inset 0 0 0 1px rgba(255,255,255,0.06);
  --elevation-2: inset 0 0 0 1px rgba(255,255,255,0.10), 0 4px 20px rgba(0,0,0,0.5);
  --elevation-3: inset 0 0 0 1px rgba(255,255,255,0.15), 0 12px 32px rgba(0,0,0,0.7);
}
\`\`\``
      }
    ]
  },
  {
    id: "ds-tooling-monorepo",
    category: "6. Tooling, Monorepo & Packaging Pipelines",
    badge: "Tooling & Infra",
    description: "Monorepo architectures (Turborepo/Nx), modern packaging (tsup, exports map, tree-shaking), and visual regression testing.",
    topics: [
      {
        id: "monorepo-changesets",
        title: "Monorepo Architecture & Changesets for UI Component Libraries",
        tag: "Infrastructure",
        summary: "Structuring an enterprise design system monorepo containing tokens, core components, react-aria primitives, and documentation with automated Changesets.",
        importance: "Enterprise systems cannot live in a single monolithic repo without automated versioning and dependency graph orchestration.",
        mentalModel: "Separate packages into discrete npm modules (`@ds/tokens`, `@ds/icons`, `@ds/primitives`, `@ds/react`, `@ds/docs`). Changesets tracks semantic bumps and generates accurate changelogs automatically.",
        traps: "Publishing a single monolithic package where updating an icon requires bumping and republishing all core components.",
        interviewQuestions: [
          "How would you structure a Design System monorepo using Turborepo and Changesets?",
          "How do you manage versioning when a token package update causes breaking changes in downstream component packages?"
        ],
        defaultGuide: `## 🏗️ Design System Monorepo Architecture

Enterprise design system monorepos (using Turborepo or Nx) are divided into focused packages:

\`\`\`
packages/
├── tokens/             # @ds/tokens (Style Dictionary source & compiled tokens)
├── icons/              # @ds/icons (SVG assets compiled to React components)
├── primitives/         # @ds/primitives (Unstyled headless building blocks)
├── react/              # @ds/react (Full styled component library)
└── docs/               # Next.js / Storybook documentation app
\`\`\`

### Automated Versioning with Changesets
Whenever an engineer opens a PR that modifies code, they run:
\`\`\`bash
pnpm changeset
\`\`\`
This prompts for:
- Which packages changed (\`patch\`, \`minor\`, or \`major\`)
- A human-readable changelog summary

On merge to \`main\`, a GitHub Action creates a **Version Packages** PR. Merging that PR automatically publishes the packages to npm and tags the git release.`
      },
      {
        id: "packaging-exports-treeshaking",
        title: "Modern Library Packaging: ESM/CJS, TypeScript & `package.json` Exports",
        tag: "Infrastructure",
        summary: "Compiling component libraries with tsup/Rollup, dual ESM/CJS distribution, sideEffects: false, and strict exports maps.",
        importance: "Poor library packaging can balloon consumer bundle sizes by megabytes and break SSR in Next.js or Vite.",
        mentalModel: "Use package.json `exports` to define sub-path imports (`import { Button } from '@ds/react/button'`). Mark `\"sideEffects\": false` so bundlers can tree-shake unused components.",
        traps: "Exporting all components from a single index.js with side-effects, forcing bundlers to bundle the entire library even if only one button was imported.",
        interviewQuestions: [
          "Explain how the `exports` map in package.json works and how it prevents consumers from accessing internal modules.",
          "How do you configure a design system package so that it is 100% tree-shakeable?"
        ],
        defaultGuide: `## 📦 Enterprise Library Packaging

### package.json Subpath Exports & Tree-Shaking
\`\`\`json
{
  "name": "@ds/react",
  "version": "2.4.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./button": {
      "types": "./dist/button/index.d.ts",
      "import": "./dist/button/index.js"
    },
    "./styles.css": "./dist/styles.css"
  }
}
\`\`\`

### Build Strategy with tsup
\`tsup\` builds TypeScript libraries with esbuild at blinding speeds:
\`\`\`javascript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/button/index.ts', 'src/dialog/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true
});
\`\`\``
      },
      {
        id: "visual-regression-pipelines",
        title: "Automated Visual Regression Testing Pipelines (Chromatic & Playwright)",
        tag: "Testing",
        summary: "Capturing pixel-by-pixel visual diffs across every component state, theme, viewport, and browser on every pull request.",
        importance: "Unit tests only test DOM logic. A visual regression test prevents unexpected CSS cascades from breaking button padding or hiding text.",
        mentalModel: "CI renders every Storybook story in headless Chrome/WebKit/Firefox, captures screenshots, and compares them against baseline snapshots with a perceptual diffing algorithm.",
        traps: "Testing animations or dynamic timestamps without freezing time or disabling CSS transitions, causing flaky false-positive test failures.",
        interviewQuestions: [
          "How do you implement a reliable visual regression testing pipeline without flaky diffs from animations or fonts?",
          "How do Chromatic and Playwright compare for design system visual regression testing?"
        ],
        defaultGuide: `## 📸 Automated Visual Regression Testing

Visual testing is mandatory for design systems because CSS changes have global side-effects:

\`\`\`
Developer PR -> GitHub Actions -> Build Storybook -> Chromatic/Playwright Captures Stories
                                                              │
                                                              ▼
                                                   Perceptual Pixel Diff
                                             [ Baseline ] vs [ PR Snapshot ]
                                                              │
                                                 ┌────────────┴────────────┐
                                                 ▼                         ▼
                                           No Diffs (Pass)          Diff Detected (Review)
\`\`\`

### Eliminating Flaky Snapshots
1. **Freeze System Clock**: Mock \`Date.now()\` and timers.
2. **Disable CSS Animations**:
   \`\`\`css
   *, *::before, *::after {
     transition: none !important;
     animation: none !important;
   }
   \`\`\`
3. **Wait for Web Fonts**: Use \`document.fonts.ready\` before capturing the screenshot.`
      }
    ]
  },
  {
    id: "ds-governance-adoption",
    category: "7. Governance, Adoption & Versioning",
    badge: "Governance & Scale",
    description: "Component lifecycle stages, automated AST codemod migrations, RFC processes, and telemetry adoption metrics.",
    topics: [
      {
        id: "component-lifecycle-governance",
        title: "Component Maturity Lifecycle: Alpha to Deprecated",
        tag: "Governance",
        summary: "Establishing clear maturity tiers (Proposal, Alpha, Beta, Stable, Deprecated) to balance fast innovation with enterprise stability.",
        importance: "Without a structured lifecycle, feature teams either fork components or complain that the design system team moves too slowly.",
        mentalModel: "Components graduate through defined quality gates: Proposal (RFC) -> Alpha (internal testing) -> Beta (opt-in pilot) -> Stable (100% test & a11y coverage) -> Deprecated (with codemod migration).",
        traps: "Releasing unvetted components directly as 'Stable', then introducing breaking changes 2 weeks later.",
        interviewQuestions: [
          "How do you balance rapid feature development with design system API stability?",
          "How do you deprecate a widely-used component without breaking 50 downstream feature teams?"
        ],
        defaultGuide: `## 🏛️ Component Maturity Lifecycle

Enterprise design systems use a standardized maturity rubric:

\`\`\`
[ 1. Proposal (RFC) ] -> [ 2. Alpha (Lab) ] -> [ 3. Beta ] -> [ 4. Stable ] -> [ 5. Deprecated ]
\`\`\`

| Stage | Package / Location | SLA / Guarantee | Breaking Changes? |
| :--- | :--- | :--- | :--- |
| **Proposal** | GitHub Discussion / RFC | Concept review | N/A |
| **Alpha / Lab** | \`@ds/lab\` | Experimental, early feedback | Frequent, zero deprecation notice |
| **Beta** | \`@ds/react/beta\` | Feature complete, real pilot testing | Allowed in minor bumps |
| **Stable** | \`@ds/react\` | 100% a11y, visual tests, semver | Only in Major bumps with 6-month notice |
| **Deprecated** | \`@ds/react\` | Maintenance only, provides codemod | No new features, scheduled for removal |`
      },
      {
        id: "ast-codemod-migrations",
        title: "Automated Breaking Change Migrations via AST Codemods (jscodeshift)",
        tag: "Governance",
        summary: "Writing automated JavaScript/TypeScript AST codemods with jscodeshift to migrate thousands of files when breaking API changes are unavoidable.",
        importance: "Staff frontend engineers don't ask 50 teams to manually refactor props; they ship an automated codemod that refactors their code in 10 seconds.",
        mentalModel: "Code -> AST Parser (Babel/Recast) -> Find Component Nodes -> Mutate Prop Names or Structure -> Code Generator (preserving formatting).",
        traps: "Using regex find-and-replace to migrate code, which breaks on multiline props, comments, and variable renames.",
        interviewQuestions: [
          "How would you use jscodeshift to automatically rename a deprecated prop across 10,000 files in a monorepo?",
          "Explain the AST transformation lifecycle."
        ],
        defaultGuide: `## 🤖 Automated AST Migrations with jscodeshift

When renaming a prop (e.g. \`variant=\"danger\"\` to \`intent=\"destructive\"\`), never ask developers to do it manually. Ship an AST codemod:

\`\`\`javascript
// codemods/v3-rename-danger-variant.js
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find all <Button /> JSX elements
  root.findJSXElements('Button').forEach(path => {
    const attributes = path.node.openingElement.attributes;

    attributes.forEach(attr => {
      if (attr.name && attr.name.name === 'variant' && attr.value.value === 'danger') {
        attr.name.name = 'intent';
        attr.value.value = 'destructive';
      }
    });
  });

  return root.toSource();
}
\`\`\`
Consumers simply run:
\`\`\`bash
npx @ds/codemods v3-rename-danger-variant src/
\`\`\``
      },
      {
        id: "adoption-telemetry-metrics",
        title: "Design System Adoption Telemetry & Health Analytics",
        tag: "Metrics",
        summary: "Measuring real-world component adoption, detached Figma instances, and raw HTML element usage across enterprise repositories.",
        importance: "Demonstrating design system ROI to executive leadership requires quantifiable adoption metrics and tech debt reduction data.",
        mentalModel: "Run static analysis scanners (ESLint plugins, custom AST crawlers) across all company codebases to track the ratio of `<Button>` imports vs raw `<button>` elements.",
        traps: "Assuming that because a package is installed in package.json, developers are actually using the design system components instead of raw HTML.",
        interviewQuestions: [
          "How do you measure and report the adoption rate and ROI of a design system to leadership?",
          "How would you write an ESLint rule to encourage design system component adoption without blocking developers?"
        ],
        defaultGuide: `## 📊 Measuring Design System Adoption

Senior and Staff engineers track three core adoption vectors:

### 1. The Adoption Ratio Metric
\`\`\`
Adoption Rate = Total Design System Components / (Design System Components + Raw HTML Primitives)
\`\`\`
Example: If an app has 800 \`<Button>\` uses and 200 raw \`<button>\` tags, its Button adoption rate is **80%**.

### 2. Static Analysis Crawler
Create a GitHub Action that runs weekly across all company repos:
- Scans AST for imports from \`@ds/react\`.
- Flags rogue inline CSS styles and raw HTML tags.
- Pushes metrics to a Datadog or Grafana dashboard.

### 3. ESLint Guided Adoption
Provide gentle suggestions rather than blocking builds:
\`\`\`javascript
// eslint-plugin-ds
'ds/prefer-button': 'warn' // "Prefer <Button> from @ds/react over native <button>"
\`\`\``
      }
    ]
  },
  {
    id: "ds-performance-scale",
    category: "8. Enterprise Performance & Scale",
    badge: "Performance",
    description: "DOM node optimization, paint containment, SVG icon architecture, font loading, and large dataset virtualization.",
    topics: [
      {
        id: "svg-icon-system-architecture",
        title: "SVG Icon System Architectures (Inline vs Sprites vs Icon Compilers)",
        tag: "Performance",
        summary: "Architecting an SVG icon library that balances bundle size, dynamic styling with `currentColor`, caching, and DOM performance.",
        importance: "Poor icon architectures are the #1 cause of massive JS bundle bloat in frontend applications.",
        mentalModel: "Inline SVGs allow dynamic CSS `fill: currentColor` and hover states but bloat the JS bundle. SVG sprite sheets cache across pages via HTTP but require network fetching. Icon compilers generate tree-shakeable individual component wrappers.",
        traps: "Shipping an icon library where importing one icon bundles all 1,500 SVGs into the user's bundle.",
        interviewQuestions: [
          "What are the pros and cons of SVG Sprites vs Inline SVG components vs Icon Fonts?",
          "How do you design an icon component that supports dynamic sizing, accessibility labels, and currentColor?"
        ],
        defaultGuide: `## 🎨 SVG Icon System Architectures

### Architectural Comparison
| Approach | Bundle Size Impact | Dynamic Styling (\`currentColor\`) | HTTP Caching | Tree-Shaking |
| :--- | :--- | :--- | :--- | :--- |
| **Inline React Components** | High (if not split) | ⭐⭐⭐ Native | ❌ In JS | ⭐⭐⭐ (if subpathed) |
| **SVG Sprite Sheet** | ⭐⭐⭐ Zero JS | ⭐⭐ Via \`<use>\` | ⭐⭐⭐ HTTP Cached | ⭐⭐⭐ Network fetch |
| **Icon Font** | ⭐⭐ Small | ⭐ Restricted | ⭐⭐⭐ HTTP Cached | ❌ All or nothing |

### Modern Senior Recommendation: Tree-Shakeable SVGR Compilers
Use SVGR to compile SVGs into individual ES module React components:
\`\`\`tsx
// @ds/icons/Check.js
export const CheckIcon = ({ size = 16, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
\`\`\``
      },
      {
        id: "dom-node-containment",
        title: "DOM Node Optimization & CSS Paint Containment (`contain: content`)",
        tag: "Performance",
        summary: "Minimizing DOM nesting and leveraging CSS containment to prevent full-page layout thrashing and reflows.",
        importance: "Deeply nested component abstractions destroy 60fps rendering in data-heavy enterprise dashboards.",
        mentalModel: "Every wrapper `<div class=\"box\"><div class=\"inner\">...` adds memory and style recalculation overhead. `contain: layout paint` tells the browser that internal layout changes will never affect external ancestors.",
        traps: "Creating 5 levels of wrapper divs for layout, padding, and focus outlines on every single button and input.",
        interviewQuestions: [
          "How does CSS `contain: content` optimize browser rendering in design system components?",
          "How do you audit and reduce unnecessary DOM depth across a component library?"
        ],
        defaultGuide: `## 🏎️ DOM Node Count & CSS Containment

### 1. Eliminating DOM Wrapper Hell
Instead of:
\`\`\`tsx
/* ❌ 4 DOM elements for a simple badge: */
<div class="badge-wrapper">
  <div class="badge-container">
    <span class="badge-content">Active</span>
  </div>
</div>
\`\`\`
Flatten into a single semantic element:
\`\`\`tsx
/* ✅ 1 clean semantic DOM element: */
<span class="ds-badge ds-badge--success">Active</span>
\`\`\`

### 2. CSS \`contain\` Property
When building complex components like Accordions, Cards, and Tables:
\`\`\`css
.ds-card {
  contain: content;
  /* Equivalent to: contain: layout paint style; */
}
\`\`\`
This tells the browser's Blink/Gecko layout engine:
*"Changes inside this card will never affect the size, layout, or paint of any element outside this card."*
The browser skips recalculating the rest of the entire page layout!`
      }
    ]
  },
  {
    id: "ds-system-design-interviews",
    category: "9. Staff / Senior System Design Interview Case Studies",
    badge: "Senior Interviews",
    description: "End-to-end design system architectural case studies commonly tested in Staff & Senior Frontend Engineer interviews.",
    topics: [
      {
        id: "design-system-from-scratch",
        title: "Architecture Case Study: Designing an Enterprise Design System from Zero",
        tag: "System Design",
        summary: "Step-by-step architectural blueprint for designing, scoping, and launching a design system across a 500+ engineer organization.",
        importance: "The quintessential Staff / Senior Frontend System Design interview question asked at Google, Meta, Stripe, and Airbnb.",
        mentalModel: "Structure the answer through: 1. Core Objectives & Requirements, 2. Design Token Architecture, 3. Component Architecture & Headless Primitives, 4. Monorepo & Build Pipeline, 5. Governance & Adoption Strategy.",
        traps: "Jumping straight into coding a Button without establishing token tiers, governance, accessibility, or build pipelines.",
        interviewQuestions: [
          "How would you architect a design system from scratch for an enterprise company with 50 product teams?",
          "How do you handle team resistance and drive adoption of a new design system?"
        ],
        defaultGuide: `## 🏛️ Senior Frontend System Design Interview: Enterprise Design System

### The 5-Phase Architectural Blueprint

#### Phase 1: Requirements & Scope Alignment
- **Consumers**: Web (React, Next.js), Mobile (React Native, iOS, Android), Email.
- **Key Goals**: 100% WCAG 2.2 AA compliance, zero-runtime styling overhead, automated multi-brand theming, sub-linear bundle growth.

#### Phase 2: Design Token Pipeline
- W3C DTCG JSON specifications stored in dedicated repo.
- Style Dictionary v4 transforms tokens to:
  - CSS Custom Properties (\`variables.css\`)
  - Typed TypeScript constants (\`tokens.ts\`)
  - Android XML and iOS Swift structs.
- 3-Tier Hierarchy: Global Primitives -> Semantic Aliases -> Component Tokens.

#### Phase 3: Component Architecture
- Built on top of headless primitives (Radix UI / Ark UI / React Aria).
- Compound Component API design with Slot (\`asChild\`) support.
- Zero-runtime CSS extraction with CSS Custom Properties runtime theming.

#### Phase 4: CI/CD & Testing Infrastructure
- Monorepo managed with Turborepo and pnpm.
- Automated visual regression testing with Chromatic and Playwright.
- Automated a11y testing with \`axe-core\` in Storybook interaction tests.

#### Phase 5: Adoption & Governance
- Semantic Versioning with Changesets.
- AST Codemods with \`jscodeshift\` for zero-friction breaking upgrades.
- Weekly telemetry tracking component adoption percentage.`
      },
      {
        id: "multi-brand-white-label",
        title: "White-Label Case Study: Multi-Brand Architecture for 10+ Distinct Brands",
        tag: "System Design",
        summary: "Architecting a white-label frontend where a single codebase dynamically renders 10+ distinct brand identities with unique fonts, palettes, and density.",
        importance: "Crucial for B2B SaaS platforms (Shopify, Zendesk, Salesforce) that allow customers to brand their customer portals.",
        mentalModel: "Separate brand identity (tokens) completely from layout and component logic. Inject brand-specific semantic CSS variables at the root based on tenant configuration.",
        traps: "Using `if (brand === 'BrandA')` conditionals inside component code. Brand logic must live exclusively in the token layer.",
        interviewQuestions: [
          "How do you architect a white-label design system supporting 10 distinct brands without shipping all 10 brand styles to every customer?",
          "How do you support custom font loading dynamically per tenant without causing layout shifts?"
        ],
        defaultGuide: `## 🏷️ Multi-Brand White-Label System Design

### ❌ Fatal Flaw: Brand Branching in Code
\`\`\`tsx
/* NEVER DO THIS: */
if (brand === 'BrandA') return <BrandAButton />;
if (brand === 'BrandB') return <BrandBButton />;
\`\`\`

### ✅ Production Senior Architecture: Pure Token Swapping
Components are 100% brand-agnostic. They only reference Semantic Tokens:

\`\`\`css
/* Component references intent: */
.ds-button {
  background: var(--brand-primary);
  border-radius: var(--brand-radius);
  font-family: var(--brand-font);
}
\`\`\`

### Tenant Token Injection
At runtime, the server or edge middleware detects the tenant domain and injects that tenant's compiled stylesheet:
\`\`\`html
<!-- Loaded dynamically based on subdomain: -->
<link rel="stylesheet" href="https://cdn.company.com/tokens/brand-acme.css">
\`\`\`
The exact same React bundle renders for Acme Corp as Cyberdyne Systems, with zero JavaScript overhead!`
      }
    ]
  }
];
