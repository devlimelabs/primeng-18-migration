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
# PrimeNG v17 to v18 Migration Schematics

This package provides Angular schematics to migrate your project from PrimeNG v17 to v18.

## Installation

```bash
npm install -g primeng-migration-schematics
```

## Usage

### Automated Migration

To run the complete migration:

```bash
ng update primeng --migrate-only --from=17 --to=18
```

Or use the schematics directly:

```bash
ng generate primeng-migration-schematics:ng-update
```

### Individual Migration Steps

You can also run individual migration steps:

```bash
# Update module imports
ng generate primeng-migration-schematics:update-modules

# Update CSS classes
ng generate primeng-migration-schematics:update-css

# Update component properties
ng generate primeng-migration-schematics:update-properties

# Update Dialog component
ng generate primeng-migration-schematics:update-dialog

# Update SelectButton component
ng generate primeng-migration-schematics:update-selectbutton
```

## Features

- Updates module imports
- Updates CSS classes
- Updates component properties
- Updates Dialog component API
- Updates SelectButton component
- Git integration (stashing and committing changes)
