# PrimeNG v18 Migration Repository Structure

This document explains the organization of the PrimeNG v18 migration tools repository.

## Repository Organization

```
/
├── README.md                      # Project overview and getting started guide
├── CLAUDE.md                      # Information for agentic coding assistants
├── REPOSITORY_STRUCTURE.md        # This file - explains repo organization
│
├── docs/                          # Documentation
│   ├── primeng18-migration.md     # Comprehensive migration guide
│   ├── authoring-angular-schematics.md  # Guide to creating Angular schematics
│   └── primeng-schematics-setup.md      # Schematic configuration guide
│
└── scripts/                       # Migration scripts in various implementations
    ├── node/                      # Node.js implementation
    │   └── primeng-migration-tool.js    # Interactive CLI tool
    │
    ├── bash/                      # Bash script implementation
    │   └── primeng-migration-bash.sh    # Shell script for Unix/Linux
    │
    └── schematic/                 # Angular schematic implementation
        └── primeng-schematics-migration.js  # Angular schematics
```

## Implementation Approaches

This repository contains three different implementations of the migration tools:

1. **Node.js CLI Tool** (`scripts/node/primeng-migration-tool.js`)
   - Interactive command-line tool
   - Uses JavaScript with Node.js APIs
   - Provides comprehensive prompts and confirmations
   - Most versatile and recommended for general use

2. **Bash Script** (`scripts/bash/primeng-migration-bash.sh`)
   - Unix/Linux shell script 
   - Uses standard Unix tools (grep, sed)
   - Good for users who prefer shell scripting
   - More limited than the Node.js version but simpler to understand

3. **Angular Schematic** (`scripts/schematic/primeng-schematics-migration.js`)
   - Integrates with Angular CLI
   - Can be run as part of `ng update` process
   - Designed for CI/CD pipelines
   - Most suitable for automation

## Usage Instructions

See the [README.md](README.md) for complete usage instructions for each implementation.

## Migration Coverage

All implementations aim to cover the same set of breaking changes:

- Component renames (Calendar → DatePicker, etc.)
- CSS class updates and removals
- Module import path changes
- Component property changes
- Dialog API changes
- Directive renames
- Interface renames
- Dependency updates
- Theme configuration changes

Some complex changes (like PrimeNGConfig → providePrimeNG) require manual intervention after the automated migration.