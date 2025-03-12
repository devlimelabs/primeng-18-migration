import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { Schema } from '../../schema';
import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG Messages to Message
 * - Updates module imports from MessagesModule to MessageModule
 * - Updates component selectors from p-messages to individual p-message components
 * - Updates Message interface to ToastMessageOptions
 * - Updates CSS classes
 */
export function migrateMessagesToMessage(options: Schema = {}): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    // Skip the confirmation prompt if this is part of a parent migration
    let proceed = true;
    if (!options.partOfParentMigration) {
      proceed = await promptConfirm('Do you want to migrate Messages to Message?');
      
      if (!proceed) {
        context.logger.info('Skipping Messages to Message migration');
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

    context.logger.info('Migrating Messages to Message...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update Message interface to ToastMessageOptions
    updateMessageInterface(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('Messages to Message migration completed');

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
              'feat(primeng18): migrate Messages to Message component', 
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
 * Updates module imports from MessagesModule to MessageModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('MessagesModule') || content.includes('from \'primeng/messages\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with MessagesModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/MessagesModule/g, 'MessageModule')
      .replace(/from ['"]primeng\/messages['"]/g, 'from \'primeng/message\'');
    
    // Replace any direct imports from the messages module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/messages['"]/g, 'import {$1} from \'primeng/message\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-messages to p-message
 * This is more complex as the structure changes significantly
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      content.includes('p-messages')
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-messages selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // This is a complex transformation as Messages component is a wrapper for multiple messages
    // while Message is a single message component
    // We'll add a comment to alert the developer that manual changes are needed
    
    let updatedContent = content;
    
    // Add a comment for manual review
    updatedContent = updatedContent.replace(
      /<p-messages([^>]*)>/g,
      (match, _attributes) => {
        return `<!-- MIGRATION NOTICE: Messages to Message migration requires manual changes.
               The Messages component was a wrapper for multiple messages, but now you need to use
               individual Message components. Example:
               <div *ngFor="let msg of messages">
                 <p-message [severity]="msg.severity" [text]="msg.summary"></p-message>
               </div> -->
               ${match}`;
      }
    );
    
    // Replace the component tag in TypeScript files
    if (filePath.endsWith('.ts')) {
      updatedContent = updatedContent
        .replace(/selector: ['"]p-messages['"]/g, 'selector: \'p-message\'');
    }
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates Message interface to ToastMessageOptions
 */
function updateMessageInterface(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('Message') && content.includes('from \'primeng/api\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with Message interface imports');
    return;
  }

  context.logger.info(`Updating Message interface in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace Message interface with ToastMessageOptions
    let updatedContent = content;
    
    // Update import statements
    updatedContent = updatedContent.replace(
      /import {([^}]*)} from ['"]primeng\/api['"]/g,
      (match, imports) => {
        // Check if Message is imported
        if (imports.includes('Message')) {
          // Replace Message with ToastMessageOptions
          const updatedImports = imports.replace(/\bMessage\b/g, 'ToastMessageOptions');
          return `import {${updatedImports}} from 'primeng/api'`;
        }
        return match;
      }
    );
    
    // Update variable and parameter type declarations
    updatedContent = updatedContent
      .replace(/: Message(\[\])?/g, ': ToastMessageOptions$1')
      .replace(/as Message(\[\])?/g, 'as ToastMessageOptions$1')
      .replace(/<Message(\[\])?>/g, '<ToastMessageOptions$1>');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to messages
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-messages') || content.includes('.p-messages'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with messages CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-messages/g, '.p-message')
      .replace(/p-messages-/g, 'p-message-')
      .replace(/p-messages/g, 'p-message');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
