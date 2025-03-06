# CLAUDE.md - PrimeNG v18 Migration Tools

## Commands
- Run JavaScript migration tool: `node primeng-migration-tool.js`
- Run Bash migration script: `bash primeng-migration-bash.sh`
- Run Angular schematic: `ng generate ./primeng-schematics-migration.js:migrateToV18`

## Build Commands
- None specified, this repo consists of scripting tools

## Code Style Guidelines
- Use conventional commit messages: `refactor(primeng): [description of change]`
- Follow TypeScript best practices with proper typing
- Regular expressions carefully crafted to handle component/directive boundaries
- Keep whitespace and indentation consistent in the codebase
- Use comments to document complex migration operations or regex patterns
- Handle Git operations safely with error checking
- For UI interactions, always provide confirmation prompts before modifying files

## Major Migration Tasks
- Update PrimeNG module imports
- Rename component selectors (p-calendar → p-datepicker, etc.)
- Replace deprecated directives/components
- Update CSS classes that have been renamed or removed
- Manage git operations (stashing, committing)