# PrimeNG Theming Migration Guide: v17 to v18/v19

This guide provides a comprehensive approach to migrating from PrimeNG v17's SASS-based theming system to the new design token-based architecture introduced in v18. It covers both incremental and full migration strategies, allowing you to choose the approach that best fits your project needs.

## Understanding the Changes

PrimeNG v18 introduced a complete overhaul of the theming system, moving from a SASS-based approach to a design token architecture powered by CSS variables. This is a fundamental change that affects how styles are defined, customized, and applied throughout your application.

### Key Differences

| Feature | v17 (Old) | v18+ (New) |
|---------|-----------|------------|
| **Base Technology** | SASS (.scss) files | CSS Variables & Design Tokens |
| **Theme Files** | Compiled CSS theme files | JavaScript token presets |
| **Customization** | Modifying SASS variables | Defining design tokens |
| **Import Method** | CSS import from `primeng/resources/themes/[theme]/theme.css` | JavaScript import from `@primeng/themes/[preset]` |
| **Runtime Changes** | Difficult (requires theme switching) | Easy with token manipulation functions |
| **Dark Mode** | Separate theme files | Built-in with CSS selectors |
| **Specificity Control** | No native solution (required ::ng-deep) | CSS Layers support |
| **Component Styling** | Global theme or ::ng-deep | Scoped tokens via `[dt]` property |

## Migration Strategies

There are two main approaches to migrate your theming:

1. **Incremental Migration** - Using "unstyled" mode with v17 themes temporarily
2. **Full Migration** - Complete transition to the design token system

## Strategy 1: Incremental Migration with Unstyled Mode

This approach allows you to continue using your existing v17 theme while gradually adopting the new token-based system.

### Step 1: Update PrimeNG and Theme Packages

```bash
# Update PrimeNG to v18
npm install primeng@18 --save

# Install theme packages
npm install @primeng/themes --save
```

### Step 2: Setup the Unstyled Configuration

In your Angular application config:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        providePrimeNG({
            // Configure with null preset for "unstyled" mode
            theme: null
        })
    ]
};
```

### Step 3: Keep Your Existing v17 Theme Imports

In your styles.css or styles.scss file, keep your existing theme import:

```css
/* Import your existing v17 theme */
@import 'primeng/resources/themes/lara-light-blue/theme.css';
@import 'primeng/resources/primeng.min.css';
```

> **Note:** The `primeng/resources` directory no longer exists in v18, but you can copy these files from your v17 project and include them in your assets.

### Step 4: Copy Theme Files from v17

1. Create a directory in your project (e.g., `src/assets/themes/`)
2. Copy your theme files from the node_modules of your v17 project
3. Update your imports to point to these local files

```css
/* styles.css */
@import './assets/themes/lara-light-blue/theme.css';
```

### Step 5: Gradually Migrate Components

As you work on different parts of your application, you can begin migrating specific components to use the new token system:

```typescript
// Example of migrating a specific component
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

// Create a preset for a specific component
const customButtonPreset = {
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            background: '#3B82F6',
            color: '#FFFFFF'
          }
        }
      }
    }
  }
};

@Component({
  selector: 'app-new-button',
  template: `<p-button label="New Button" [dt]="buttonTokens"></p-button>`,
  standalone: true,
  imports: [ButtonModule]
})
export class NewButtonComponent {
  buttonTokens = customButtonPreset.components.button;
}
```

## Strategy 2: Full Migration to Design Token System

This approach involves a complete transition to the new design token system.

### Step 1: Install Required Packages

```bash
npm install primeng@18 @primeng/themes --save
```

### Step 2: Remove Old Theme Imports

Remove all imports of v17 themes from your styles files:

```diff
- @import 'primeng/resources/themes/lara-light-blue/theme.css';
- @import 'primeng/resources/primeng.min.css';
```

### Step 3: Configure the New Theming System

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';  // Choose a preset

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    // Optional configuration
                    prefix: 'p',  // CSS variable prefix
                    darkModeSelector: '.my-app-dark'  // Selector for dark mode
                }
            }
        })
    ]
};
```

### Step 4: Create a Custom Preset (Optional)

If you had a custom theme in v17, you'll need to create a custom preset in v18:

```typescript
// mypreset.ts
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';  // Use as a base

const MyPreset = definePreset(Aura, {
    // Customize primary colors to match your v17 theme
    semantic: {
        primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',  // Primary color
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49'
        },
        // Add more customizations as needed
    }
});

export default MyPreset;
```

### Step 5: Implement Dark Mode Toggle (Optional)

If you need dark mode support:

