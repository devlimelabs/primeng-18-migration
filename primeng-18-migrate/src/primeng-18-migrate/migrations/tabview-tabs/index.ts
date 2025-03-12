import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { Schema } from '../../schema';
import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG TabView to Tabs
 * - Updates module imports from TabViewModule to TabsModule
 * - Updates component selectors from p-tabView to p-tabs
 * - Updates p-tabPanel to maintain compatibility
 * - Updates CSS classes
 */
export function migrateTabViewToTabs(options: Schema = {}): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    // Skip the confirmation prompt if this is part of a parent migration
    let proceed = true;
    if (!options.partOfParentMigration) {
      proceed = await promptConfirm('Do you want to migrate TabView to Tabs?');
      
      if (!proceed) {
        context.logger.info('Skipping TabView to Tabs migration');
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

    context.logger.info('Migrating TabView to Tabs...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('TabView to Tabs migration completed');

    // Skip commit operations if this is part of a parent migration or skipCommit is true
    if (options.partOfParentMigration || options.skipCommit) {
      return tree;
    }

    // Return a rule that will commit changes after the Tree has been processed
    return async (finalTree: Tree, finalContext: SchematicContext) => {
      // Only offer to commit if there were no unstaged changes before we started
      if (!hadUnstagedChanges) {
        finalContext.logger.info('Migration completed successfully.');
        
        // Ask user if they want to commit the changes
        const commitConfirmation = await promptConfirm(
          'Do you want to commit the migration changes?',
          true
        );
        
        if (commitConfirmation) {
          finalContext.logger.info('Attempting to commit changes...');
          
          // We need to add a small delay to ensure the file system is synced
          // and the git operations work correctly
          setTimeout(() => {
            const commitSuccess = commitChanges(
              'feat(primeng18): migrate TabView to Tabs component', 
              finalContext.logger
            );
            
            if (commitSuccess) {
              finalContext.logger.info('Changes have been committed successfully');
            } else {
              finalContext.logger.error('Failed to commit changes');
            }
          }, 1000);
        } else {
          finalContext.logger.info('Changes were not committed');
        }
      }
      
      return finalTree;
    };
  };
}

/**
 * Updates module imports from TabViewModule to TabsModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('TabViewModule') || content.includes('from \'primeng/tabview\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with TabViewModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/TabViewModule/g, 'TabsModule')
      .replace(/from ['"]primeng\/tabview['"]/g, 'from \'primeng/tabs\'');
    
    // Replace any direct imports from the tabview module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/tabview['"]/g, 'import {$1} from \'primeng/tabs\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-tabView to p-tabs
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      (content.includes('p-tabView') || content.includes('p-tabview'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-tabView selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace component selectors - handle both casing variants
    const updatedContent = content
      .replace(/<p-tabView/gi, '<p-tabs')
      .replace(/<\/p-tabView>/gi, '</p-tabs>')
      .replace(/selector: ['"]p-tabView['"]/gi, 'selector: \'p-tabs\'')
      .replace(/selector: ['"]p-tabview['"]/gi, 'selector: \'p-tabs\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to tabview
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-tabview') || content.includes('.p-tabview'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with tabview CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-tabview/g, '.p-tabs')
      .replace(/p-tabview-/g, 'p-tabs-')
      .replace(/p-tabview/g, 'p-tabs');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
