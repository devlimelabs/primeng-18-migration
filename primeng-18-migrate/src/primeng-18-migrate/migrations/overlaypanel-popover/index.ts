import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { execSync } from 'child_process';

import { analyzeFilesForMigration } from '../../utils/file-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Check if there are unstaged changes in the Git repository
 */
function hasGitChanges(): boolean {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf8' });
    return output.trim().length > 0;
  } catch (error) {
    console.error('Error checking Git status:', error);
    return false;
  }
}

/**
 * Commit changes to the Git repository
 */
function commitGitChanges(message: string, logger: SchematicContext['logger']): boolean {
  try {
    logger.info('Staging all changes for commit...');
    execSync('git add --all', { 
      encoding: 'utf8',
      stdio: 'pipe' 
    });
    
    // Check if there are changes to commit
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
    if (statusOutput.trim().length === 0) {
      logger.info('No changes to commit');
      return false;
    }
    
    logger.info(`Committing with message: "${message}"`);
    execSync(`git commit -m "${message}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    return true;
  } catch (error) {
    logger.error(`Error committing changes: ${error}`);
    return false;
  }
}

/**
 * Migrates PrimeNG OverlayPanel to Popover
 * - Updates module imports from OverlayPanelModule to PopoverModule
 * - Updates component selectors from p-overlayPanel to p-popover
 * - Updates CSS classes
 */
export function migrateOverlayPanelToPopover(): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptConfirm(
      'Do you want to migrate OverlayPanel to Popover?'
    );

    if (!confirmation) {
      context.logger.info('Skipping OverlayPanel to Popover migration');
      return tree;
    }

    // Check for unstaged changes before beginning
    hadUnstagedChanges = hasGitChanges();
    if (hadUnstagedChanges) {
      context.logger.warn('Unstaged Git changes detected. Changes made by this migration will not be auto-committed.');
    } else {
      context.logger.info('No unstaged Git changes detected. You will be prompted to commit changes after migration.');
    }

    context.logger.info('Migrating OverlayPanel to Popover...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('OverlayPanel to Popover migration completed');

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
            const commitSuccess = commitGitChanges(
              'feat(primeng18): migrate OverlayPanel to Popover component', 
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
 * Updates module imports from OverlayPanelModule to PopoverModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('OverlayPanelModule') || content.includes('from \'primeng/overlaypanel\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with OverlayPanelModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/OverlayPanelModule/g, 'PopoverModule')
      .replace(/from ['"]primeng\/overlaypanel['"]/g, 'from \'primeng/popover\'');
    
    // Replace any direct imports from the overlaypanel module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/overlaypanel['"]/g, 'import {$1} from \'primeng/popover\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-overlayPanel to p-popover
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      (content.includes('p-overlayPanel') || content.includes('p-overlaypanel'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-overlayPanel selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace component selectors - handle both casing variants
    const updatedContent = content
      .replace(/<p-overlayPanel/gi, '<p-popover')
      .replace(/<\/p-overlayPanel>/gi, '</p-popover>')
      .replace(/selector: ['"]p-overlayPanel['"]/gi, 'selector: \'p-popover\'')
      .replace(/selector: ['"]p-overlaypanel['"]/gi, 'selector: \'p-popover\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to overlaypanel
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-overlaypanel') || content.includes('.p-overlaypanel'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with overlaypanel CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-overlaypanel/g, '.p-popover')
      .replace(/p-overlaypanel-/g, 'p-popover-')
      .replace(/p-overlaypanel/g, 'p-popover');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
