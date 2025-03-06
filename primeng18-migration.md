**Interactive Migration Script from PrimeNG v17 to v18**

Upgrading from PrimeNG **v17** to **v18** involves several breaking changes and deprecations. An interactive migration script can automate much of this process. Below is an outline and example implementation of an **Angular Schematics**\-based migration script that addresses the required steps. The script ensures a clean working state, lets the developer choose which changes to apply, previews file modifications, performs safe replacements, and commits each change with a Conventional Commit message.

**Features and Approach**

• **Git Safety Check**: Verifies a clean Git working directory (no unstaged changes) before running migrations. If local changes exist, it attempts to stash them for safety.

• **Interactive Step Selection**: Presents a menu of migration tasks (e.g. update imports, rename components, replace directives, update CSS classes) and lets the user choose which to run.

• **Preview of Changes**: For each selected task, the script searches relevant files (.ts, .html, .scss, etc.), lists affected files and occurrences, and asks for confirmation before applying changes.

• **Targeted Replacements**: Uses precise regex patterns (and optionally AST parsing) to replace deprecated PrimeNG v17 usages with v18 equivalents, minimizing false positives.

• **Incremental Commits**: After completing each migration task, the script stages the changes and creates a commit with a **Conventional Commit** style message (e.g. refactor: migrate p-calendar to p-datepicker).

• **Angular Schematics Integration**: Implemented as an Angular Schematic Rule, ensuring it can be run as part of Angular’s update process (e.g. via ng update). This makes it easy to maintain and extend for future PrimeNG versions.

**1\. Check Git Status (Clean Working Directory)**

Before making any changes, the script checks that the Git working directory is clean (no unstaged or uncommitted changes). This prevents accidental loss of work. If changes are present, the script will attempt to stash them:

• It runs git status --porcelain to detect modifications. If output is not empty, it executes git stash push -u to stash staged and unstaged changes.

• If stashing fails (e.g. if Git is not initialized or an error occurs), the script aborts with an error message to avoid proceeding unsafely.

**Code (Git check and stash)**: Using Node’s child\_process.execSync within the schematic to run Git commands. Example:

```
import { execSync } from 'child_process';

function ensureCleanGit() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim().length > 0) {
      console.log('Uncommitted changes detected. Stashing changes...');
      execSync('git stash push -u -m "primeng-v18-migration"', { stdio: 'inherit' });
      console.log('Changes stashed successfully.');
    }
  } catch (err) {
    throw new Error('❌ Git working directory not clean and auto-stash failed. Aborting migration.');
  }
}
```

In the schematic’s main function, call ensureCleanGit() at the start. This guarantees that the migration operates on a clean snapshot of the code.

**2\. Interactive Selection of Migration Steps**

Next, the script presents the user with a list of possible migration steps. Each step corresponds to a category of changes (imports update, component renames, directive replacements, CSS updates, etc.). The user can select one, many, or all steps to perform. This interactive prompt can be implemented using Angular Schematic prompts (via an x-prompt in the schema) or using a library like **Inquirer** for flexibility.

**Migration Steps Examples**:

• **Update Imports** – Update PrimeNG module import paths (e.g. primeng/calendar → primeng/datepicker).

• **Rename Component Selectors** – Update component tags in templates (e.g. <p-calendar> → <p-datepicker>).

• **Replace Deprecated Directives** – Replace or remove directives/components that are deprecated or removed (e.g. pAnimate → pAnimateOnScroll , remove pDefer in favor of Angular @defer ).

• **Adjust CSS Classes** – Remove or rename obsolete CSS classes (e.g. .p-link, .p-highlight, .p-fluid ).

Using **Schematics prompts** ensures the script can run in Angular CLI interactive mode. For example, in the schema.json for the schematic, you could define an option with "type": "array" of steps and an "x-prompt" to let the user pick from a list:

```
"properties": {
  "steps": {
    "type": "array",
    "description": "Which migration steps to run",
    "items": {
      "type": "string",
      "enum": ["updateImports", "renameComponents", "replaceDirectives", "updateCss"]
    },
    "x-prompt": {
      "message": "Select PrimeNG v18 migration steps to apply",
      "type": "multiselect"
    }
  }
}
```

Alternatively, using Inquirer in the code:

```
import * as inquirer from 'inquirer';
const choices = [
  { name: 'Update Imports (PrimeNG modules)', value: 'updateImports' },
  { name: 'Rename Component Selectors in templates', value: 'renameComponents' },
  { name: 'Replace Deprecated Directives/Components', value: 'replaceDirectives' },
  { name: 'Adjust Removed CSS classes (.p-link, .p-fluid, etc.)', value: 'updateCss' }
];
const answers = await inquirer.prompt([{
  type: 'checkbox', name: 'steps', message: 'Select migration steps to run:', choices
}]);
const selectedSteps: string[] = answers.steps;
```

The result is a list of steps that the user wants to execute. The script will iterate only over these selected tasks.

**3\. File Matching and Confirmation**

For each chosen migration step, the script searches the project files for occurrences that need to be changed. It uses the Angular DevKit **Tree** API to traverse files (or tree.visit() in a schematic). We filter for relevant file extensions (.ts, .html, .scss, .css, etc.) depending on the step:

