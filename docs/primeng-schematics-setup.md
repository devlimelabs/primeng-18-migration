// collection.json - Define the schematics collection
{
  "$schema": "./node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "ng-update": {
      "description": "Updates PrimeNG from v17 to v18",
      "factory": "./src/ng-update/index#migrateToV18",
      "schema": "./src/ng-update/schema.json"
    },
    "update-modules": {
      "description": "Updates PrimeNG module imports",
      "factory": "./src/update-modules/index#updateModuleImports"
    },
    "update-css": {
      "description": "Updates PrimeNG CSS classes",
      "factory": "./src/update-css/index#updateCssClasses"
    },
    "update-properties": {
      "description": "Updates PrimeNG component properties",
      "factory": "./src/update-properties/index#updateComponentProperties"
    },
    "update-dialog": {
      "description": "Updates PrimeNG Dialog component",
      "factory": "./src/update-dialog/index#updateDialogComponent"
    },
    "update-selectbutton": {
      "description": "Updates PrimeNG SelectButton component",
      "factory": "./src/update-selectbutton/index#updateSelectButton"
    }
  }
}

// schema.json - Define the schema for the ng-update schematic
{
  "$schema": "http://json-schema.org/schema",
  "id": "PrimeNGMigrationSchematic",
  "title": "PrimeNG v17 to v18 Migration",
  "type": "object",
  "properties": {
    "interactive": {
      "type": "boolean",
      "description": "Whether to run the migration in interactive mode",
      "default": true
    }
  },
  "required": []
}

// package.json - Define the package for the schematics
{
  "name": "primeng-migration-schematics",
  "version": "1.0.0",
  "description": "Schematics to migrate from PrimeNG v17 to v18",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "npm run build && jasmine src/**/*_spec.js"
  },
  "keywords": [
    "schematics",
    "primeng",
    "migration"
  ],
  "schematics": "./collection.json",
  "ng-update": {
    "migrations": "./migration.json"
  },
  "dependencies": {
    "@angular-devkit/core": "^18.0.0",
    "@angular-devkit/schematics": "^18.0.0",
    "@angular/compiler": "^18.0.0",
    "@angular/compiler-cli": "^18.0.0",
    "@schematics/angular": "^18.0.0",
    "typescript": "~5.2.0"
  },
  "devDependencies": {
    "@types/node": "^16.11.10",
    "@types/jasmine": "~4.0.0",
    "jasmine": "^4.0.0"
  }
}

// tsconfig.json - TypeScript configuration for the schematics
{
  "compilerOptions": {
    "baseUrl": ".",
    "lib": ["es2018", "dom"],
    "declaration": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noUnusedParameters": true,
    "noUnusedLocals": true,
    "rootDir": "src",
    "skipDefaultLibCheck": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strictNullChecks": true,
    "target": "es6",
    "types": ["jasmine", "node"]
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*_spec.ts"]
}

// migration.json - Define migrations for ng-update
{
  "schematics": {
    "migration-v18": {
      "version": "18.0.0",
      "description": "Updates PrimeNG to v18",
      "factory": "./src/ng-update/index#migrateToV18"
    }
  }
}

// README.md - Instructions for using the schematics
# PrimeNG Schematics Setup Guide

This guide will help you set up and use the PrimeNG v18 migration schematic in your Angular project.

## Prerequisites

- Node.js 16.x or higher
- Angular CLI 18.x or higher
- PrimeNG v17.x installed in your project

## Installation

### Option 1: Install from NPM (when published)

```bash
npm install -g primeng-schematics-migration
```

### Option 2: Use Locally

1. Clone the repository:
```bash
git clone https://github.com/your-org/primeng-18-migration.git
cd primeng-18-migration/scripts/schematic
```

2. Install dependencies:
```bash
npm install
```

3. Build the schematic:
```bash
npm run build
```

## Usage

### Using with Angular CLI

From your Angular project root directory, run:

```bash
ng generate ./path/to/primeng-18-migration/scripts/schematic:migrateToV18
```

If you've installed the package globally:

```bash
ng generate primeng-schematics-migration:migrateToV18
```

### Available Options

You can customize the migration with the following options:

```bash
ng generate primeng-schematics-migration:migrateToV18 --skipGitCheck=true --skipCommit=true
```

- `--skipGitCheck`: Skip checking for unstaged Git changes (default: false)
- `--skipCommit`: Skip committing changes after migration (default: false)

## What the Schematic Does

The schematic performs the following migrations:

1. Updates PrimeNG dependency to v18 and PrimeFlex to v4 (if present)
2. Updates import paths for renamed components
3. Updates component selectors in templates
4. Updates CSS classes according to v18 changes
5. Updates component properties and APIs
6. Removes deprecated theme imports from angular.json
7. Updates directives to their new names

## Verification

After running the schematic, you should:

1. Review the changes made to your codebase
2. Run your application to verify it works correctly
3. Run your tests to ensure functionality is preserved

## Troubleshooting

If you encounter issues during migration:

1. Check the console output for warnings and errors
2. Review the changes made by the schematic
3. Consult the [PrimeNG v18 Migration Guide](https://primeng.org/migration/v18) for manual steps

## Contributing

Contributions to improve the schematic are welcome! Please submit a pull request with your changes.
