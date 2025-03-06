import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { execSync } from 'child_process';

/**
 * PrimeNG v17 to v18 Migration Schematics
 *
 * This file contains schematics for migrating from PrimeNG v17 to v18.
 * To use this, create an Angular schematic collection.
 */
// Define interfaces for options
interface MigrationOptions {
  skipGitCheck?: boolean;
  skipCommit?: boolean;
}

// Check if git has unstaged changes
function hasUnstagedChanges(): boolean {
  try {
    const output = execSync('git status --porcelain').toString();
    return output.length > 0;
  } catch (error) {
    return true;
  }
}

// Stash changes
function stashChanges(): boolean {
  try {
    execSync('git stash');
    return true;
  } catch (error) {
    return false;
  }
}

// Commit changes
function commitChanges(message: string): boolean {
  try {
    execSync('git add .');
    execSync(`git commit -m "${message}"`);
    return true;
  } catch (error) {
    return false;
  }
}

// Define package dependency interface
interface PackageDependency {
  type: NodeDependencyType;
  name: string;
  version: string;
  overwrite: boolean;
}

// Function to add package dependency
function addPackageJsonDependency(tree: Tree, dependency: PackageDependency): void {
  const packageJsonPath = '/package.json';
  if (!tree.exists(packageJsonPath)) {
    return;
  }

  const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString('utf-8'));
  
  if (!packageJson[dependency.type]) {
    packageJson[dependency.type] = {};
  }
  
  packageJson[dependency.type][dependency.name] = dependency.version;
  
  tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Enum for dependency types
enum NodeDependencyType {
  Default = 'dependencies',
  Dev = 'devDependencies',
  Peer = 'peerDependencies',
  Optional = 'optionalDependencies'
}

// Migration: Update dependencies
function updateDependencies(): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    context.logger.info('Updating PrimeNG dependencies...');

    // Update PrimeNG to v18
    const primengDep: PackageDependency = {
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
        tree.read(packageJsonPath)!.toString('utf-8')
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
function updateModuleImports(): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    context.logger.info('Migrating PrimeNG module imports...');

    const moduleUpdates: Record<string, string> = {
      "primeng/calendar": "primeng/datepicker",
      "primeng/dropdown": "primeng/select",
      "primeng/inputswitch": "primeng/toggleswitch",
      "primeng/overlaypanel": "primeng/popover",
      "primeng/sidebar": "primeng/drawer"
    };

    tree.visit((filePath: string) => {
      if (!filePath.endsWith('.ts')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      // Safer pattern following Angular Schematics guide recommendations
      for (const [oldPath, newPath] of Object.entries(moduleUpdates)) {
        const importRegex = new RegExp(`import\\s+{([^}]*)\\}\\s+from\\s+['"]${oldPath.replace('/', '\\/')}['"]`, 'g');
        if (importRegex.test(fileContent)) {
          // Reset the regex index for the replacement
          importRegex.lastIndex = 0;
          fileContent = fileContent.replace(importRegex, (_, importClause) => {
            return `import {${importClause}} from '${newPath}'`;
          });
          hasChanged = true;
          context.logger.info(`Updated import from ${oldPath} to ${newPath} in ${filePath}`);
        }
      }

      // Update Message interface to ToastMessageOptions with more careful handling
      if (fileContent.includes('primeng/api') && /\bMessage\b/.test(fileContent)) {
        // First update the import statement
        const messageImportRegex = /import\s+{([^}]*)\bMessage\b([^}]*)}\s+from\s+['"]primeng\/api['"]/g;
        if (messageImportRegex.test(fileContent)) {
          messageImportRegex.lastIndex = 0;
          fileContent = fileContent.replace(messageImportRegex, (_, before, after) => {
            return `import {${before}ToastMessageOptions${after}} from 'primeng/api'`;
          });
          
          // Then carefully update the references to Message type
          // This is more conservative to avoid changing non-PrimeNG Message references
          // We use word boundaries \b to ensure we're replacing the whole word
          fileContent = fileContent.replace(/\bMessage\b(?!\s*=|\s*\.|:)/g, 'ToastMessageOptions');
          hasChanged = true;
          context.logger.info(`Updated Message to ToastMessageOptions in ${filePath}`);
        }
      }

      // Check for PrimeNGConfig usage and warn about providePrimeNG()
      if (fileContent.includes('PrimeNGConfig')) {
        context.logger.warn(
          `Found PrimeNGConfig in ${filePath} - this needs to be replaced with providePrimeNG() in v18`
        );
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
      }
    });

    return tree;
  };
}

