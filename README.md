# PrimeNG v18 Migration Tools

This repository contains scripts and tools to automate the migration process from PrimeNG v17 to v18, addressing breaking changes and providing an interactive experience for Angular developers.

## Breaking Changes Addressed

PrimeNG v18 introduces several breaking changes:

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

## Available Tools

This repository provides three different implementations to support various workflows:

### 1. JavaScript CLI Tool
- Interactive Node.js command-line tool
- `node scripts/node/primeng-migration-tool.js`
- Best for: Most developers looking for an interactive experience

### 2. Angular Schematics
- Integration with Angular CLI update process
- `ng generate ./scripts/schematic/primeng-schematics-migration:migrateToV18`
- Best for: CI/CD pipelines or Angular CLI integration

### 3. Bash Script
- Unix/Linux shell script implementation
- `bash scripts/bash/primeng-migration-bash.sh`
- Best for: Unix/Linux users who prefer bash scripting

## Documentation

- [PrimeNG v18 Migration Guide](docs/primeng18-migration.md) - Comprehensive guide to the migration process
- [Using Angular Schematics](docs/authoring-angular-schematics.md) - Guide to using and extending the Angular schematic
- [Schematic Setup Guide](docs/primeng-schematics-setup.md) - Setup instructions for the Angular schematic

## Getting Started

1. **Backup your project** or ensure you have a clean Git state
2. Choose the appropriate migration tool for your needs
3. Run the selected tool and follow the interactive prompts
4. Review the changes and run your application to verify the migration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.