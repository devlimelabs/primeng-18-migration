import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { analyzeFilesForMigration } from '../../utils/file-utils';
import { commitChanges, hasUnstagedChanges } from '../../utils/git-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG Sidebar to Drawer
 * - Updates module imports from SidebarModule to DrawerModule
 * - Updates component selectors from p-sidebar to p-drawer
 * - Updates CSS classes
 */
export function migrateSidebarToDrawer(): Rule {
  // Track if we had unstaged changes at the start
  let hadUnstagedChanges = false;
  
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptConfirm(
      'Do you want to migrate Sidebar to Drawer?'
    );

    if (!confirmation) {
      context.logger.info('Skipping Sidebar to Drawer migration');
      return tree;
    }

    // Check for unstaged changes before beginning
    hadUnstagedChanges = hasUnstagedChanges();
    if (hadUnstagedChanges) {
      context.logger.warn('Unstaged Git changes detected. Changes made by this migration will not be auto-committed.');
    } else {
      context.logger.info('No unstaged Git changes detected. You will be prompted to commit changes after migration.');
    }

    context.logger.info('Migrating Sidebar to Drawer...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    // Remove deprecated size property
    removeDeprecatedSizeProperty(tree, context);
    
    context.logger.info('Sidebar to Drawer migration completed');

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
              'feat(primeng18): migrate Sidebar to Drawer component', 
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
 * Updates module imports from SidebarModule to DrawerModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
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
      .replace(/SidebarModule/g, 'DrawerModule')
      .replace(/from ['"]primeng\/sidebar['"]/g, 'from \'primeng/drawer\'');
    
    // Replace any direct imports from the sidebar module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/sidebar['"]/g, 'import {$1} from \'primeng/drawer\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-sidebar to p-drawer
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
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
      .replace(/<p-sidebar/g, '<p-drawer')
      .replace(/<\/p-sidebar>/g, '</p-drawer>')
      .replace(/selector: ['"]p-sidebar['"]/g, 'selector: \'p-drawer\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to sidebar
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
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
      .replace(/\.p-sidebar/g, '.p-drawer')
      .replace(/p-sidebar-/g, 'p-drawer-')
      .replace(/p-sidebar/g, 'p-drawer');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Removes the deprecated size property from p-sidebar (now p-drawer)
 * According to migration docs, size property has been removed
 */
function removeDeprecatedSizeProperty(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html')) && 
      (content.includes('[size]') || content.includes('size='))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with size property in sidebar elements');
    return;
  }

  context.logger.info(`Removing deprecated size property in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Remove size property from both p-sidebar and the new p-drawer elements
    // This regex matches both [size]="..." and size="..." attributes
    const updatedContent = content
      .replace(/<(p-sidebar|p-drawer)[^>]*?\s+(?:\[size\]|\bsize\b)=['"][^'"]*['"][^>]*?>/g, (match) => {
        return match
          .replace(/\s+\[size\]=['"][^'"]*['"]/g, '')
          .replace(/\s+size=['"][^'"]*['"]/g, '');
      });
    
    // Add a comment about the size property removal
    const commentedContent = updatedContent.replace(
      /(<p-drawer[^>]*?>)/g,
      '$1<!-- Note: size property has been removed from Drawer, use responsive class utility instead -->'
    );
    
    tree.overwrite(filePath, commentedContent);
  }
} 
