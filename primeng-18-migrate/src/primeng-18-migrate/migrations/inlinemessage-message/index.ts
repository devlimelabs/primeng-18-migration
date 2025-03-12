import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG InlineMessage to Message
 * - Updates module imports from InlineMessageModule to MessageModule
 * - Updates component selectors from p-inlineMessage to p-message
 * - Updates CSS classes
 */
export function migrateInlineMessageToMessage(): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptConfirm(
      'Do you want to migrate InlineMessage to Message?'
    );

    if (!confirmation) {
      context.logger.info('Skipping InlineMessage to Message migration');
      return tree;
    }

    // Check for unstaged changes before beginning
    hadUnstagedChanges = hasUnstagedChanges();
    if (hadUnstagedChanges) {
      context.logger.warn('Unstaged Git changes detected. Changes made by this migration will not be auto-committed.');
    } else {
      context.logger.info('No unstaged Git changes detected. You will be prompted to commit changes after migration.');
    }

    context.logger.info('Migrating InlineMessage to Message...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('InlineMessage to Message migration completed');

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
              'feat(primeng18): migrate InlineMessage to Message component', 
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
 * Updates module imports from InlineMessageModule to MessageModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      filePath.endsWith('.ts') && 
      (content.includes('InlineMessageModule') || content.includes('from \'primeng/inlinemessage\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with InlineMessageModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/InlineMessageModule/g, 'MessageModule')
      .replace(/from ['"]primeng\/inlinemessage['"]/g, 'from \'primeng/message\'');
    
    // Replace any direct imports from the inlinemessage module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/inlinemessage['"]/g, 'import {$1} from \'primeng/message\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-inlineMessage to p-message
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      (content.includes('p-inlineMessage') || content.includes('p-inline-message'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-inlineMessage selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace component selectors
    let updatedContent = content
      .replace(/<p-inlineMessage/g, '<p-message')
      .replace(/<p-inline-message/g, '<p-message')
      .replace(/<\/p-inlineMessage>/g, '</p-message>')
      .replace(/<\/p-inline-message>/g, '</p-message>')
      .replace(/selector: ['"]p-inlineMessage['"]/g, 'selector: \'p-message\'')
      .replace(/selector: ['"]p-inline-message['"]/g, 'selector: \'p-message\'');
    
    // Add a comment about the migration
    updatedContent = updatedContent.replace(
      /(<p-message[^>]*?>)/g,
      '$1<!-- Note: This component was migrated from InlineMessage to Message. Please review the properties and behavior. -->'
    );
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to inlinemessage
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-inlinemessage') || content.includes('.p-inlinemessage') || 
       content.includes('p-inline-message') || content.includes('.p-inline-message'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with inlinemessage CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-inlinemessage/g, '.p-message')
      .replace(/\.p-inline-message/g, '.p-message')
      .replace(/p-inlinemessage-/g, 'p-message-')
      .replace(/p-inline-message-/g, 'p-message-')
      .replace(/p-inlinemessage/g, 'p-message')
      .replace(/p-inline-message/g, 'p-message');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
