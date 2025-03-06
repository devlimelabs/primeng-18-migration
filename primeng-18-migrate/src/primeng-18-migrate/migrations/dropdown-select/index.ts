import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { analyzeFilesForMigration } from '../../utils/file-utils';
import { promptForConfirmation } from '../../utils/prompt-utils';

/**
 * Migrates PrimeNG Dropdown to Select
 * - Updates module imports from DropdownModule to SelectModule
 * - Updates component selectors from p-dropdown to p-select
 * - Updates CSS classes
 */
export function migrateDropdownToSelect(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptForConfirmation(
      'Do you want to migrate Dropdown to Select?'
    );

    if (confirmation !== 'run') {
      context.logger.info('Skipping Dropdown to Select migration');
      return tree;
    }

    context.logger.info('Migrating Dropdown to Select...');
    
    // Update module imports
    updateModuleImports(tree, context);
    
    // Update component selectors
    updateComponentSelectors(tree, context);
    
    // Update CSS classes
    updateCssClasses(tree, context);
    
    context.logger.info('Dropdown to Select migration completed');
    return tree;
  };
}

/**
 * Updates module imports from DropdownModule to SelectModule
 */
function updateModuleImports(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      filePath.endsWith('.ts') && 
      (content.includes('DropdownModule') || content.includes('from \'primeng/dropdown\''))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with DropdownModule imports');
    return;
  }

  context.logger.info(`Updating module imports in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace module imports
    let updatedContent = content
      .replace(/DropdownModule/g, 'SelectModule')
      .replace(/from ['"]primeng\/dropdown['"]/g, 'from \'primeng/select\'');
    
    // Replace any direct imports from the dropdown module
    updatedContent = updatedContent
      .replace(/import {([^}]*)} from ['"]primeng\/dropdown['"]/g, 'import {$1} from \'primeng/select\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates component selectors from p-dropdown to p-select
 */
function updateComponentSelectors(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.html') || filePath.endsWith('.ts')) && 
      content.includes('p-dropdown')
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with p-dropdown selectors');
    return;
  }

  context.logger.info(`Updating component selectors in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace component selectors
    const updatedContent = content
      .replace(/<p-dropdown/g, '<p-select')
      .replace(/<\/p-dropdown>/g, '</p-select>')
      .replace(/selector: ['"]p-dropdown['"]/g, 'selector: \'p-select\'');
    
    tree.overwrite(filePath, updatedContent);
  }
}

/**
 * Updates CSS classes related to dropdown
 */
function updateCssClasses(tree: Tree, context: SchematicContext): void {
  const filesToUpdate = analyzeFilesForMigration(
    tree,
    (filePath, content) => 
      (filePath.endsWith('.scss') || filePath.endsWith('.css') || filePath.endsWith('.html')) && 
      (content.includes('p-dropdown') || content.includes('.p-dropdown'))
  );

  if (filesToUpdate.length === 0) {
    context.logger.info('No files found with dropdown CSS classes');
    return;
  }

  context.logger.info(`Updating CSS classes in ${filesToUpdate.length} files`);

  for (const filePath of filesToUpdate) {
    const content = tree.read(filePath)?.toString() || '';
    
    // Replace CSS classes
    const updatedContent = content
      .replace(/\.p-dropdown/g, '.p-select')
      .replace(/p-dropdown-/g, 'p-select-');
    
    tree.overwrite(filePath, updatedContent);
  }
} 