// Migration: Update component selectors in templates
function updateComponentSelectors(): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    context.logger.info('Migrating PrimeNG component selectors...');

    const selectorMappings: Record<string, string> = {
      'p-calendar': 'p-datepicker',
      'p-dropdown': 'p-select',
      'p-inputSwitch': 'p-toggleSwitch',
      'p-overlayPanel': 'p-popover',
      'p-sidebar': 'p-drawer'
    };

    tree.visit((filePath: string) => {
      // Look at both HTML templates and component decorator templates in TS files
      if (!filePath.endsWith('.html') && !filePath.endsWith('.ts')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      // Process each selector mapping
      for (const [oldSelector, newSelector] of Object.entries(selectorMappings)) {
        // Create regex for opening tags - handle both with and without attributes
        const openingTagRegex = new RegExp(`<${oldSelector}(\\s[^>]*)?\/?>`, 'g');
        // Create regex for closing tags
        const closingTagRegex = new RegExp(`<\/${oldSelector}>`, 'g');

        // First check if the selector appears in the file before doing replacements
        if (openingTagRegex.test(fileContent) || closingTagRegex.test(fileContent)) {
          // Reset regex because test() advances the lastIndex
          openingTagRegex.lastIndex = 0;
          closingTagRegex.lastIndex = 0;

          // Replace opening tags
          fileContent = fileContent.replace(openingTagRegex, (_, attributes) => {
            return `<${newSelector}${attributes || ''}>`;
          });

          // Replace closing tags
          fileContent = fileContent.replace(closingTagRegex, `</${newSelector}>`);

          hasChanged = true;
          context.logger.info(`Updated ${oldSelector} to ${newSelector} in ${filePath}`);
        }
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
      }
    });

    return tree;
  };
}

// Migration: Update CSS classes
function updateCssClasses(): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    context.logger.info('Migrating PrimeNG CSS classes...');

    const cssClassMappings: Record<string, string> = {
      'p-component': 'p-element',
      'p-inputtext': 'p-input',
      'p-link': '', // Removed utility class
      'p-highlight': 'p-highlighted',
      'p-fluid': 'fluid'
    };

    tree.visit((filePath: string) => {
      // Only check file types that might contain CSS classes
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

      for (const [oldClass, newClass] of Object.entries(cssClassMappings)) {
        // Use word boundaries to ensure we only replace the class name
        const classRegex = new RegExp(`\\b${oldClass}\\b`, 'g');
        
        if (classRegex.test(fileContent)) {
          classRegex.lastIndex = 0;
          const beforeReplace: string = fileContent;
          fileContent = fileContent.replace(classRegex, newClass);
          
          if (beforeReplace !== fileContent) {
            hasChanged = true;
            context.logger.info(`Updated CSS class '${oldClass}' to '${newClass || '(removed)'}' in ${filePath}`);
          }
        }
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
      }
    });

    return tree;
  };
}

// Migration: Update component properties
function updateComponentProperties(): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    context.logger.info('Migrating PrimeNG component properties...');

    const propertyMappings: Record<string, string> = {
      'showTransitionOptions': '.12s',
      'hideTransitionOptions': '.12s'
    };

    tree.visit((filePath: string) => {
      if (!filePath.endsWith('.html')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      for (const [propName, newValue] of Object.entries(propertyMappings)) {
        // Match both property binding [prop]="..." and attribute binding prop="..."
        const bindingRegex = new RegExp(`\\[${propName}\\]="[^"]*"`, 'g');
        const attrRegex = new RegExp(`${propName}="[^"]*"`, 'g');
        
        // Check and update property bindings
        if (bindingRegex.test(fileContent)) {
          bindingRegex.lastIndex = 0;
          fileContent = fileContent.replace(bindingRegex, `[${propName}]="${newValue}"`);
          hasChanged = true;
          context.logger.info(`Updated [${propName}] binding in ${filePath}`);
        }
        
        // Check and update attribute bindings
        if (attrRegex.test(fileContent)) {
          attrRegex.lastIndex = 0;
          fileContent = fileContent.replace(attrRegex, `${propName}="${newValue}"`);
          hasChanged = true;
          context.logger.info(`Updated ${propName} attribute in ${filePath}`);
        }
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
      }
    });

    return tree;
  };
}

