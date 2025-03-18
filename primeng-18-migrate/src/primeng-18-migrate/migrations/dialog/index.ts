import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { Schema } from '../../schema';
import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Updates Dialog component for PrimeNG v18
 */
export function updateDialogComponent(options: Schema = {}): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    // Skip the confirmation prompt if this is part of a parent migration
    let proceed = true;
    if (!options.partOfParentMigration) {
      proceed = await promptConfirm(
        'Do you want to update Dialog component for PrimeNG v18?'
      );
      
      if (!proceed) {
        context.logger.info('Skipping Dialog component updates');
        return tree;
      }
    }

    // Skip Git checks if this is part of a parent migration or skipGitCheck is true
    if (!options.partOfParentMigration && !options.skipGitCheck) {
      // Check for unstaged changes before beginning
      hadUnstagedChanges = hasUnstagedChanges();
      if (hadUnstagedChanges) {
        context.logger.warn('Unstaged Git changes detected. Changes made by this migration will not be auto-committed.');
      } else {
        context.logger.info('No unstaged Git changes detected. You will be prompted to commit changes after migration.');
      }
    }

    context.logger.info('Updating Dialog component for PrimeNG v18...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component properties
    updateComponentProperties(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('Dialog component updates completed');

    // Skip commit operations if this is part of a parent migration or skipCommit is true
    if (options.partOfParentMigration || options.skipCommit) {
      return tree;
    }

    // Only offer to commit if there were no unstaged changes before we started
    if (!hadUnstagedChanges) {
      context.logger.info('Migration completed successfully.');
      
      // Ask user if they want to commit the changes
      const commitConfirmation = await promptConfirm(
        'Do you want to commit the migration changes?',
        true
      );
      
      if (commitConfirmation) {
        context.logger.info('Attempting to commit changes...');
        
        // Directly commit changes without setTimeout
        const commitSuccess = commitChanges(
          'feat(primeng18): update Dialog component for v18', 
          context.logger
        );
        
        if (commitSuccess) {
          context.logger.info('Changes have been committed successfully');
        } else {
          context.logger.error('Failed to commit changes');
        }
      } else {
        context.logger.info('Changes were not committed');
      }
    }
    
    return tree;
  };
}

/**
 * Updates Dialog module imports
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('DialogModule') || content.includes('from \'primeng/dialog\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with Dialog module imports');
    return;
  }

  context.logger.info(`Updating Dialog module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // No module name changes for Dialog, but we might need to update imports
    // if there are any breaking changes in the future
    const updatedContent = content;
    
    // Only write if content has changed
    if (updatedContent !== content) {
      tree.overwrite(filePath, updatedContent);
    }
  }
}

/**
 * Updates Dialog component properties
 */
function updateComponentProperties(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      content.includes('p-dialog')
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with Dialog component properties');
    return;
  }

  context.logger.info(`Updating Dialog component properties in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Update deprecated properties
    // For example, if 'showHeader' is deprecated in favor of 'header'
    let updatedContent = content
      .replace(/\[showHeader\]="([^"]*)"/g, '[header]="$1"')
      .replace(/showHeader="([^"]*)"/g, 'header="$1"');
    
    // Add any other property migrations here
    
    // Only write if content has changed
    if (updatedContent !== content) {
      tree.overwrite(filePath, updatedContent);
    }
  }
}

/**
 * Updates Dialog CSS classes
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-dialog') || content.includes('.p-dialog'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with Dialog CSS classes');
    return;
  }

  context.logger.info(`Updating Dialog CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Update any renamed CSS classes
    // For example, if 'p-dialog-titlebar' is renamed to 'p-dialog-header'
    const updatedContent = content
      .replace(/\.p-dialog-titlebar/g, '.p-dialog-header');
    
    // Only write if content has changed
    if (updatedContent !== content) {
      tree.overwrite(filePath, updatedContent);
    }
  }
} 
