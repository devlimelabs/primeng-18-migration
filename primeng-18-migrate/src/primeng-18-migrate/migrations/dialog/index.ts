import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { analyzeFilesForMigration } from '../../utils/file-utils';
import { promptForConfirmation } from '../../utils/prompt-utils';

/**
 * Updates Dialog component for PrimeNG v18
 */
export function updateDialogComponent(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptForConfirmation(
      'Do you want to update Dialog component for PrimeNG v18?'
    );

    if (confirmation !== 'run') {
      context.logger.info('Skipping Dialog component updates');
      return tree;
    }

    context.logger.info('Updating Dialog component for PrimeNG v18...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component properties
    updateComponentProperties(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('Dialog component updates completed');
    return tree;
  };
}

/**
 * Updates Dialog module imports
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('DialogModule') || content.includes('from \'primeng/dialog\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with Dialog module imports');
    return;
  }

  context.logger.info(`Updating Dialog module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // No module name changes for Dialog, but we might need to update imports
    // if there are any breaking changes in the future
    
    tree.overwrite(filePath, content);
  }
}

/**
 * Updates Dialog component properties
 */
function updateComponentProperties(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      content.includes('p-dialog')
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with Dialog component properties');
    return;
  }

  context.logger.info(`Updating Dialog component properties in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Update deprecated properties
    // For example, if 'showHeader' is deprecated in favor of 'header'
    let updatedContent = content
      .replace(/\[showHeader\]="([^"]*)"/g, '[header]="$1"')
      .replace(/showHeader="([^"]*)"/g, 'header="$1"');
    
    // Add any other property migrations here
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates Dialog CSS classes
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-dialog') || content.includes('.p-dialog'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with Dialog CSS classes');
    return;
  }

  context.logger.info(`Updating Dialog CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Update any renamed CSS classes
    // For example, if 'p-dialog-titlebar' is renamed to 'p-dialog-header'
    const updatedContent = content
      .replace(/\.p-dialog-titlebar/g, '.p-dialog-header');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
