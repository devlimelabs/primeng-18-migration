import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG InputSwitch to ToggleSwitch
 * - Updates module imports from InputSwitchModule to ToggleSwitchModule
 * - Updates component selectors from p-inputSwitch to p-toggleswitch
 * - Updates CSS classes
 */
export function migrateInputSwitchToToggleSwitch(): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptConfirm(
      'Do you want to migrate InputSwitch to ToggleSwitch?'
    );

    if (!confirmation) {
      context.logger.info('Skipping InputSwitch to ToggleSwitch migration');
      return tree;
    }

    // Check for unstaged changes before beginning
    hadUnstagedChanges = hasUnstagedChanges();
    if (hadUnstagedChanges) {
      context.logger.warn('Unstaged Git changes detected. Changes made by this migration will not be auto-committed.');
    } else {
      context.logger.info('No unstaged Git changes detected. You will be prompted to commit changes after migration.');
    }

    context.logger.info('Migrating InputSwitch to ToggleSwitch...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('InputSwitch to ToggleSwitch migration completed');

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
              'feat(primeng18): migrate InputSwitch to ToggleSwitch component', 
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
 * Updates module imports from InputSwitchModule to ToggleSwitchModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('InputSwitchModule') || content.includes('from \'primeng/inputswitch\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with InputSwitchModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/InputSwitchModule/g, 'ToggleSwitchModule')
      .replace(/from ['"]primeng\/inputswitch['"]/g, 'from \'primeng/toggleswitch\'');
    
    // Replace any direct imports from the inputswitch module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/inputswitch['"]/g, 'import {$1} from \'primeng/toggleswitch\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-inputSwitch to p-toggleswitch
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      (content.includes('p-inputSwitch') || content.includes('p-inputswitch'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-inputSwitch selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace component selectors - handle both casing variants
    const updatedContent = content
      .replace(/<p-inputSwitch/gi, '<p-toggleswitch')
      .replace(/<\/p-inputSwitch>/gi, '</p-toggleswitch>')
      .replace(/selector: ['"]p-inputSwitch['"]/gi, 'selector: \'p-toggleswitch\'')
      .replace(/selector: ['"]p-inputswitch['"]/gi, 'selector: \'p-toggleswitch\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to inputswitch
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-inputswitch') || content.includes('.p-inputswitch'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with inputswitch CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-inputswitch/g, '.p-toggleswitch')
      .replace(/p-inputswitch-/g, 'p-toggleswitch-')
      .replace(/p-inputswitch/g, 'p-toggleswitch');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
