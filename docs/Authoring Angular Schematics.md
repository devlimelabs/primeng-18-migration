**Authoring Angular Schematics for Automated Migrations (Beginner’s Guide)**

Angular **schematics** allow you to automate code modifications – perfect for handling breaking changes during upgrades. This guide will walk you through creating a schematic (using Angular 18 tooling) to migrate an app from PrimeNG v17 to v18. We’ll focus on hands-on examples over theory, showing how to set up a schematic, use its core APIs, and implement a real migration step-by-step.

**1\. Getting Started: Your First Schematic**

**Installation and Setup:** To begin, install the Schematics CLI globally, which provides the schematics command-line tool:

```
npm install -g @angular-devkit/schematics-cli
```

This CLI lets you generate new schematic projects and run them . Next, create a new blank schematics project. For example, to create a project named **my-schematic** with an initial schematic of the same name, run:

```
schematics blank --name=my-schematic
```

The blank schematic is a built-in generator that scaffolds a minimal project . After running this, you’ll see output listing the files created:

• **README.md** – project README with basic info

• **.gitignore** and **.npmignore** – standard ignore files

• **package.json** – NPM package config (with dependencies like @angular-devkit/schematics)

• **tsconfig.json** – TypeScript configuration for the project

• **src/collection.json** – Schematics collection manifest

• **src/my-schematic/index.ts** – The main schematic implementation file

• **src/my-schematic/index\_spec.ts** – Unit test for the schematic

These files form the schematic **project structure** . Notably, **collection.json** is the manifest that registers schematics in your project. By default, it will have an entry for the initial schematic (named “my-schematic” in this case) pointing to the factory function in index.ts . Open up the generated src/my-schematic/index.ts – this is where we’ll implement our schematic’s logic.

**Generating a Basic Schematic:** The default index.ts is a simple stub returning the Tree unchanged. Let’s verify it works. First, compile the project:

```
cd my-schematic
npm install
npm run build
```

Now run the schematic using the Schematics CLI:

```
schematics .:my-schematic
```

Here, .:my-schematic refers to the schematic named “my-schematic” in the current project (.). Because we haven’t added any files or requirements, it will execute and report “Nothing to be done.” To actually see changes applied, you can run schematics with \--dry-run=false (by default, running a local schematic uses a dry-run to avoid accidental modifications ). For now, our schematic does nothing, but we have a working setup to build on.

**Project Structure Overview:** In summary, a schematic project is structured as a Node package with one or more schematics. Key elements include:

• **package.json** – contains a "schematics" entry or an "ng-update" entry (when publishing update schematics for ng update).

• **collection.json** – maps schematic names to their implementation files.

