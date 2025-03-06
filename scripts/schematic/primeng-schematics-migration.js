/**
 * PrimeNG v17 to v18 Migration Schematics
 *
 * This file contains schematics for migrating from PrimeNG v17 to v18.
 * To use this, create an Angular schematic collection.
 */

const {
  Rule,
  SchematicContext,
  Tree,
  chain,
} = require('@angular-devkit/schematics');
const { execSync } = require('child_process');
const { getWorkspace } = require('@schematics/angular/utility/workspace');
const {
  NodeDependencyType,
  addPackageJsonDependency,
} = require('@schematics/angular/utility/dependencies');
const ts = require('typescript');

// Check if git has unstaged changes
function hasUnstagedChanges() {
  try {
    const output = execSync('git status --porcelain').toString();
    return output.length > 0;
  } catch (error) {
    return true;
  }
}

// Stash changes
function stashChanges() {
  try {
    execSync('git stash');
    return true;
  } catch (error) {
    return false;
  }
}

// Commit changes
function commitChanges(message) {
  try {
    execSync('git add .');
    execSync(`git commit -m "${message}"`);
    return true;
  } catch (error) {
    return false;
  }
}

// Migration: Update dependencies
function updateDependencies() {
  return (tree, context) => {
    context.logger.info('Updating PrimeNG dependencies...');

    // Update PrimeNG to v18
    const primengDep = {
      type: NodeDependencyType.Default,
      name: 'primeng',
      version: '^18.0.0',
      overwrite: true,
    };
    addPackageJsonDependency(tree, primengDep);
    context.logger.info('Updated PrimeNG to v18.0.0');

    // Check for PrimeFlex and update if present
    const packageJsonPath = '/package.json';
    if (tree.exists(packageJsonPath)) {
      const packageJsonContent = JSON.parse(
        tree.read(packageJsonPath).toString('utf-8')
      );
      if (
        packageJsonContent.dependencies &&
        packageJsonContent.dependencies.primeflex
      ) {
        packageJsonContent.dependencies.primeflex = '^4.0.0';
        tree.overwrite(
          packageJsonPath,
          JSON.stringify(packageJsonContent, null, 2)
        );
        context.logger.info('Updated PrimeFlex to v4.0.0');
      }
    }

    return tree;
  };
}