```typescript
// dark-mode.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkMode.asObservable();

  constructor() {
    // Initialize from system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setDarkMode(prefersDark);
  }

  toggleDarkMode() {
    this.setDarkMode(!this.darkMode.value);
  }

  setDarkMode(isDark: boolean) {
    document.documentElement.classList.toggle('my-app-dark', isDark);
    this.darkMode.next(isDark);
  }
}
```

## Mapping v17 Theme Styles to v18 Design Tokens

If you had custom styling in v17, use this mapping table to find the equivalent in the v18 token system:

### Common Theme Variables

| v17 SASS Variable | v18 Design Token |
|-------------------|------------------|
| `$primaryColor` | `primary.color` |
| `$primaryLightColor` | `primary.300` |
| `$primaryDarkColor` | `primary.700` |
| `$primaryTextColor` | `primary.inverseColor` |
| `$fontFamily` | Define in your global CSS |
| `$fontSize` | Define in your global CSS |
| `$textColor` | `surface.800` (light) / `surface.0` (dark) |
| `$textSecondaryColor` | `surface.600` (light) / `surface.200` (dark) |
| `$borderRadius` | `borderRadius` |
| `$inputPadding` | `formField.padding` |
| `$errorColor` | `error.color` |

### Component-Specific Variables

| v17 Component Variable | v18 Component Token |
|------------------------|---------------------|
| `$buttonBg` | `button.background` |
| `$buttonTextColor` | `button.color` |
| `$buttonBorder` | `button.border.color` |
| `$buttonHoverBg` | `button.hover.background` |
| `$inputBg` | `formField.background` |
| `$inputTextColor` | `formField.color` |
| `$inputBorder` | `formField.border.color` |
| `$inputHoverBorderColor` | `formField.hover.border.color` |
| `$panelHeaderBg` | `panel.header.background` |
| `$panelHeaderTextColor` | `panel.header.color` |
| `$panelContentBg` | `panel.content.background` |
| `$panelContentTextColor` | `panel.content.color` |

## Handling Scoped Styles

### v17 Approach (with ::ng-deep)

```css
:host ::ng-deep .p-button {
  background-color: #ff5722;
  color: white;
}
```

### v18 Approach (with dt property)

```typescript
// Component TS
buttonTokens = {
  root: {
    background: '#ff5722',
    color: '#ffffff'
  }
};
```

```html
<!-- Component HTML -->
<p-button label="Custom Button" [dt]="buttonTokens"></p-button>
```

## Dark Mode Implementation

### v17 Approach

Switching entire theme files:

```typescript
// Theme switching service
@Injectable()
export class ThemeService {
  switchTheme(theme: string) {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `assets/themes/${theme}/theme.css`;
    }
  }
}
```

### v18 Approach

Using CSS selectors:

```typescript
// Toggle dark mode
toggleDarkMode() {
  document.documentElement.classList.toggle('my-app-dark');
}
```

## Common Migration Challenges

### 1. Custom Component Styles

If you have extensively customized component styles in v17, you may need to:

- Map each customization to the equivalent token
- Test each component after migration
- Use the component-specific `[dt]` property for localized styling

### 2. PrimeFlex Integration

If using PrimeFlex, ensure you update to v4:

```bash
npm install primeflex@4 --save
```

### 3. Global Styles

Review your global styles for any PrimeNG overrides that may conflict with the new token system.

### 4. Third-Party Theme Compatibility

If you were using a third-party PrimeNG theme, it will need to be rewritten as a preset for v18.

## Runtime Theme Manipulation

One of the biggest advantages of the new system is runtime theme manipulation:

```typescript
// Dynamic theme changes
import { updatePrimaryPalette, updatePreset } from '@primeng/themes';

// Change primary color
updatePrimaryPalette({
  500: '#FF5722',  // New primary color
  // Add other shades as needed
});

// Change component-specific styling
updatePreset({
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            borderRadius: '12px'
          }
        }
      }
    }
  }
});
```

## Conclusion

The transition from PrimeNG v17's SASS-based theming to v18's design token system represents a significant architectural change that brings many benefits, including:

- Better runtime customization
- Simplified dark mode implementation 
- Component-scoped styling without ::ng-deep
- More maintainable theme structure

Whether you choose an incremental or full migration approach depends on your project's size and complexity. The incremental approach offers a smoother transition but requires maintaining two styling systems temporarily. The full migration provides all the benefits immediately but requires more upfront work.

For most projects, the full migration is recommended as it leverages all the improvements of the new system and avoids technical debt. However, for large applications with extensive customizations, the incremental approach may be more practical.