• **src/** – directory containing subfolders for each schematic, each with an index.ts (and optionally a schema and templates).

With our environment ready, let’s explore the essential schematics syntax before diving into a real migration example.

**2\. Essential Syntax and Patterns**

Schematics operate on an in-memory virtual file system (the **Tree**) and apply transformations through **rules**. These core concepts are fairly simple:

• **Tree:** A virtual file system that contains your project’s files (the base) plus a _staging area_ for changes. You don’t modify files on disk directly; instead, you record changes in the Tree, and they are only committed when the schematic finishes successfully . In short, the Tree is “a staging area for changes, containing the original file system and a list of changes to apply to it” . The Tree provides methods to read, create, modify, or delete files.

• **Rule:** A function that takes a Tree (and a context) and returns a new Tree. It’s essentially one step in the transformation. A schematic’s main function is a factory that produces a Rule (often by composing multiple rules). For example, the default generated schematic returns a Rule that simply returns the Tree unchanged. A Rule “applies actions to a Tree and returns a new Tree that will contain all transformations to be applied” . You can chain multiple rules using the chain() utility to perform complex tasks in sequence.

• **SchematicContext:** Provides metadata and utilities during execution. The context is passed into each rule and gives you a logger for debug output, among other things . For example, you can use context.logger.info('Message') to log info to the console, or schedule tasks like package installation via context.addTask(). We’ll see examples of this shortly.

Now, let’s look at common patterns and a quick **cheatsheet** of useful operations when writing schematics:

**Modifying Files with the Tree**

You use the Tree to read and modify files in the virtual file system. Common Tree methods include:

• **Read a file:** tree.read(path) – returns a Buffer of the file contents (or null if the file doesn’t exist).

• **Check existence:** tree.exists(path) – returns true if a file exists.

• **Create a file:** tree.create(path, content) – creates a new file with the given content (provided as a string or Buffer).

• **Overwrite a file:** tree.overwrite(path, content) – replaces the entire content of an existing file.

• **Delete a file:** tree.delete(path) – removes a file.

• **Update recorder:** For more granular edits (like inserting or removing text), you can use tree.beginUpdate(path) to get an update recorder, apply changes, then tree.commitUpdate(recorder) to commit them.

For example, to append a line to a file you might do:

```
if (tree.exists('/src/environments/environment.ts')) {
  const content = tree.read('/src/environments/environment.ts')!.toString('utf-8');
  const updated = content + `\nconsole.log('Schematic was here');\n`;
  tree.overwrite('/src/environments/environment.ts', updated);
}
```

This snippet checks for the file, reads it, appends a log statement, and writes it back. Many schematics rely on simple string manipulation like this, but for complex tasks (like updating TypeScript AST), you might use utility functions from @schematics/angular or parse the file’s AST.

**Tip:** You can iterate over files in the Tree using tree.visit((filePath, fileEntry) => { ... }). This is useful for performing a find-and-replace across many files (we’ll use this in our PrimeNG migration example).

**Adding or Removing Dependencies**

Often a migration needs to add, remove, or update dependencies in **package.json**. You can do this manually by reading and writing JSON, or by using helper functions. Angular’s devkit provides addPackageJsonDependency() to simplify adding a dependency record . For example:

```
import { NodeDependencyType, NodeDependency, addPackageJsonDependency } from '@schematics/angular/utility/dependencies';

const dependency: NodeDependency = {
  type: NodeDependencyType.Default,  // could be Dev, Peer, Optional
  name: 'primeng',
  version: '^18.0.0',               // new version range
  overwrite: true
};
addPackageJsonDependency(tree, dependency);
context.logger.info('Added primeng 18.0.0 to dependencies');
```

This will modify _package.json_ in the Tree to include PrimeNG version 18. The overwrite: true ensures it replaces an existing entry if found . If you prefer not to use the helper, you can always manually read package.json as text, use JSON.parse to modify it, and then tree.overwrite('package.json', JSON.stringify(json, null, 2)) to save changes .

After updating dependencies, you typically need to install them. Schematics let you schedule **tasks** to run after the Tree is committed. One common task is NodePackageInstallTask, which triggers an npm install (or yarn install). You can add it via context:

```
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
context.addTask(new NodePackageInstallTask());
```

By adding this task, once your schematic finishes and writes the files, the CLI will run package installation. This is especially important in an ng update migration schematic, so that the user’s project has the updated dependencies installed automatically.

**Updating Angular Configuration (angular.json, etc.)**

Schematics can also modify config files like **angular.json**, **tsconfig.json**, or other JSON files. Similar to package.json, you can treat these as JSON data. For example, to remove a script or style from _angular.json_, you might do:

```
const workspaceConfigPath = '/angular.json';
if (tree.exists(workspaceConfigPath)) {
  const configText = tree.read(workspaceConfigPath)!.toString('utf-8');
  const workspace = JSON.parse(configText);
  // ... make modifications to the workspace object ...
  tree.overwrite(workspaceConfigPath, JSON.stringify(workspace, null, 2));
}
```

Angular provides workspace utilities (like updateWorkspace in @schematics/angular) which abstract some of this, but for a beginner it’s straightforward to directly manipulate the JSON. Just be careful to preserve formatting or use JSON.stringify(..., null, 2) for neat output.

**Cheatsheet – Common Tasks:** Here’s a quick summary of patterns:

• _Read or edit TypeScript/HTML files_: Use tree.read to get content and string replace or use AST if needed.

• _Modify JSON config (angular.json, package.json)_: Parse JSON, edit object, then tree.overwrite.

• _Add dependency_: Use addPackageJsonDependency and schedule an install task.

• _Add import or code to TS file_: You can insert text via string manipulation or use AST helpers (beyond this guide’s scope).

• _Log info or warnings_: Use context.logger (e.g., context.logger.warn('This API is deprecated...')) to inform the user during the migration.

With these basics in mind, let’s apply them in a real-world scenario.

**3\. Real-World Scenario: Automating a PrimeNG v17 → v18 Upgrade**

To illustrate a complete schematic, we’ll create a migration for **PrimeNG** from version 17 to 18. PrimeNG v18 introduced some breaking changes and deprecations. We want our schematic to automate as much of the upgrade as possible: updating dependencies, fixing imports, and updating code for removed APIs.

**Identifying Breaking Changes:** According to the PrimeNG migration guide, there are several notable changes when moving to v18:

• **Renamed Modules/Components:** Some components were renamed and moved to new modules. For example, Calendar was replaced by DatePicker, Dropdown by Select, InputSwitch by ToggleSwitch, OverlayPanel by Popover, and Sidebar by Drawer . The old names are deprecated (and may still work for now) but should be updated to the new imports.

• **Deprecated Components:** A number of components were deprecated in favor of new approaches (e.g. TabMenu replaced by a new Tabs component, TabView replaced by Tabs, Accordion now used with new AccordionHeader and AccordionContent components, etc.) . These might not break immediately, but they indicate structural changes. We might not fully automate replacing these, but our schematic can warn the developer or do partial updates.

• **PrimeNG Configuration Changes:** The global PrimeNGConfig is replaced by a new API. The initial configuration is now done via the providePrimeNG() provider function . This means if the project was configuring PrimeNGConfig (e.g. for ripple effect or localization), we should prompt the user to switch to the new provider. We can’t automatically add the provider without complex AST manipulation, but we can at least detect usage of PrimeNGConfig and inform the user.

• **Theming Changes:** The old theme CSS files under primeng/resources are removed in v18 . If the project’s angular.json is importing these styles (like node\_modules/primeng/resources/primeng.min.css or theme.css files), they need to be removed or replaced with the new styled theming approach. We can automate removal of these lines in angular.json.

• **Message API Changes:** The Messages component (which displayed an array of messages) was deprecated in favor of using multiple Message components or a custom loop, and the interface Message in primeng/api was renamed to ToastMessageOptions . Our migration can update imports of this interface and references in code from Message to ToastMessageOptions. It can also replace import paths from 'primeng/api' if needed.

• **PrimeFlex Compatibility:** If the project uses PrimeFlex (utility CSS), they must upgrade to PrimeFlex v4 when using PrimeNG 18 . We can check package.json for "primeflex" and update its version.

Now that we know what to tackle, let’s implement a **migration schematic** called **primeng-v18-migration**. We will create a new schematic in our collection for this (e.g., by running schematics blank --name=primeng-v18-migration inside our schematics project, or adding it manually to collection.json). The schematic will perform the following steps:

**Step 1: Update PrimeNG (and related) Dependencies**

We’ll bump the PrimeNG version in package.json to ^18.0.0 and ensure PrimeFlex is updated to v4.

```
// src/primeng-v18-migration/index.ts
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodeDependencyType, NodeDependency, addPackageJsonDependency } from '@schematics/angular/utility/dependencies';

export function primengV18Migration(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    // 1. Update primeng dependency
    const primengDep: NodeDependency = {
      type: NodeDependencyType.Default,
      name: 'primeng',
      version: '^18.0.0',  // target version
      overwrite: true
    };
    addPackageJsonDependency(tree, primengDep);
    context.logger.info('Updated PrimeNG to v18 in package.json');

    // 2. Update PrimeFlex (if present)
    const pkgPath = '/package.json';
    const pkgBuffer = tree.read(pkgPath);
    if (pkgBuffer) {
      const pkg = JSON.parse(pkgBuffer.toString('utf-8'));
      if (pkg.dependencies && pkg.dependencies['primeflex']) {
        pkg.dependencies['primeflex'] = '^4.0.0'; // compatible PrimeFlex version
        tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
        context.logger.info('Updated PrimeFlex to v4 in package.json');
      }
    }

    // (We will schedule an install task at the end, after all changes)
    return tree;
  };
}
```

In this snippet, we use addPackageJsonDependency for PrimeNG and directly edit the JSON for PrimeFlex. We log messages to inform the user of what was changed. At this point, we haven’t scheduled the install yet; we’ll do it after all file modifications (to avoid running npm install in the middle of our schematic).

**Step 2: Update Imports for Renamed Modules**

Next, we need to find any import statements (or component usages in templates) that refer to old PrimeNG module paths (like 'primeng/calendar'). We can scan all TypeScript files and replace those strings. We’ll use tree.visit to go through files:

```
import * as ts from 'typescript';  // (optional, for AST if needed)

const renameImports: Record<string, string> = {
  "primeng/calendar": "primeng/datepicker",
  "primeng/dropdown": "primeng/select",
  "primeng/inputswitch": "primeng/toggleswitch",
  "primeng/overlaypanel": "primeng/popover",
  "primeng/sidebar": "primeng/drawer"
};

tree.visit((filePath, fileEntry) => {
  if (filePath.endsWith('.ts')) {
    let content = fileEntry.content.toString('utf-8');
    let modified = false;
    for (const [oldPath, newPath] of Object.entries(renameImports)) {
      if (content.includes(oldPath)) {
        content = content.replace(new RegExp(oldPath, 'g'), newPath);
        modified = true;
      }
    }
    if (modified) {
      tree.overwrite(filePath, content);
      context.logger.info(`Updated import paths in ${filePath}`);
    }
  }
});
```

Here we defined a mapping of old import paths to new ones (for the renamed components) and replaced occurrences in each TypeScript file. This will handle cases where the code imports PrimeNG modules by their package path. For instance, an import like:

```
import { CalendarModule } from 'primeng/calendar';
```

will be changed to:

```
import { CalendarModule } from 'primeng/datepicker';
```

_(In this specific case, the module name inside the import (__CalendarModule__) might remain the same or might have been renamed to_ _DatePickerModule__. In a real scenario, we’d verify if the symbol names changed. For simplicity, assume the import path change is sufficient, since PrimeNG often keeps module class names consistent with the new component, e.g.,_ _CalendarModule_ _might be replaced by_ _DatePickerModule__. We could extend our mapping to replace class names too if needed.)_

We might also update selectors in templates (e.g., <p-calendar> to <p-datepicker>). That would involve checking .html files in the Tree similarly and doing string replacements for component selectors. For brevity, we’ll focus on TS imports and a few critical code changes.

**Step 3: Update Code for Deprecated APIs**

One breaking change is the rename of the **Message** interface to **ToastMessageOptions** in primeng/api . If the project imports or uses Message from PrimeNG, it will break. We can automate this by adjusting import statements and type references. For example:

```
tree.visit((filePath, fileEntry) => {
  if (filePath.endsWith('.ts')) {
    let content = fileEntry.content.toString('utf-8');
    // Replace imports of Message interface
    if (content.includes(`from 'primeng/api'`) && content.includes('Message')) {
      // Replace type references in the file
      content = content.replace(/\bMessage\b/g, 'ToastMessageOptions');
      // Ensure the import is updated (import { Message } -> import { ToastMessageOptions })
      content = content.replace('Message', 'ToastMessageOptions');
      tree.overwrite(filePath, content);
      context.logger.info(`Replaced Message with ToastMessageOptions in ${filePath}`);
    }
  }
});
```

This is a simplistic approach (global replace might affect other Message occurrences not related to PrimeNG, so a more robust method would parse the AST and replace only the import from primeng/api and its usages). But for demonstration, it shows how to do a textual replacement to handle a deprecated API.

Another possible code update: if PrimeNGConfig usage is detected, we can add a comment or log. For example:

```
tree.visit((filePath, fileEntry) => {
  if (filePath.endsWith('.ts')) {
    const content = fileEntry.content.toString('utf-8');
    if (content.includes('PrimeNGConfig')) {
      context.logger.warn(`Found PrimeNGConfig in ${filePath} - please switch to providePrimeNG configuration as PrimeNGConfig is deprecated in v18.`);
      // (Optionally, we could insert code to use providePrimeNG in main.ts, but that is complex to do automatically.)
    }
  }
});
```

This will at least alert the developer to manual steps needed for the config change.

**Step 4: Remove Deprecated CSS Imports**

If the project’s angular.json references PrimeNG CSS that were removed, we should remove them. Common entries might be in the **styles** array of angular.json:

```
const angularJsonPath = '/angular.json';
const buffer = tree.read(angularJsonPath);
if (buffer) {
  const angularJson = JSON.parse(buffer.toString('utf-8'));
  const projects = angularJson.projects || {};
  for (const proj of Object.keys(projects)) {
    const styles = angularJson.projects[proj]?.architect?.build?.options?.styles;
    if (Array.isArray(styles)) {
      const newStyles = styles.filter((style: string) => {
        // filter out any primeng resources or theme.css
        if (typeof style === 'string' && style.includes('primeng/resources')) {
          context.logger.info(`Removing deprecated PrimeNG style: ${style}`);
          return false;  // exclude this style
        }
        return true;
      });
      angularJson.projects[proj].architect.build.options.styles = newStyles;
    }
  }
  tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
}
```

This code looks for any styles in angular.json containing primeng/resources (which was the old path for themes and component CSS) and filters them out. After this, the project will no longer try to include the removed PrimeNG CSS files. (PrimeNG v18 uses a different theming approach, which the developer can set up separately.)

**Step 5: Finalize and Run Tasks**

After making all these changes to the Tree, our schematic should schedule the npm install task and return the modified Tree:

```
// ... inside primengV18Migration function
context.addTask(new NodePackageInstallTask());
return tree;
```

Adding the NodePackageInstallTask at the end ensures that once the schematic is applied, the dependencies we updated will be installed. We included context from SchematicContext earlier in the function’s parameters to use it here.

Now we can add an entry for this schematic in collection.json, for example:

```
// src/collection.json
{
  "$schema": "...schematics/collection-schema.json",
  "schematics": {
    "primeng-v18-migration": {
      "description": "Automate PrimeNG v17 to v18 updates",
      "factory": "./primeng-v18-migration/index#primengV18Migration"
    }
    // ...other schematics
  }
}
```

With that in place, compile the project again (npm run build). To test our migration on an Angular project, you can run the schematic from the project’s root directory:

```
schematics <path-to-schematics-project>:primeng-v18-migration --dry-run=false
```

Replace <path-to-schematics-project> with the folder or npm package name of your schematics. This will apply the changes to the current project. Check the console logs for the info/warn messages we added, and verify the changes (import paths updated, package.json bumped, etc.). Once satisfied, you could even publish this schematic as part of a library so that ng update can use it (by specifying it in the library’s package.json under "ng-update").

**4\. Best Practices & Pro Tips**

Authoring schematics is powerful – here are some best practices and tips to keep your migrations safe and effective:

• **Debugging Schematics:** Use the SchematicContext.logger to output helpful information. You have multiple log levels (info, warn, error, etc.) to communicate progress or important notices . By default, when running schematics via Angular CLI, only info and above may show. If you don’t see your logs, run the command with debugging enabled (for example, NG\_DEBUG=true ng update ... or add \--debug=false to actually apply changes in a local run ). Logging each major action (like “Updated import X to Y”) helps the user (and you, during development) understand what the schematic did.

• **Testing Your Schematic:** It’s good to write unit tests for your rules using the SchematicsTestRunner (from @angular-devkit/schematics/testing). This lets you apply your schematic to a fake Tree and assert that files are created/modified as expected. Also, always run your migration on a sample project (or a test branch of the real project) to verify it works as intended before publishing. Because schematics operate on a virtual file system, you can safely experiment with \--dry-run to see what would change without actually modifying files, or use version control to inspect changes.

• **Writing Safe Migrations:** Automated migrations should be as _targeted_ as possible to avoid touching unrelated code. For example, when replacing Message with ToastMessageOptions, ensure you’re only affecting imports from PrimeNG, not every occurrence of the word “Message” in the code. Prefer using AST (Abstract Syntax Tree) parsing for complex code transformations – Angular schematics provides utilities for parsing TypeScript and updating it in a structured way. If a migration can’t be 100% automated (e.g., converting a complex component usage), consider logging a warning or TODO comment in the code to alert the developer. Always back up or use version control before running migrations so changes can be reviewed or reverted if needed.

• **Performance Considerations:** Schematics run quickly even on large projects, but there are a few things to keep in mind. Use tree.visit carefully – if you only need to scan specific file types or certain directories (like /src/app), filter the paths to avoid processing thousands of files unnecessarily (for instance, skip node\_modules or large generated files). Batch your modifications to the same file: rather than writing to the same file multiple times, read it once, perform all needed replacements, then write once. This reduces I/O overhead. The Angular devkit is optimized for bulk changes (it commits all changes in one go at the end), so focus more on writing clear transformation logic than micro-optimizing file writes.

• **Integrating with Angular CLI:** To make your migration schematic available via ng update, you need to package it with your library. In your library’s package.json, add an "ng-update" section pointing to a migrations.json (or use collection.json) that lists your migration schematics by version. For example, define migrations for version 18 in a migrations JSON and include "ng-update": { "migrations": "./migrations.json", "packageGroup": "@yourScope/yourLibrary" } in package.json. This way, when a user runs ng update your-library, Angular CLI will automatically run the appropriate migration schematics for the target version . While this is more about distribution than authoring, it’s good to design your schematic with idempotency (applying it twice shouldn’t cause harm) and clear version scopes.

• **Keep It Simple:** Especially for beginners, start with straightforward text replacements and file additions. Leverage existing community schematics or Angular’s own update schematics as references for complex scenarios. Over time, you can incorporate advanced techniques like using TypeScript AST, but many migrations can be handled with well-scoped find-and-replace logic as we demonstrated.

By following these practices, you’ll create schematics that are robust, helpful, and safe for users to run. With the example above, you have a template for writing your own code migration schematic. Happy coding, and enjoy automating those tedious code upgrades!

**Sources:** The information and code examples above draw on Angular’s official Schematics documentation and the PrimeNG v18 migration guide. Key references include the Angular DevKit Schematics glossary , Angular’s schematics authoring guide , and PrimeNG’s documented changes for v18 , among others, to ensure accuracy in the migration steps.