• **Imports**: Search in TypeScript files for PrimeNG import paths (e.g. 'primeng/calendar').

• **Component selectors**: Search in Angular templates (HTML files or inline templates in TS) for tags like <p-calendar>.

• **Directives/Components**: Search in templates for deprecated component tags or directive attributes (pAnimate, <p-defer>).

• **CSS classes**: Search in any component templates or style files for strings like class="...p-fluid..." or .p-link in styles.

The script counts how many files and how many occurrences will be affected. It then **displays a summary** to the user, for example:

• _“Found 12 occurrences in 8 files where_ _<p-calendar>_ _is used.”_

• _“Found 1 file importing_ _primeng/calendar__.”_

• _“Found 3 usages of_ _.p-fluid_ _in 2 files.”_

It can even list the file paths (e.g., via context.logger.info in schematics). This preview allows the user to review what will change.

After the preview, the script prompts the user for confirmation (**yes/no**) before applying the replacements for that step. This can be a simple confirmation prompt (using an x-prompt of type confirmation or using inquirer/readline to ask). If the user declines, the script skips that migration step and moves on to the next selected step.

**Code (search and confirm)**:

```
function findOccurrences(tree: Tree, patterns: RegExp[]): { files: string[], totalMatches: number } {
  const files: string[] = [];
  let totalMatches = 0;
  tree.visit((filePath) => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.html') && !filePath.endsWith('.scss') && !filePath.endsWith('.css')) {
      return;
    }
    const content = tree.read(filePath)?.toString() || '';
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        totalMatches += matches.length;
        if (!files.includes(filePath)) {
          files.push(filePath);
        }
      }
    }
  });
  return { files, totalMatches };
}

// Example usage for component renames:
const { files, totalMatches } = findOccurrences(tree, [/<p-calendar\b/, /<\/p-calendar>/]);
if (totalMatches > 0) {
  context.logger.info(`Found ${totalMatches} occurrences in ${files.length} files for <p-calendar>.`);
  // (List files or a snippet of context if needed)
  const proceed = await confirm(`Replace <p-calendar> with <p-datepicker> in these files? [y/N]`);
  if (!proceed) { return; /* skip this step */ }
}
```

_(Here_ _confirm()_ _is a helper that prompts the user to confirm. It could use_ _inquirer.prompt({ type: 'confirm', ... })_ _or a simple Node readline for yes/no.)_

**4\. Perform Replacements with Regex Patterns**

Once the user confirms, the script performs the actual text replacements in each affected file. We use carefully chosen **regex patterns** to ensure we only replace the intended text:

• **Imports**: Replace old module import paths and names. For example, change import { CalendarModule } from 'primeng/calendar' to import { DatePickerModule } from 'primeng/datepicker'. This may involve two replacements: the module path and the symbol name. We know from PrimeNG v18 migration guide that _Calendar_ was renamed to _DatePicker_ , so the import path and module class follow that pattern.

• **Component Selectors**: Replace usages of deprecated tags in templates. E.g., <p-calendar> → <p-datepicker> (and corresponding closing tags). Similarly, <p-dropdown> → <p-select>, <p-inputSwitch> → <p-toggleSwitch>, <p-overlayPanel> → <p-popover>, <p-sidebar> → <p-drawer> (these reflect the renamed components ). We ensure the regex accounts for word boundaries so we don’t accidentally replace unrelated text.

• **Deprecated Directives/Components**: Simple one-to-one renames can be handled (e.g. attribute pAnimate → pAnimateOnScroll ). Removed components like <p-defer> might be handled by removing the tag or converting it to Angular’s @defer block (though full conversion may require manual adjustment). The script can at least flag or comment them. For instance, replace <p-defer> … </p-defer> with <!-- p-defer content, needs manual migration to @defer --> as a placeholder, or just alert the user.

• **CSS Classes**: Remove or replace classes that no longer exist. According to the PrimeNG v18 guide, the utility classes .p-link, .p-highlight, .p-fluid were removed . The script can delete these class names from HTML class attributes or from styles. For example, in an HTML template class="p-link my-button", it would remove p-link (leaving class="my-button"). In SCSS files, it might comment out or remove style rules targeting .p-link or .p-fluid to avoid broken styles.

**Code (applying replacements)**:

```
function replaceInFile(tree: Tree, filePath: string, replacements: { [pattern: string]: string }) {
  let content = tree.read(filePath)?.toString();
  if (!content) return;
  for (const [pattern, newText] of Object.entries(replacements)) {
    const regex = new RegExp(pattern, 'g');
    content = content.replace(regex, newText);
  }
  tree.overwrite(filePath, content);
}

// Example: perform replacement for Calendar -> DatePicker in each affected file
for (const filePath of files) {
  replaceInFile(tree, filePath, {
    '<p-calendar\\b': '<p-datepicker',            // opening tag
    '</p-calendar>': '</p-datepicker>',           // closing tag
    "from 'primeng/calendar'": "from 'primeng/datepicker'",  // import path
    '\\bCalendarModule\\b': 'DatePickerModule'    // module class name
  });
}
context.logger.info(`✅ Replaced Calendar with DatePicker in ${files.length} files.`);
```

