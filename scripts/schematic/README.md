# PrimeNG v18 Migration Schematic

This Angular schematic automates the migration from PrimeNG v17 to v18, addressing the breaking changes introduced in PrimeNG v18.

## Installation

```bash
npm install -g @angular-devkit/schematics-cli
```

## Usage

From your Angular project root directory, run:

```bash
ng generate ./path/to/primeng-schematics-migration:migrateToV18
```

Or if you've installed the schematic globally:

```bash
ng generate primeng-schematics-migration:migrateToV18
```

## Options

- `--skipGitCheck`: Skip checking for unstaged Git changes (default: false)
- `--skipCommit`: Skip committing changes after migration (default: false)

## Breaking Changes Addressed

This schematic addresses the following breaking changes:

1. **Component Renames**
   - Calendar → DatePicker
   - Dropdown → Select
   - InputSwitch → ToggleSwitch
   - OverlayPanel → Popover
   - Sidebar → Drawer

2. **API Changes**
   - PrimeNGConfig replaced by providePrimeNG()
   - Message interface renamed to ToastMessageOptions
   - Dialog modal property replaced by closeOnEscape
   - Updated transition options syntax

3. **CSS Changes**
   - Removed utility classes (.p-link, .p-highlight, .p-fluid)
   - CSS class renames (p-component → p-element, p-inputtext → p-input)
   - Theme files moved from primeng/resources

4. **Other Changes**
   - Directive renames (pAnimate → pAnimateOnScroll)
   - Removal of pDefer in favor of Angular @defer
   - PrimeFlex compatibility updates

## Development

To build the schematic:

```bash
npm run build
```

To test the schematic:

```bash
npm test
```

## License

MIT 
