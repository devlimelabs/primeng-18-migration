import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { Schema } from '../../schema';
import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG Chips to AutoComplete
 * - Updates module imports from ChipsModule to AutoCompleteModule
 * - Updates component selectors from p-chips to p-autoComplete
 * - Updates CSS classes
 * - Updates component properties
 */
export function migrateChipsToAutoComplete(options: Schema = {}): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    // Skip the confirmation prompt if this is part of a parent migration
    let proceed = true;
    if (!options.partOfParentMigration) {
      proceed = await promptConfirm('Do you want to migrate Chips to AutoComplete?');
      
      if (!proceed) {
        context.logger.info('Skipping Chips to AutoComplete migration');
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

    context.logger.info('Migrating Chips to AutoComplete...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('Chips to AutoComplete migration completed');

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
              'feat(primeng18): migrate Chips to AutoComplete component', 
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
 * Updates module imports from ChipsModule to AutoCompleteModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      filePath.endsWith('.ts') && 
      (content.includes('ChipsModule') || content.includes('from \'primeng/chips\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with ChipsModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/ChipsModule/g, 'AutoCompleteModule')
      .replace(/from ['"]primeng\/chips['"]/g, 'from \'primeng/autocomplete\'');
    
    // Replace any direct imports from the chips module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/chips['"]/g, 'import {$1} from \'primeng/autocomplete\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-chips to p-autoComplete
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      content.includes('p-chips')
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-chips selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace component selectors
    let updatedContent = content
      .replace(/<p-chips/g, '<p-autoComplete')
      .replace(/<\/p-chips>/g, '</p-autoComplete>')
      .replace(/selector: ['"]p-chips['"]/g, 'selector: \'p-autoComplete\'');
    
    // Update properties
    updatedContent = updatedContent
      // Add multiple property to enable multiple selection
      .replace(/(<p-autoComplete[^>]*?)>/g, '$1 [multiple]="true">');
    
    // Add a comment about the migration
    updatedContent = updatedContent.replace(
      /(<p-autoComplete[^>]*?>)/g,
      '$1<!-- Note: This component was migrated from Chips to AutoComplete. Please review the properties and behavior. -->'
    );
    
    // Add a comment about property changes
    updatedContent = updatedContent.replace(
      /(<p-autoComplete[^>]*?)([\s\n]*)(.*?)>/g,
      (match: string, start: string, whitespace: string, props: string) => {
        // Check for properties that need to be updated
        if (props.includes('field=') || props.includes('[field]=')) {
          return `${start}${whitespace}${props}<!-- Note: 'field' property in Chips maps to 'field' in AutoComplete, but behavior may differ. -->${whitespace}>`;
        }
        if (props.includes('placeholder=') || props.includes('[placeholder]=')) {
          return `${start}${whitespace}${props}<!-- Note: 'placeholder' property works the same in AutoComplete. -->${whitespace}>`;
        }
        if (props.includes('disabled=') || props.includes('[disabled]=')) {
          return `${start}${whitespace}${props}<!-- Note: 'disabled' property works the same in AutoComplete. -->${whitespace}>`;
        }
        if (props.includes('style=') || props.includes('[style]=')) {
          return `${start}${whitespace}${props}<!-- Note: 'style' property works the same in AutoComplete. -->${whitespace}>`;
        }
        if (props.includes('styleClass=') || props.includes('[styleClass]=')) {
          return `${start}${whitespace}${props}<!-- Note: 'styleClass' property works the same in AutoComplete. -->${whitespace}>`;
        }
        if (props.includes('(onAdd)=')) {
          return `${start}${whitespace}${props.replace(/\(onAdd\)=/g, '(onSelect)=')}<!-- Note: 'onAdd' event in Chips maps to 'onSelect' in AutoComplete. -->${whitespace}>`;
        }
        if (props.includes('(onRemove)=')) {
          return `${start}${whitespace}${props.replace(/\(onRemove\)=/g, '(onUnselect)=')}<!-- Note: 'onRemove' event in Chips maps to 'onUnselect' in AutoComplete. -->${whitespace}>`;
        }
        return match;
      }
    );
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to chips
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-chips') || content.includes('.p-chips'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with chips CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-chips/g, '.p-autocomplete')
      .replace(/p-chips-/g, 'p-autocomplete-')
      .replace(/p-chips/g, 'p-autocomplete');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