// Migration: Update module imports for renamed components
function updateModuleImports() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG module imports...');

    const moduleUpdates = [
      {
        oldImport: /import\s+{\s*(.*?)\s*}\s+from\s+['"]primeng\/calendar['"]/g,
        newImport: "import { $1 } from 'primeng/datepicker'",
      },
      {
        oldImport: /import\s+{\s*(.*?)\s*}\s+from\s+['"]primeng\/dropdown['"]/g,
        newImport: "import { $1 } from 'primeng/select'",
      },
      {
        oldImport:
          /import\s+{\s*(.*?)\s*}\s+from\s+['"]primeng\/inputswitch['"]/g,
        newImport: "import { $1 } from 'primeng/toggleswitch'",
      },
      {
        oldImport:
          /import\s+{\s*(.*?)\s*}\s+from\s+['"]primeng\/overlaypanel['"]/g,
        newImport: "import { $1 } from 'primeng/popover'",
      },
      {
        oldImport: /import\s+{\s*(.*?)\s*}\s+from\s+['"]primeng\/sidebar['"]/g,
        newImport: "import { $1 } from 'primeng/drawer'",
      },
    ];

    tree.visit((filePath) => {
      if (!filePath.endsWith('.ts')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      for (const update of moduleUpdates) {
        if (update.oldImport.test(fileContent)) {
          fileContent = fileContent.replace(update.oldImport, update.newImport);
          hasChanged = true;
        }
      }

      // Update Message interface to ToastMessageOptions
      if (
        fileContent.includes('import') &&
        fileContent.includes('Message') &&
        fileContent.includes('primeng/api')
      ) {
        fileContent = fileContent.replace(
          /import\s+{([^}]*)Message([^}]*)}\s+from\s+['"]primeng\/api['"]/g,
          "import {$1ToastMessageOptions$2} from 'primeng/api'"
        );

        // Replace Message type references with ToastMessageOptions
        fileContent = fileContent.replace(
          /\bMessage\b(?!\s*=)/g,
          'ToastMessageOptions'
        );
        hasChanged = true;
      }

      // Check for PrimeNGConfig usage and warn about providePrimeNG()
      if (fileContent.includes('PrimeNGConfig')) {
        context.logger.warn(
          `Found PrimeNGConfig in ${filePath} - this needs to be replaced with providePrimeNG() in v18`
        );
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated imports in ${filePath}`);
      }
    });

    return tree;
  };
}

// Migration: Update component selectors in templates
function updateComponentSelectors() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG component selectors...');

    const selectorUpdates = [
      {
        oldSelector: /<p-calendar/g,
        newSelector: '<p-datepicker',
      },
      {
        oldSelector: /<\/p-calendar>/g,
        newSelector: '</p-datepicker>',
      },
      {
        oldSelector: /<p-dropdown/g,
        newSelector: '<p-select',
      },
      {
        oldSelector: /<\/p-dropdown>/g,
        newSelector: '</p-select>',
      },
      {
        oldSelector: /<p-inputSwitch/g,
        newSelector: '<p-toggleSwitch',
      },
      {
        oldSelector: /<\/p-inputSwitch>/g,
        newSelector: '</p-toggleSwitch>',
      },
      {
        oldSelector: /<p-overlayPanel/g,
        newSelector: '<p-popover',
      },
      {
        oldSelector: /<\/p-overlayPanel>/g,
        newSelector: '</p-popover>',
      },
      {
        oldSelector: /<p-sidebar/g,
        newSelector: '<p-drawer',
      },
      {
        oldSelector: /<\/p-sidebar>/g,
        newSelector: '</p-drawer>',
      },
    ];

    tree.visit((filePath) => {
      if (!filePath.endsWith('.html')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      for (const update of selectorUpdates) {
        if (update.oldSelector.test(fileContent)) {
          fileContent = fileContent.replace(
            update.oldSelector,
            update.newSelector
          );
          hasChanged = true;
        }
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated component selectors in ${filePath}`);
      }
    });

    return tree;
  };
}

// Migration: Update CSS classes
function updateCssClasses() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG CSS classes...');

    const cssUpdates = [
      {
        oldClass: /\bp-component\b/g,
        newClass: 'p-element',
      },
      {
        oldClass: /\bp-inputtext\b/g,
        newClass: 'p-input',
      },
      {
        oldClass: /\bp-link\b/g,
        newClass: '', // Removed utility class
      },
      {
        oldClass: /\bp-highlight\b/g,
        newClass: 'p-highlighted', // Removed utility class
      },
      {
        oldClass: /\bp-fluid\b/g,
        newClass: 'fluid', // Removed utility class
      },
    ];

    tree.visit((filePath) => {
      if (
        !filePath.endsWith('.html') &&
        !filePath.endsWith('.scss') &&
        !filePath.endsWith('.css') &&
        !filePath.endsWith('.ts')
      )
        return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      for (const update of cssUpdates) {
        if (update.oldClass.test(fileContent)) {
          fileContent = fileContent.replace(update.oldClass, update.newClass);
          hasChanged = true;
        }
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated CSS classes in ${filePath}`);
      }
    });

    return tree;
  };
}

// Migration: Update component properties
function updateComponentProperties() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG component properties...');

    const propertyUpdates = [
      {
        oldProperty: /\[showTransitionOptions\]="[^"]*"/g,
        newProperty: '[showTransitionOptions]=".12s"',
      },
      {
        oldProperty: /\[hideTransitionOptions\]="[^"]*"/g,
        newProperty: '[hideTransitionOptions]=".12s"',
      },
    ];

    tree.visit((filePath) => {
      if (!filePath.endsWith('.html')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      for (const update of propertyUpdates) {
        if (update.oldProperty.test(fileContent)) {
          fileContent = fileContent.replace(
            update.oldProperty,
            update.newProperty
          );
          hasChanged = true;
        }
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated component properties in ${filePath}`);
      }
    });

    return tree;
  };
}

