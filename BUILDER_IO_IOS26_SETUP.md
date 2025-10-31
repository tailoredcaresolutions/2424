# Builder.io Setup - iOS 26 Liquid Glass Integration

## Overview

Configure Builder.io for visual editing while maintaining strict iOS 26/macOS 26 liquid glass design specifications.

---

## Step 1: Import Figma Designs

### Install Builder.io Figma Plugin

1. In Figma: **Plugins** → **Manage Plugins**
2. Search: "Builder.io"
3. Click **Save** to install

### Export to Builder.io

1. Select frames/components in Figma
2. Open Builder.io plugin
3. Click **Copy to Builder**
4. In Builder.io Visual Editor: **Cmd/Ctrl + V**

---

## Step 2: Map Components to Code

### Prerequisites

- Components must be exported from your codebase
- Props must be typed (TypeScript)
- Components must use iOS 26 liquid glass classes

### Mapping Process

1. In Figma, select component
2. Open Builder.io plugin
3. Click **Map** to generate command
4. Run command in codebase:
   ```bash
   builder map-figma-component [component-id]
   ```

### Component Requirements

Components must accept these props:
- `className?: string` - For additional styling
- `children?: React.ReactNode` - For content
- Component must use iOS 26 liquid glass classes

---

## Step 3: Configure Visual Editor Constraints

### Lock Glass Properties

In Builder.io Space Settings:

```javascript
// components/builder-config.ts
export const builderConfig = {
  components: {
    'LiquidGlassCard': {
      // Locked properties (cannot be edited visually)
      lockedProps: [
        'backdropFilter',
        'webkitBackdropFilter',
        'backgroundOpacity',
        'borderOpacity',
        'borderRadius',
        'boxShadow',
      ],
      // Editable properties
      editableProps: [
        'title',
        'content',
        'children',
        'className',
      ],
    },
  },
};
```

### Restrict Colors

Only allow approved iOS 26 palette:

```javascript
allowedColors: [
  '#1B365D', // Blue Primary
  '#0F1E3A', // Blue Dark
  '#030817', // Blue Deep
  '#122853', // Blue Mid
  '#4A6FA5', // Blue Light
  '#6B8FC7', // Blue Lighter
  '#D4A574', // Gold
  '#E3B888', // Gold Light
  '#C9A86A', // Gold Deep
  '#F5E8D8', // Gold Pale
],
```

### Restrict Spacing

Enforce 8px grid system:

```javascript
spacingGrid: 8, // All spacing must be multiples of 8px
minSpacing: 8,
maxSpacing: 64,
```

---

## Step 4: Create Builder.io Page Templates

### Template Structure

```typescript
// app/builder/[[...page]]/page.tsx (already exists)
import { builder } from '@builder.io/react';

export default async function BuilderPage({ params }: { params: { page: string[] } }) {
  const page = await builder
    .get('page', {
      userAttributes: {
        urlPath: '/' + (params?.page?.join('/') || ''),
      },
    })
    .toPromise();

  if (!page) {
    return <div>Page not found</div>;
  }

  return <builder.Component model="page" content={page} />;
}
```

### iOS 26 Page Wrapper

```typescript
// components/builder/IOS26PageWrapper.tsx
'use client';

import { BuilderComponent } from '@builder.io/react';

export function IOS26PageWrapper({ content }: { content: any }) {
  return (
    <div className="min-h-screen">
      {/* iOS 26 Liquid Glass Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-tcs-blue-deep via-tcs-blue-dark to-tcs-blue-primary" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-tcs-gold/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-tcs-blue-light/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Builder Content */}
      <BuilderComponent 
        model="page" 
        content={content}
        // Enforce iOS 26 specs on all Builder components
        context={{
          ios26Mode: true,
          liquidGlass: true,
        }}
      />
    </div>
  );
}
```

---

## Step 5: Register Components in Builder.io

### Register Liquid Glass Components

```typescript
// lib/builder/register-components.ts
import { builder } from '@builder.io/react';

// Register your liquid glass components
builder.registerComponent(LiquidGlassCard, {
  name: 'Liquid Glass Card',
  inputs: [
    {
      name: 'title',
      type: 'string',
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
  defaultStyles: {
    // Lock iOS 26 specs
    backdropFilter: 'blur(24px) saturate(180%)',
    webkitBackdropFilter: 'blur(24px) saturate(180%)',
    background: 'rgba(27, 54, 93, 0.6)',
    border: '1px solid rgba(75, 111, 165, 0.3)',
    borderRadius: '24px',
  },
});

builder.registerComponent(LiquidGlassButton, {
  name: 'Liquid Glass Button',
  inputs: [
    {
      name: 'text',
      type: 'string',
    },
    {
      name: 'variant',
      type: 'string',
      enum: ['blue', 'gold'],
      defaultValue: 'blue',
    },
  ],
  defaultStyles: {
    backdropFilter: 'blur(20px) saturate(180%)',
    webkitBackdropFilter: 'blur(20px) saturate(180%)',
    background: 'rgba(27, 54, 93, 0.6)',
    border: '1px solid rgba(75, 111, 165, 0.3)',
    borderRadius: '20px',
    minHeight: '44px',
    minWidth: '44px',
  },
});
```

---

## Step 6: Content Editing Workflow

### Allowed Edits

✅ **Content**:
- Text (title, descriptions, labels)
- Images
- Links
- Lists

✅ **Layout**:
- Spacing (8px grid only)
- Alignment
- Stack direction (column/row)

❌ **Locked** (iOS 26 specs):
- Glass blur values
- Background opacity
- Border properties
- Border radius
- Colors (must use approved palette)
- Shadows

---

## Step 7: Testing

### Validation Checklist

Before publishing any Builder.io page:

- [ ] All glass elements use correct blur values (12, 20, 24, or 32px)
- [ ] Background opacity is 0.05-0.7
- [ ] Border opacity is 0.2-0.4
- [ ] Border radius is 16, 20, or 24px
- [ ] All colors match approved palette
- [ ] Touch targets are minimum 44px × 44px
- [ ] Spacing uses 8px grid system
- [ ] Typography uses SF Pro fonts

---

## Usage

1. **Design in Figma** → Export to Builder.io
2. **Edit content visually** in Builder.io (glass specs locked)
3. **Preview** → Validate iOS 26 compliance
4. **Publish** → Deploy to production

---

**Builder.io is configured for iOS 26 liquid glass!** 🎨✨