// Migration: Update Dialog component
function updateDialogComponent(): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    context.logger.info('Migrating PrimeNG Dialog component...');

    tree.visit((filePath: string) => {
      // Check both HTML and TS files
      if (!filePath.endsWith('.html') && !filePath.endsWith('.ts')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      // For HTML files, handle template property bindings
      if (filePath.endsWith('.html')) {
        // Handle property binding [modal]="..."
        const modalBindingRegex = /\[modal\]="([^"]*)"/g;
        if (modalBindingRegex.test(fileContent)) {
          modalBindingRegex.lastIndex = 0;
          fileContent = fileContent.replace(modalBindingRegex, (_, value) => {
            return `[closeOnEscape]="${value}"`;
          });
          hasChanged = true;
          context.logger.info(`Updated [modal] binding to [closeOnEscape] in ${filePath}`);
        }

        // Handle attribute binding modal="..."
        const modalAttrRegex = /\bmodal="([^"]*)"/g;
        if (modalAttrRegex.test(fileContent)) {
          modalAttrRegex.lastIndex = 0;
          fileContent = fileContent.replace(modalAttrRegex, (_, value) => {
            return `closeOnEscape="${value}"`;
          });
          hasChanged = true;
          context.logger.info(`Updated modal attribute to closeOnEscape in ${filePath}`);
        }
      }

      // For TypeScript files, update object properties and configurations
      if (filePath.endsWith('.ts')) {
        // Handle object property assignment modal: true|false
        const modalPropertyRegex = /(\bmodal\s*:\s*)(true|false)/g;
        if (modalPropertyRegex.test(fileContent)) {
          modalPropertyRegex.lastIndex = 0;
          fileContent = fileContent.replace(modalPropertyRegex, (_, _prefix, value) => {
            return `closeOnEscape: ${value}`;
          });
          hasChanged = true;
          context.logger.info(`Updated modal property to closeOnEscape in ${filePath}`);
        }
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
      }
    });

    return tree;
  };
}

// Migration: Update Angular configuration (angular.json)
function updateAngularConfig(): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    context.logger.info('Updating Angular configuration...');

    const angularJsonPath = '/angular.json';
    if (!tree.exists(angularJsonPath)) {
      context.logger.info(
        'No angular.json file found, skipping configuration update'
      );
      return tree;
    }

    const angularJson = JSON.parse(
      tree.read(angularJsonPath)!.toString('utf-8')
    );
    let hasChanged = false;

    // Process each project in the workspace
    for (const projectName in angularJson.projects) {
      const project = angularJson.projects[projectName];

      // Check for styles configuration
      if (project.architect?.build?.options?.styles) {
        const styles = project.architect.build.options.styles;
        const newStyles = styles.filter((style: any) => {
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
function updateDirectives(): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    context.logger.info('Migrating PrimeNG directives...');

    const directiveMappings: Record<string, string> = {
      'pAnimate': 'pAnimateOnScroll',
      'pDefer': '' // Removed in favor of Angular @defer
    };

    tree.visit((filePath: string) => {
      if (!filePath.endsWith('.html')) return;

      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;

      let hasChanged = false;

      for (const [oldDirective, newDirective] of Object.entries(directiveMappings)) {
        // Use word boundaries to ensure we're replacing the full directive name
        const directiveRegex = new RegExp(`\\b${oldDirective}\\b`, 'g');
        
        if (directiveRegex.test(fileContent)) {
          directiveRegex.lastIndex = 0;
          const beforeReplace: string = fileContent;
          fileContent = fileContent.replace(directiveRegex, newDirective);
          
          if (beforeReplace !== fileContent) {
            hasChanged = true;
            
            // Add a warning for pDefer removal
            if (oldDirective === 'pDefer') {
              context.logger.warn(
                `Found pDefer directive in ${filePath} - this has been removed in PrimeNG v18. Please use Angular's @defer instead.`
              );
            } else {
              context.logger.info(`Updated directive '${oldDirective}' to '${newDirective || '(removed)'}' in ${filePath}`);
            }
          }
        }
      }

      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
      }
    });

    return tree;
  };
}

// Main migration function
function migrateToV18(options: MigrationOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('Starting PrimeNG v17 to v18 migration...');

    // Check git status if not skipped
    if (!options.skipGitCheck && hasUnstagedChanges()) {
      context.logger.warn('There are unstaged changes in the git repository.');
      context.logger.info('Attempting to stash changes...');

      if (!stashChanges()) {
        context.logger.error(
          'Failed to stash changes. Please commit or stash your changes manually before running this migration, or use --skipGitCheck to bypass this check.'
        );
        return Promise.resolve(tree);
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

    // Execute migrations chain
    const updatedTree = migrationChain(tree, context);
    
    // Schedule npm install task after all migrations
    context.addTask(new NodePackageInstallTask());
    
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

    return updatedTree;
  };
}

// Export the migration schematic
export { migrateToV18 };
