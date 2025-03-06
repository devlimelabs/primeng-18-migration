# CLAUDE.md - PrimeNG v18 Migration Schematic

## Build & Test Commands
- Build: `npm run build` (runs tsc -p tsconfig.json)
- Test all: `npm test` (builds and runs jasmine)
- Test single file: `npm run build && jasmine src/path/to/specific_spec.js`
- Lint: Not explicitly defined, consider adding ESLint

## Code Style Guidelines
- TypeScript with strict typing (noImplicitAny, strictNullChecks)
- Angular schematic patterns for code transformations
- Use descriptive variable names for migration tasks
- Regular expressions should handle component/selector boundaries properly
- Include comprehensive comments for complex migration logic
- Follow Angular's coding style for schematic development
- Use conventional commit format: "feat(primeng): migrate component X"
- Functions should follow single responsibility principle
- Error handling with meaningful user feedback
- Keep whitespace/indentation consistent throughout codebase

## Migration Tool Purpose
This schematic automates PrimeNG v17 to v18 migrations, including:
- Updating dependencies in package.json
- Converting module imports
- Renaming component selectors
- Updating CSS classes
- Modifying component properties
- Handling Git operations safely