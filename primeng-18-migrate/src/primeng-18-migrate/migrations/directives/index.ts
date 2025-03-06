import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { analyzeFilesForMigration } from '../../utils/file-utils';
import { promptForConfirmation } from '../../utils/prompt-utils';

/**
 * Updates PrimeNG directives for v18
 */
export function updateDirectives(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptForConfirmation(
      'Do you want to update PrimeNG directives for v18?'
    );

    if (confirmation !== 'run') {
      context.logger.info('Skipping directive updates');
      return tree;
    }

    context.logger.info('Updating PrimeNG directives for v18...');
    
    // Update directive imports
    updateDirectiveImports(tree, context);
    
    // Update directive usage
    updateDirectiveUsage(tree, context);
    
    context.logger.info('Directive updates completed');
    return tree;
  };
}

/**
 * Updates directive imports
 */
function updateDirectiveImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (
        content.includes('from \'primeng/ripple\'') || 
        content.includes('from \'primeng/tooltip\'') ||
        content.includes('from \'primeng/focustrap\'')
      )
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with directive imports');
    return;
  }

  context.logger.info(`Updating directive imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Update imports for standalone directives
    const updatedContent = content
      // Update Ripple directive import
      .replace(/import { Ripple(.*) } from ['"]primeng\/ripple['"]/g, 'import { Ripple$1 } from \'primeng/directives/ripple\'')
      // Update Tooltip directive import
      .replace(/import { Tooltip(.*) } from ['"]primeng\/tooltip['"]/g, 'import { Tooltip$1 } from \'primeng/directives/tooltip\'')
      // Update FocusTrap directive import
      .replace(/import { FocusTrap(.*) } from ['"]primeng\/focustrap['"]/g, 'import { FocusTrap$1 } from \'primeng/directives/focustrap\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates directive usage in templates
 */
function updateDirectiveUsage(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      (
        content.includes('pRipple') || 
        content.includes('pTooltip') ||
        content.includes('pFocusTrap')
      )
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with directive usage');
    return;
  }

  context.logger.info(`Updating directive usage in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Update directive attributes if needed
    // For example, if a directive attribute has been renamed
    const updatedContent = content
      // Example: Update pTooltip options
      .replace(/\[tooltipPosition\]="([^"]*)"/g, '[pTooltipPosition]="$1"')
      .replace(/tooltipPosition="([^"]*)"/g, 'pTooltipPosition="$1"');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
