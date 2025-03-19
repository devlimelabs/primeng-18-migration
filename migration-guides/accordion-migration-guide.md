# PrimeNG Accordion Migration Guide (v17 to v18)

This guide provides a detailed comparison between PrimeNG v17 and v18 Accordion components and offers step-by-step instructions for migrating your implementation.

## Component Structure Changes

### Major Change: Component API

The most significant change in v18 is the component structure. In v17, the Accordion used a 2-component system:
- `p-accordion` - Main container 
- `p-accordionTab` - Individual accordion panels

In v18, this has been changed to a 3-component system:
- `p-accordion` - Main container
- `p-accordion-panel` - Individual accordion panels
- `p-accordion-header` - Header of the accordion panel
- `p-accordion-content` - Content of the accordion panel

### Basic Usage Comparison

**v17:**
```html
<p-accordion [activeIndex]="0">
    <p-accordionTab header="Header I">
        <p>Lorem ipsum dolor sit amet...</p>
    </p-accordionTab>
</p-accordion>
```

**v18:**
```html
<p-accordion value="0">
    <p-accordion-panel value="0">
        <p-accordion-header>Header I</p-accordion-header>
        <p-accordion-content>
            <p>Lorem ipsum dolor sit amet...</p>
        </p-accordion-content>
    </p-accordion-panel>
</p-accordion>
```

## Key Property Changes

### 1. Selection Model Change

The selection model has changed from using `activeIndex` (numeric index) to using a more flexible `value` property:

**v17:**
```html
<p-accordion [activeIndex]="0">
    <!-- Tabs are referenced by index -->
</p-accordion>
```

**v18:**
```html
<p-accordion value="0">
    <!-- Panels are referenced by custom value -->
    <p-accordion-panel value="0">
        <!-- Panel with matching value will be expanded -->
    </p-accordion-panel>
</p-accordion>
```

### 2. Multiple Selection

While both versions support multiple selection, the handling of active items has changed:

**v17:**
```html
<p-accordion [multiple]="true" [activeIndex]="[0]">
    <!-- Multiple tabs can be active -->
</p-accordion>
```

**v18:**
```html
<p-accordion [multiple]="true" [value]="['0']">
    <!-- Multiple panels can be active -->
</p-accordion>
```

### 3. Header Definition

Headers are now defined as separate components rather than properties:

**v17:**
```html
<p-accordionTab header="Header I">
    <!-- Content here -->
</p-accordionTab>
```

**v18:**
```html
<p-accordion-panel value="0">
    <p-accordion-header>Header I</p-accordion-header>
    <p-accordion-content>
        <!-- Content here -->
    </p-accordion-content>
</p-accordion-panel>
```

### 4. Icon Customization

The approach to customizing icons has changed:

**v17:**
```html
<p-accordion expandIcon="pi pi-plus" collapseIcon="pi pi-minus">
    <!-- Using properties on the accordion -->
</p-accordion>
```

**v18:**
```html
<p-accordion-panel>
    <p-accordion-header>
        <ng-template #toggleicon let-active="active">
            @if (active) {
                <i class="pi pi-minus"></i>
            } @else {
                <i class="pi pi-plus"></i>
            }
        </ng-template>
        Header Text
    </p-accordion-header>
</p-accordion-panel>
```

## Component Property Mapping

### Accordion Component

| v17 Property | v18 Property | Notes |
|--------------|--------------|-------|
| `[activeIndex]` | `[value]` | Changed from index-based to value-based |
| `[multiple]` | `[multiple]` | Still exists but different defaults |
| `[style]` | `[style]` | Same usage |
| `[styleClass]` | `[styleClass]` | Same usage |
| `[expandIcon]` | Icon templating | Now uses template approach |
| `[collapseIcon]` | Icon templating | Now uses template approach |
| `[headerAriaLevel]` | `[headerAriaLevel]` | Same usage |
| `[selectOnFocus]` | `[selectOnFocus]` | Same usage |

### AccordionTab / AccordionPanel

| v17 AccordionTab | v18 AccordionPanel | Notes |
|------------------|-------------------|-------|
| `[header]` | N/A | Replaced by `<p-accordion-header>` component |
| `[selected]` | N/A | Selection is managed by parent accordion's `value` |
| `[disabled]` | `[disabled]` | Same usage |
| `[headerStyle]` | N/A | Use CSS or properties on `<p-accordion-header>` |
| `[headerStyleClass]` | N/A | Use CSS or properties on `<p-accordion-header>` |
| `[contentStyle]` | N/A | Use CSS or properties on `<p-accordion-content>` |
| `[contentStyleClass]` | N/A | Use CSS or properties on `<p-accordion-content>` |
| `[transitionOptions]` | Moved to parent | Now on the `<p-accordion>` component |
| N/A | `[value]` | New in v18, assigns an identifier to the panel |

## Step-by-Step Migration Guide

### Step 1: Update the Component Structure

Replace your accordion markup with the new component structure:

```html
<!-- Before (v17) -->
<p-accordion>
    <p-accordionTab header="Header I">
        <p>Content</p>
    </p-accordionTab>
</p-accordion>

<!-- After (v18) -->
<p-accordion>
    <p-accordion-panel value="0">
        <p-accordion-header>Header I</p-accordion-header>
        <p-accordion-content>
            <p>Content</p>
        </p-accordion-content>
    </p-accordion-panel>
</p-accordion>
```

### Step 2: Update Value/Selection Model

Change from index-based selection to value-based selection:

```typescript
// Before (v17)
activeTabIndex: number = 0;

// After (v18)
activeTabValue: string = '0';
```

