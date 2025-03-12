import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { analyzeFilesForMigration } from '../../utils/file-utils';
import { promptConfirm } from '../../utils/prompt-utils';

/**
 * Updates PrimeNG directives for v18
 */
export function updateDirectives(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptConfirm(
      'Do you want to update PrimeNG directives for v18?'
    );

    if (!confirmation) {
      context.logger.info('Skipping directive updates');
      return tree;
    }

    context.logger.info('Updating PrimeNG directives for v18...');
    
    // Update directive imports
    updateDirectiveImports(tree, context);
    
    // Update directive usage
    updateDirectiveUsage(tree, context);
    
    // Migrate pDefer to Angular defer
    migratePDeferToAngularDefer(tree, context);
    
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
    (filePath: string, content: string) => 
      filePath.endsWith('.ts') && 
      (
        content.includes('from \'primeng/ripple\'') || 
        content.includes('from \'primeng/tooltip\'') ||
        content.includes('from \'primeng/focustrap\'') ||
        content.includes('from \'primeng/defer\'')
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
    let updatedContent = content
      // Update Ripple directive import
      .replace(/import { Ripple(.*) } from ['"]primeng\/ripple['"]/g, 'import { Ripple$1 } from \'primeng/directives/ripple\'')
      // Update Tooltip directive import
      .replace(/import { Tooltip(.*) } from ['"]primeng\/tooltip['"]/g, 'import { Tooltip$1 } from \'primeng/directives/tooltip\'')
      // Update FocusTrap directive import
      .replace(/import { FocusTrap(.*) } from ['"]primeng\/focustrap['"]/g, 'import { FocusTrap$1 } from \'primeng/directives/focustrap\'');
    
    // Add a comment for pDefer imports to alert developers to use Angular's defer
    if (content.includes('from \'primeng/defer\'')) {
      updatedContent = updatedContent.replace(
        /import {([^}]*)} from ['"]primeng\/defer['"]/g,
        '// MIGRATION NOTICE: pDefer is deprecated. Use Angular\'s defer instead.\n// import {$1} from \'primeng/defer\''
      );
    }
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates directive usage in templates
 */
function updateDirectiveUsage(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
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

/**
 * Migrates pDefer directive to Angular's defer
 */
function migratePDeferToAngularDefer(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath: string, content: string) => 
      (filePath.endsWith('.html')) && 
      (content.includes('pDefer') || content.includes('*pDefer'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with pDefer directive');
    return;
  }

  context.logger.info(`Migrating pDefer to Angular defer in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace pDefer with Angular's defer
    // This is a complex transformation as the syntax is different
    let updatedContent = content;
    
    // Replace *pDefer with *ngIf with defer
    updatedContent = updatedContent.replace(
      /<([^>]*)\s+\*pDefer(?:="([^"]*)")?\s*([^>]*)>/g,
      (match: string, elementStart: string, condition: string, elementEnd: string) => {
        // If there's a condition, use it with ngIf
        if (condition) {
          return `<!-- MIGRATION NOTICE: pDefer has been replaced with Angular's defer -->
                 <${elementStart} *ngIf="${condition}; defer" ${elementEnd}>`;
        } else {
          return `<!-- MIGRATION NOTICE: pDefer has been replaced with Angular's defer -->
                 <${elementStart} *ngIf="true; defer" ${elementEnd}>`;
        }
      }
    );
    
    // Replace [pDefer] with *ngIf with defer
    updatedContent = updatedContent.replace(
      /<([^>]*)\s+\[pDefer\]="([^"]*)"([^>]*)>/g,
      (match: string, elementStart: string, condition: string, elementEnd: string) => {
        return `<!-- MIGRATION NOTICE: pDefer has been replaced with Angular's defer -->
               <${elementStart} *ngIf="${condition}; defer" ${elementEnd}>`;
      }
    );
    
    tree.overwrite(filePath, updatedContent);
  }
} 
