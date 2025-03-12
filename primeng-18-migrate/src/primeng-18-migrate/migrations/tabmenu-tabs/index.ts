import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { Schema } from '../../schema';
import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG TabMenu to Tabs
 * - Updates module imports from TabMenuModule to TabsModule
 * - Updates component selectors from p-tabMenu to p-tabs
 * - Transforms TabMenu model to Tabs structure
 * - Updates CSS classes
 */
export function migrateTabMenuToTabs(options: Schema = {}): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    // Skip the confirmation prompt if this is part of a parent migration
    let proceed = true;
    if (!options.partOfParentMigration) {
      proceed = await promptConfirm('Do you want to migrate TabMenu to Tabs?');
      
      if (!proceed) {
        context.logger.info('Skipping TabMenu to Tabs migration');
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

    context.logger.info('Migrating TabMenu to Tabs...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors and structure
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('TabMenu to Tabs migration completed');

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
              'feat(primeng18): migrate TabMenu to Tabs component', 
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
 * Updates module imports from TabMenuModule to TabsModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('TabMenuModule') || content.includes('from \'primeng/tabmenu\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with TabMenuModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/TabMenuModule/g, 'TabsModule')
      .replace(/from ['"]primeng\/tabmenu['"]/g, 'from \'primeng/tabs\'');
    
    // Replace any direct imports from the tabmenu module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/tabmenu['"]/g, 'import {$1} from \'primeng/tabs\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-tabMenu to p-tabs
 * This is more complex as the structure changes significantly
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      (content.includes('p-tabMenu') || content.includes('p-tabmenu'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-tabMenu selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // This is a complex transformation as TabMenu uses a model property
    // while Tabs uses p-tabPanel components
    // We'll add a comment to alert the developer that manual changes might be needed
    
    let updatedContent = content;
    
    // Replace the component tag
    updatedContent = updatedContent
      .replace(/<p-tabMenu/gi, '<p-tabs')
      .replace(/<\/p-tabMenu>/gi, '</p-tabs>')
      .replace(/selector: ['"]p-tabMenu['"]/gi, 'selector: \'p-tabs\'')
      .replace(/selector: ['"]p-tabmenu['"]/gi, 'selector: \'p-tabs\'');
    
    // Add a comment for manual review
    updatedContent = updatedContent.replace(
      /<p-tabs([^>]*)>/gi,
      (match, attributes) => {
        // Check if there's a model attribute
        if (attributes.includes('[model]') || attributes.includes('model=')) {
          return `<!-- MIGRATION NOTICE: TabMenu to Tabs migration requires manual changes.
                 The TabMenu used a model property, but Tabs uses p-tabPanel components.
                 Please convert your model items to p-tabPanel components. Example:
                 <p-tabs>
                   <p-tabPanel header="Header 1"></p-tabPanel>
                   <p-tabPanel header="Header 2"></p-tabPanel>
                 </p-tabs> -->
                 ${match}`;
        }
        return match;
      }
    );
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to tabmenu
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-tabmenu') || content.includes('.p-tabmenu'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with tabmenu CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-tabmenu/g, '.p-tabs')
      .replace(/p-tabmenu-/g, 'p-tabs-')
      .replace(/p-tabmenu/g, 'p-tabs');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
