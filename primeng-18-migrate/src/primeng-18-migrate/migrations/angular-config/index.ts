import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { promptForConfirmation } from '../../utils/prompt-utils';

/**
 * Updates Angular configuration for PrimeNG v18
 */
export function updateAngularConfig(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptForConfirmation(
      'Do you want to update Angular configuration for PrimeNG v18?'
    );

    if (confirmation !== 'run') {
      context.logger.info('Skipping Angular configuration updates');
      return tree;
    }

    context.logger.info('Updating Angular configuration for PrimeNG v18...');
    
    // Update angular.json
    updateAngularJson(tree, context);
    
    // Update tsconfig.json
    updateTsConfig(tree, context);
    
    context.logger.info('Angular configuration updates completed');
    return tree;
  };
}

/**
 * Updates angular.json configuration
 */
function updateAngularJson(tree: Tree, context: SchematicContext): void {
  const angularJsonPath = '/angular.json';
  
  if (!tree.exists(angularJsonPath)) {
    context.logger.warn('No angular.json file found');
    return;
  }
  
  const angularJsonContent = tree.read(angularJsonPath);
  if (!angularJsonContent) {
    context.logger.warn('Could not read angular.json');
    return;
  }
  
  let angularJson: any;
  try {
    angularJson = JSON.parse(angularJsonContent.toString());
  } catch (e) {
    context.logger.error('Could not parse angular.json');
    return;
  }
  
  // Get the default project
  const projectNames = Object.keys(angularJson.projects || {});
  if (projectNames.length === 0) {
    context.logger.warn('No projects found in angular.json');
    return;
  }
  
  let defaultProject = angularJson.defaultProject;
  if (!defaultProject && projectNames.length > 0) {
    defaultProject = projectNames[0];
  }
  
  if (!defaultProject) {
    context.logger.warn('Could not determine default project');
    return;
  }
  
  const project = angularJson.projects[defaultProject];
  if (!project) {
    context.logger.warn(`Project ${defaultProject} not found in angular.json`);
    return;
  }
  
  // Update styles configuration
  if (project.architect?.build?.options?.styles) {
    const styles = project.architect.build.options.styles;
    
    // Add PrimeNG styles if not already present
    const primeNgCssPath = 'node_modules/primeng/resources/themes/lara-light-blue/theme.css';
    const primeIconsCssPath = 'node_modules/primeicons/primeicons.css';
    const primeFlexCssPath = 'node_modules/primeflex/primeflex.css';
    
    if (!styles.includes(primeNgCssPath)) {
      styles.push(primeNgCssPath);
    }
    
    if (!styles.includes(primeIconsCssPath)) {
      styles.push(primeIconsCssPath);
    }
    
    if (!styles.includes(primeFlexCssPath)) {
      styles.push(primeFlexCssPath);
    }
  }
  
  // Write updated angular.json
  tree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));
  context.logger.info('Updated angular.json');
}

/**
 * Updates tsconfig.json configuration
 */
function updateTsConfig(tree: Tree, context: SchematicContext): void {
  const tsConfigPath = '/tsconfig.json';
  
  if (!tree.exists(tsConfigPath)) {
    context.logger.warn('No tsconfig.json file found');
    return;
  }
  
  const tsConfigContent = tree.read(tsConfigPath);
  if (!tsConfigContent) {
    context.logger.warn('Could not read tsconfig.json');
    return;
  }
  
  let tsConfig: any;
  try {
    tsConfig = JSON.parse(tsConfigContent.toString());
  } catch (e) {
    context.logger.error('Could not parse tsconfig.json');
    return;
  }
  
  // Update TypeScript configuration for Angular 18
  if (tsConfig.compilerOptions) {
    // Ensure TypeScript 5.4 compatibility
    tsConfig.compilerOptions.target = 'ES2022';
    tsConfig.compilerOptions.module = 'ES2022';
    tsConfig.compilerOptions.lib = tsConfig.compilerOptions.lib || [];
    
    // Ensure ES2022 is included in lib
    if (!tsConfig.compilerOptions.lib.includes('ES2022')) {
      tsConfig.compilerOptions.lib.push('ES2022');
    }
    
    // Update other compiler options as needed
    tsConfig.compilerOptions.useDefineForClassFields = true;
    tsConfig.compilerOptions.forceConsistentCasingInFileNames = true;
    tsConfig.compilerOptions.strict = true;
    tsConfig.compilerOptions.noImplicitOverride = true;
    tsConfig.compilerOptions.noPropertyAccessFromIndexSignature = true;
    tsConfig.compilerOptions.noImplicitReturns = true;
    tsConfig.compilerOptions.skipLibCheck = true;
  }
  
  // Write updated tsconfig.json
  tree.overwrite(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  context.logger.info('Updated tsconfig.json');
} 