Each migration task will have its own set of regex patterns and replacements. By using keys as regex strings (with escape sequences for special chars like \\b word boundary or to escape < in regex), we ensure only exact matches are replaced. For instance, <p-calendar\\\\b targets the <p-calendar tag specifically (the \\b ensures we match “<p-calendar” as a whole word). Similarly, module names are matched with word boundaries to avoid partial replacements.

**Accuracy**: If needed, the script could leverage TypeScript AST and Angular HTML parsers (via Angular DevKit) for more complex transformations (ensuring, for example, it only renames class names in class attributes). However, well-chosen regex patterns suffice for these structured naming changes.

**5\. Commit Changes After Each Step**

After applying the replacements for a given migration step, the script uses Git to create a commit. This keeps changes for each category isolated, which is helpful for review or rollback. The commit message follows the **Conventional Commits** format for consistency. We use the refactor: type (since we are modifying code without adding features or fixing bugs):

• The commit message describes the change, e.g.

_“refactor: rename p-calendar to p-datepicker (PrimeNG v18 migration)”_

or

_“refactor: update PrimeNG imports for renamed components”_.

Using child\_process again, the script stages the changes and commits:

```
function gitCommit(message: string) {
  try {
    execSync('git add -A', { stdio: 'ignore' });
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
  } catch {
    console.warn('⚠️ Git commit failed (maybe no changes to commit).');
  }
}

// After replacing Calendar->DatePicker:
gitCommit('refactor: migrate p-calendar to p-datepicker');
```

If a step results in no changes (e.g., the patterns were not found in the project), the commit step can be skipped or handled gracefully. Each commit will tag the changes in Git, making it easy to review differences per migration step.

**6\. Implementation via Angular Schematics**

The migration script is implemented as an **Angular Schematic** so that it can be distributed and run via the Angular CLI (for example, as part of ng update for PrimeNG). Angular Schematics provide a controlled way to manipulate files (using the virtual file tree and commit actions) and to prompt the user for input . The schematic can be part of a collection (e.g., primeng-migrate-18 in collection.json) and include a schema for inputs (like which steps to run).

The overall structure of the schematic code might look like this:

```
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { execSync } from 'child_process';
import * as inquirer from 'inquirer';

export function migratePrimengV18(_options: any): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    // Step 1: Git status check
    ensureCleanGit();

    // Step 2: Prompt for steps
    const stepChoices = [ /* ... as defined above ... */ ];
    const answers = await inquirer.prompt([{ /* ... prompt config ... */ }]);
    const steps: string[] = answers.steps;

    for (const step of steps) {
      switch (step) {
        case 'updateImports':
          // find import occurrences and confirm
          // perform replacements (e.g., update import paths and module names)
          // commit changes
          break;
        case 'renameComponents':
          // find template tag occurrences and confirm
          // perform replacements (component tags)
          // commit changes
          break;
        case 'replaceDirectives':
          // find deprecated directive/component usage and confirm
          // perform replacements or insert warnings
          // commit changes
          break;
        case 'updateCss':
          // find removed CSS class usage and confirm
          // perform removal/replacement
          // commit changes
          break;
      }
    }

    context.logger.info('🎉 PrimeNG v18 migration completed.');
    return tree;
  };
}
```

Each case in the switch would contain the logic (or calls to helper functions) for that migration step, as discussed in Steps 3–5. By structuring it this way, the code is **modular and extensible** – new migration tasks can be added as new cases (and corresponding prompt choices) without affecting the others. The use of Angular Schematics ensures that the changes are made in-memory and only written if all steps complete, and it integrates with Angular’s update workflow.

**Documentation and Usage**

The code itself is well-documented with comments explaining each operation. For example, before performing replacements, a comment describes which component or directive is being migrated and why. This makes it easier for other developers to understand or modify the script for future PrimeNG versions. Additionally, a README or documentation can accompany the schematic, instructing users how to run it (e.g., via ng generate or ng update). Because it uses standard schematics, a developer can invoke it with the Angular CLI and benefit from the interactive prompts and safety checks.

**Example**: If packaged in a library called primeng-migration-schematics, users could run:

```
ng add primeng-migration-schematics@latest --name=migrate-v18
```

_(or)_

```
ng run primeng-migration-schematics:migratePrimengV18
```

This would trigger the schematic, and the user would see the interactive menu and confirmations as described.

**Conclusion**

By leveraging Angular Schematics, this interactive migration script provides a robust and user-friendly way to upgrade from PrimeNG v17 to v18. It automates renaming of components and imports per the PrimeNG v18 guide (e.g. Calendar → DatePicker ), replaces removed directives like pAnimate , flags deprecated features like pDefer , adjusts obsolete CSS classes , and ensures each change is tracked in Git with a clear commit. The modular design allows easy updates or addition of new migration rules in the future. Using this script, developers can save time and reduce errors when adopting PrimeNG v18 in their Angular applications.
