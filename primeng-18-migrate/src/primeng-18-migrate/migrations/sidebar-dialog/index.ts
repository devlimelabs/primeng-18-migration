import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG Sidebar to Dialog
 * - Updates module imports from SidebarModule to DialogModule
 * - Updates component selectors from p-sidebar to p-dialog
 * - Updates CSS classes
 * - Updates component properties
 */
export function migrateSidebarToDialog(): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptConfirm(
      'Do you want to migrate Sidebar to Dialog?'
    );

    if (!confirmation) {
      context.logger.info('Skipping Sidebar to Dialog migration');
      return tree;
    }

    // Check for unstaged changes before beginning
    hadUnstagedChanges = hasUnstagedChanges();
    if (hadUnstagedChanges) {
      context.logger.warn('Unstaged Git changes detected. Changes made by this migration will not be auto-committed.');
    } else {
      context.logger.info('No unstaged Git changes detected. You will be prompted to commit changes after migration.');
    }

    context.logger.info('Migrating Sidebar to Dialog...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    // Update component properties
    updateComponentProperties(tree, context);
    
    context.logger.info('Sidebar to Dialog migration completed');

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
              'feat(primeng18): migrate Sidebar to Dialog component', 
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
 * Updates module imports from SidebarModule to DialogModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      filePath.endsWith('.ts') && 
      (content.includes('SidebarModule') || content.includes('from \'primeng/sidebar\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with SidebarModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/SidebarModule/g, 'DialogModule')
      .replace(/from ['"]primeng\/sidebar['"]/g, 'from \'primeng/dialog\'');
    
    // Replace any direct imports from the sidebar module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/sidebar['"]/g, 'import {$1} from \'primeng/dialog\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-sidebar to p-dialog
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      content.includes('p-sidebar')
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-sidebar selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace component selectors
    const updatedContent = content
      .replace(/<p-sidebar/g, '<p-dialog')
      .replace(/<\/p-sidebar>/g, '</p-dialog>')
      .replace(/selector: ['"]p-sidebar['"]/g, 'selector: \'p-dialog\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to sidebar
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-sidebar') || content.includes('.p-sidebar'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with sidebar CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-sidebar/g, '.p-dialog')
      .replace(/p-sidebar-/g, 'p-dialog-')
      .replace(/p-sidebar/g, 'p-dialog');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component properties from Sidebar to Dialog
 */
function updateComponentProperties(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      filePath.endsWith('.html') && 
      (content.includes('p-sidebar') || content.includes('p-dialog'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with sidebar properties');
    return;
  }

  context.logger.info(`Updating component properties in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Update properties
    let updatedContent = content;
    
    // Replace position property
    // Sidebar position (left, right, top, bottom) to Dialog position (left, right, top, bottom, topleft, topright, bottomleft, bottomright)
    updatedContent = updatedContent.replace(
      /\[position\]="([^"]*)"/g,
      (_match: string, position: string) => {
        // Add a comment about the position property change
        return `[position]="${position}" <!-- Note: Dialog position has more options than Sidebar: left, right, top, bottom, topleft, topright, bottomleft, bottomright -->`;
      }
    );
    
    // Replace fullScreen property
    // Sidebar fullScreen to Dialog maximizable
    updatedContent = updatedContent.replace(
      /\[fullScreen\]="([^"]*)"/g,
      '[maximizable]="$1" <!-- Note: fullScreen property has been replaced with maximizable -->'
    );
    
    // Replace blockScroll property (same in both components, but add a note)
    updatedContent = updatedContent.replace(
      /\[blockScroll\]="([^"]*)"/g,
      '[blockScroll]="$1" <!-- Note: blockScroll works the same in Dialog -->'
    );
    
    // Replace dismissible property (same in both components, but add a note)
    updatedContent = updatedContent.replace(
      /\[dismissible\]="([^"]*)"/g,
      '[dismissible]="$1" <!-- Note: dismissible works the same in Dialog -->'
    );
    
    // Replace showCloseIcon property (same in both components, but add a note)
    updatedContent = updatedContent.replace(
      /\[showCloseIcon\]="([^"]*)"/g,
      '[showCloseIcon]="$1" <!-- Note: showCloseIcon works the same in Dialog -->'
    );
    
    // Replace baseZIndex property (same in both components, but add a note)
    updatedContent = updatedContent.replace(
      /\[baseZIndex\]="([^"]*)"/g,
      '[baseZIndex]="$1" <!-- Note: baseZIndex works the same in Dialog -->'
    );
    
    // Replace autoZIndex property (same in both components, but add a note)
    updatedContent = updatedContent.replace(
      /\[autoZIndex\]="([^"]*)"/g,
      '[autoZIndex]="$1" <!-- Note: autoZIndex works the same in Dialog -->'
    );
    
    // Replace modal property (same in both components, but add a note)
    updatedContent = updatedContent.replace(
      /\[modal\]="([^"]*)"/g,
      '[modal]="$1" <!-- Note: modal works the same in Dialog -->'
    );
    
    // Replace closeOnEscape property (same in both components, but add a note)
    updatedContent = updatedContent.replace(
      /\[closeOnEscape\]="([^"]*)"/g,
      '[closeOnEscape]="$1" <!-- Note: closeOnEscape works the same in Dialog -->'
    );
    
    // Replace appendTo property (same in both components, but add a note)
    updatedContent = updatedContent.replace(
      /\[appendTo\]="([^"]*)"/g,
      '[appendTo]="$1" <!-- Note: appendTo works the same in Dialog -->'
    );
    
    // Add a general comment about the migration
    updatedContent = updatedContent.replace(
      /(<p-dialog[^>]*?>)/g,
      '$1<!-- Note: This component was migrated from Sidebar to Dialog. Please review the properties and behavior. -->'
    );
    
    tree.overwrite(filePath, updatedContent);
  }
} 