// Migration: Update Dialog component
function updateDialogComponent() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG Dialog component...');

    const dialogUpdates = [
      {
        oldProperty: /\[modal\]="[^"]*"/g,
        newProperty: '[closeOnEscape]="true"',
      },
      {
        oldProperty: /modal="[^"]*"/g,
        newProperty: 'closeOnEscape="true"',
      },
    ];

    tree.visit((filePath) => {
      if (!filePath.endsWith('.html')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      for (const update of dialogUpdates) {
        if (update.oldProperty.test(fileContent)) {
          fileContent = fileContent.replace(
            update.oldProperty,
            update.newProperty
          );
          hasChanged = true;
        }
      }

      // Also check for modal property in TS files
      if (filePath.endsWith('.ts') && fileContent.includes('modal:')) {
        fileContent = fileContent.replace(
          /modal\s*:\s*(true|false)/g,
          'closeOnEscape: $1'
        );
        hasChanged = true;
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated Dialog component in ${filePath}`);
      }
    });

    return tree;
  };
}

// Migration: Update Angular configuration (angular.json)
function updateAngularConfig() {
  return async (tree, context) => {
    context.logger.info('Updating Angular configuration...');

    const angularJsonPath = '/angular.json';
    if (!tree.exists(angularJsonPath)) {
      context.logger.info(
        'No angular.json file found, skipping configuration update'
      );
      return tree;
    }

    const angularJson = JSON.parse(
      tree.read(angularJsonPath).toString('utf-8')
    );
    let hasChanged = false;

    // Process each project in the workspace
    for (const projectName in angularJson.projects) {
      const project = angularJson.projects[projectName];

      // Check for styles configuration
      if (project.architect?.build?.options?.styles) {
        const styles = project.architect.build.options.styles;
        const newStyles = styles.filter((style) => {
          if (
            typeof style === 'string' &&
            (style.includes('primeng/resources') ||
              style.includes('node_modules/primeng/resources'))
          ) {
            context.logger.info(`Removing deprecated PrimeNG style: ${style}`);
            hasChanged = true;
            return false;
          }
          return true;
        });

        if (styles.length !== newStyles.length) {
          project.architect.build.options.styles = newStyles;
        }
      }
    }

    if (hasChanged) {
      tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
      context.logger.info(
        'Updated angular.json to remove deprecated PrimeNG styles'
      );
    }

    return tree;
  };
}

// Migration: Update directives
function updateDirectives() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG directives...');

    const directiveUpdates = [
      {
        oldDirective: /pAnimate/g,
        newDirective: 'pAnimateOnScroll',
      },
      {
        oldDirective: /pDefer/g,
        newDirective: '', // Removed in favor of Angular @defer
      },
    ];

    tree.visit((filePath) => {
      if (!filePath.endsWith('.html')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      for (const update of directiveUpdates) {
        if (update.oldDirective.test(fileContent)) {
          fileContent = fileContent.replace(
            update.oldDirective,
            update.newDirective
          );
          hasChanged = true;

          // Add a comment for pDefer removal
          if (update.oldDirective.toString().includes('pDefer')) {
            context.logger.warn(
              `Found pDefer directive in ${filePath} - this has been removed in PrimeNG v18. Please use Angular's @defer instead.`
            );
          }
        }
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated directives in ${filePath}`);
      }
    });

    return tree;
  };
}

// Main migration function
function migrateToV18(options) {
  return async (tree, context) => {
    context.logger.info('Starting PrimeNG v17 to v18 migration...');

    // Check git status if not skipped
    if (!options.skipGitCheck && hasUnstagedChanges()) {
      context.logger.warn('There are unstaged changes in the git repository.');
      context.logger.info('Attempting to stash changes...');

      if (!stashChanges()) {
        context.logger.error(
          'Failed to stash changes. Please commit or stash your changes manually before running this migration, or use --skipGitCheck to bypass this check.'
        );
        return tree;
      }

      context.logger.info('Changes stashed successfully.');
    }

    // Execute migrations in sequence
    const migrationChain = chain([
      updateDependencies(),
      updateModuleImports(),
      updateComponentSelectors(),
      updateCssClasses(),
      updateComponentProperties(),
      updateDialogComponent(),
      updateAngularConfig(),
      updateDirectives(),
    ]);

    // Apply migrations
    const result = await migrationChain(tree, context);

    // Commit changes if not skipped
    if (!options.skipCommit) {
      if (commitChanges('feat(primeng): migrate from v17 to v18')) {
        context.logger.info('Migration changes committed successfully');
      } else {
        context.logger.warn('Failed to commit migration changes');
      }
    }

    context.logger.info('PrimeNG v17 to v18 migration completed successfully!');
    context.logger.info(
      'Please review the changes and run your application to verify the migration.'
    );

    return result;
  };
}

// Export the migration schematic
module.exports = {
  migrateToV18,
};