```html
<!-- Before (v17) -->
<p-accordion [activeIndex]="activeTabIndex">
    <!-- Tabs -->
</p-accordion>

<!-- After (v18) -->
<p-accordion [(value)]="activeTabValue">
    <!-- Panels with values -->
</p-accordion>
```

### Step 3: Update Multiple Selection

If using multiple selection, update the model to use value-based arrays:

```typescript
// Before (v17)
activeTabs: number[] = [0, 1];

// After (v18)
activePanels: string[] = ['0', '1'];
```

```html
<!-- Before (v17) -->
<p-accordion [multiple]="true" [activeIndex]="activeTabs">
    <!-- Tabs -->
</p-accordion>

<!-- After (v18) -->
<p-accordion [multiple]="true" [(value)]="activePanels">
    <!-- Panels with values -->
</p-accordion>
```

### Step 4: Update Dynamic Content Generation

Update your ngFor loops:

```html
<!-- Before (v17) -->
<p-accordion>
    <p-accordionTab *ngFor="let tab of tabs; let i = index" [header]="tab.title">
        {{ tab.content }}
    </p-accordionTab>
</p-accordion>

<!-- After (v18) -->
<p-accordion>
    @for (tab of tabs; track tab.value) {
        <p-accordion-panel [value]="tab.value">
            <p-accordion-header>{{ tab.title }}</p-accordion-header>
            <p-accordion-content>
                {{ tab.content }}
            </p-accordion-content>
        </p-accordion-panel>
    }
</p-accordion>
```

### Step 5: Update Custom Headers

If you have custom header templates, migrate them to the new structure:

```html
<!-- Before (v17) -->
<p-accordionTab>
    <ng-template pTemplate="header">
        <span class="flex align-items-center gap-2">
            <i class="pi pi-user"></i>
            <span>Custom Header</span>
        </span>
    </ng-template>
    <p>Content</p>
</p-accordionTab>

<!-- After (v18) -->
<p-accordion-panel value="0">
    <p-accordion-header>
        <span class="flex items-center gap-2">
            <i class="pi pi-user"></i>
            <span>Custom Header</span>
        </span>
    </p-accordion-header>
    <p-accordion-content>
        <p>Content</p>
    </p-accordion-content>
</p-accordion-panel>
```

### Step 6: Update Icon Customization

If you've customized icons, migrate to the new templating approach:

```html
<!-- Before (v17) -->
<p-accordion expandIcon="pi pi-plus" collapseIcon="pi pi-minus">
    <!-- Tabs -->
</p-accordion>

<!-- After (v18) -->
<p-accordion>
    <p-accordion-panel>
        <p-accordion-header>
            <ng-template #toggleicon let-active="active">
                @if (active) {
                    <i class="pi pi-minus"></i>
                } @else {
                    <i class="pi pi-plus"></i>
                }
            </ng-template>
            Header Text
        </p-accordion-header>
        <p-accordion-content>
            <!-- Content -->
        </p-accordion-content>
    </p-accordion-panel>
</p-accordion>
```

### Step 7: Update Event Handling

If you've used events like `activeIndexChange`, update to use the new event system:

```html
<!-- Before (v17) -->
<p-accordion (activeIndexChange)="onActiveIndexChange($event)">
    <!-- Tabs -->
</p-accordion>

<!-- After (v18) -->
<p-accordion (valueChange)="onValueChange($event)">
    <!-- Panels -->
</p-accordion>
```

## Angular Syntax Updates

PrimeNG v18 aligns with the latest Angular syntax changes:

1. Replace `*ngFor` with `@for` loop syntax
2. Replace `*ngIf` with `@if` conditional syntax 
3. Use the modern two-way binding for value: `[(value)]` instead of separate `[value]` and `(valueChange)`

## CSS Classes and Styling Updates

The CSS classes have changed in v18:

| v17 Class | v18 Class | Purpose |
|-----------|-----------|---------|
| `p-accordion-tab` | `p-accordionpanel` | Individual panel |
| `p-accordion-header` | `p-accordionheader` | Header element |
| `p-accordion-toggle-icon` | `p-accordionheader-toggle-icon` | Toggle icon |
| `p-accordion-content` | `p-accordioncontent` | Content wrapper |
| N/A | `p-accordioncontent-content` | Content element |

If you've applied custom CSS using these selectors, update them accordingly.

## Common Migration Issues

1. **Missing Values**: The most common issue is forgetting to add the `value` attribute to each panel. Every panel must have a unique value.

2. **Multiple Selection**: The default for `multiple` is different in v18, which may change the behavior if not explicitly set.

3. **Template Structure**: The 3-component structure in v18 requires all components to be properly nested.

4. **Event Handling**: Changed event names and payloads can cause issues if not updated.

## Example: Complete Before and After

**Before (v17):**
```html
<p-accordion [activeIndex]="activeIndex" (activeIndexChange)="activeIndex = $event">
    <p-accordionTab *ngFor="let item of items; let i = index" 
                   [header]="item.header" 
                   [disabled]="item.disabled">
        <ng-template pTemplate="content">
            <p>{{item.content}}</p>
        </ng-template>
    </p-accordionTab>
</p-accordion>
```

**After (v18):**
```html
<p-accordion [(value)]="activeValue">
    @for (item of items; track item.id) {
        <p-accordion-panel [value]="item.id" [disabled]="item.disabled">
            <p-accordion-header>{{item.header}}</p-accordion-header>
            <p-accordion-content>
                <p>{{item.content}}</p>
            </p-accordion-content>
        </p-accordion-panel>
    }
</p-accordion>
```

## Conclusion

The PrimeNG v18 Accordion component has been completely redesigned with a more flexible and component-based approach. While the migration requires significant changes to your templates, the new version offers better flexibility, cleaner code structure, and alignment with modern Angular practices.
