/**
 * PrimeNG v17 to v18 Migration Schematics
 * 
 * This file contains schematics for migrating from PrimeNG v17 to v18.
 * To use this, create an Angular schematic collection.
 */

const { Rule, SchematicContext, Tree, chain } = require('@angular-devkit/schematics');
const { execSync } = require('child_process');
const { getWorkspace } = require('@schematics/angular/utility/workspace');
const { createProgram } = require('@angular/compiler-cli');
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

// Migration: Update module imports
function updateModuleImports() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG module imports...');
    
    const moduleUpdates = [
      {
        oldImport: /import\s+{\s*(.*?)\s*}\s+from\s+['"]primeng\/button['"]/g,
        newImport: "import { $1 } from 'primeng/button'"
      },
      {
        oldImport: /import\s+{\s*(.*?)\s*}\s+from\s+['"]primeng\/inputtext['"]/g,
        newImport: "import { $1 } from 'primeng/inputtext'"
      },
      {
        oldImport: /import\s+{\s*(.*?)\s*}\s+from\s+['"]primeng\/table['"]/g,
        newImport: "import { $1 } from 'primeng/table'"
      }
    ];
    
    tree.visit(filePath => {
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
      
      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated imports in ${filePath}`);
      }
    });
    
    if (commitChanges('refactor(primeng): update module imports for v18')) {
      context.logger.info('Changes committed successfully');
    }
    
    return tree;
  };
}

// Migration: Update CSS classes
function updateCssClasses() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG CSS classes...');
    
    const cssUpdates = [
      {
        oldClass: /p-component/g,
        newClass: 'p-element'
      },
      {
        oldClass: /p-inputtext/g,
        newClass: 'p-input'
      }
    ];
    
    tree.visit(filePath => {
      if (!filePath.endsWith('.html') && !filePath.endsWith('.scss') && !filePath.endsWith('.css')) return;
      
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
    
    if (commitChanges('refactor(primeng): update CSS classes for v18')) {
      context.logger.info('Changes committed successfully');
    }
    
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
        newProperty: '[showTransitionOptions]="'.12s"'
      },
      {
        oldProperty: /\[hideTransitionOptions\]="[^"]*"/g,
        newProperty: '[hideTransitionOptions]="'.12s"'
      }
    ];
    
    tree.visit(filePath => {
      if (!filePath.endsWith('.html')) return;
      
      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;
      
      let hasChanged = false;
      
      for (const update of propertyUpdates) {
        if (update.oldProperty.test(fileContent)) {
          fileContent = fileContent.replace(update.oldProperty, update.newProperty);
          hasChanged = true;
        }
      }
      
      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated component properties in ${filePath}`);
      }
    });
    
    if (commitChanges('refactor(primeng): update component properties for v18')) {
      context.logger.info('Changes committed successfully');
    }
    
    return tree;
  };
}

// Migration: Update Dialog component
function updateDialogComponent() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG Dialog component...');
    
    const dialogUpdates = [
      {
        oldProperty: /([(,]\s*)(modal)(\s*[),])/g,
        newProperty: '$1closeOnEscape$3'
      }
    ];
    
    tree.visit(filePath => {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.html')) return;
      
      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;
      
      let hasChanged = false;
      
      for (const update of dialogUpdates) {
        if (update.oldProperty.test(fileContent)) {
          fileContent = fileContent.replace(update.oldProperty, update.newProperty);
          hasChanged = true;
        }
      }
      
      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated Dialog component in ${filePath}`);
      }
    });
    
    if (commitChanges('refactor(primeng): update Dialog component for v18')) {
      context.logger.info('Changes committed successfully');
    }
    
    return tree;
  };
}

// Migration: Update SelectButton
function updateSelectButton() {
  return (tree, context) => {
    context.logger.info('Migrating PrimeNG SelectButton component...');
    
    const selectButtonUpdates = [
      {
        oldTag: /p-selectButton/g,
        newTag: 'p-selectbutton'
      }
    ];
    
    tree.visit(filePath => {
      if (!filePath.endsWith('.html')) return;
      
      let fileContent = tree.read(filePath)?.toString();
      if (!fileContent) return;
      
      let hasChanged = false;
      
      for (const update of selectButtonUpdates) {
        if (update.oldTag.test(fileContent)) {
          fileContent = fileContent.replace(update.oldTag, update.newTag);
          hasChanged = true;
        }
      }
      
      if (hasChanged) {
        tree.overwrite(filePath, fileContent);
        context.logger.info(`Updated SelectButton in ${filePath}`);
      }
    });
    
    if (commitChanges('refactor(primeng): update SelectButton component for v18')) {
      context.logger.info('Changes committed successfully');
    }
    
    return tree;
  };
}

// Main migration function
function migrateToV18(_options) {
  return async (tree, context) => {
    context.logger.info('Starting PrimeNG v17 to v18 migration...');
    
    // Check git status
    if (hasUnstagedChanges()) {
      context.logger.warn('There are unstaged changes in the git repository.');
      context.logger.info('Attempting to stash changes...');
      
      if (!stashChanges()) {
        context.logger.error('Failed to stash changes. Please commit or stash your changes manually before running this migration.');
        return tree;
      }
      
      context.logger.info('Changes stashed successfully.');
    }
    
    // Execute migrations in sequence
    return chain([
      updateModuleImports(),
      updateCssClasses(),
      updateComponentProperties(),
      updateDialogComponent(),
      updateSelectButton()
    ])(tree, context);
  };
}

// Export the migration schematic
module.exports = {
  migrateToV18
};
