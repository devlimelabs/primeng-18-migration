import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { Schema } from '../../schema';
import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG Calendar to DatePicker
 * - Updates module imports from CalendarModule to DatePickerModule
 * - Updates component selectors from p-calendar to p-datepicker
 * - Updates CSS classes
 */
export function migrateCalendarToDatePicker(options: Schema = {}): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    // Skip the confirmation prompt if this is part of a parent migration
    let proceed = true;
    if (!options.partOfParentMigration) {
      proceed = await promptConfirm('Do you want to migrate Calendar to DatePicker?');
      
      if (!proceed) {
        context.logger.info('Skipping Calendar to DatePicker migration');
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

    context.logger.info('Migrating Calendar to DatePicker...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('Calendar to DatePicker migration completed');

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
              'feat(primeng18): migrate Calendar to DatePicker component', 
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
 * Updates module imports from CalendarModule to DatePickerModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('CalendarModule') || content.includes('from \'primeng/calendar\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with CalendarModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/CalendarModule/g, 'DatePickerModule')
      .replace(/from ['"]primeng\/calendar['"]/g, 'from \'primeng/datepicker\'');
    
    // Replace any direct imports from the calendar module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/calendar['"]/g, 'import {$1} from \'primeng/datepicker\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-calendar to p-datepicker
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      content.includes('p-calendar')
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-calendar selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace component selectors
    const updatedContent = content
      .replace(/<p-calendar/g, '<p-datepicker')
      .replace(/<\/p-calendar>/g, '</p-datepicker>')
      .replace(/selector: ['"]p-calendar['"]/g, 'selector: \'p-datepicker\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to calendar
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-calendar') || content.includes('.p-calendar'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with calendar CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-calendar/g, '.p-datepicker')
      .replace(/p-calendar-/g, 'p-datepicker-')
      .replace(/p-calendar/g, 'p-datepicker');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
