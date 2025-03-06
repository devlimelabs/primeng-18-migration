import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { addPackageJsonDependency, NodeDependencyType, PackageDependency } from '../../utils/package-utils';
import { promptForConfirmation } from '../../utils/prompt-utils';

/**
 * Updates package.json dependencies for PrimeNG v18
 */
export function updateDependencies(): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const confirmation = await promptForConfirmation(
      'Do you want to update dependencies for PrimeNG v18?'
    );

    if (confirmation !== 'run') {
      context.logger.info('Skipping dependency updates');
      return tree;
    }

    context.logger.info('Updating dependencies for PrimeNG v18...');

    // Define dependencies to update
    const dependencies: PackageDependency[] = [
      {
        type: NodeDependencyType.Default,
        name: 'primeng',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Default,
        name: 'primeicons',
        version: '^7.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Default,
        name: 'primeflex',
        version: '^4.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Default,
        name: '@angular/core',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Default,
        name: '@angular/common',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Default,
        name: '@angular/forms',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Default,
        name: '@angular/platform-browser',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Default,
        name: '@angular/platform-browser-dynamic',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Default,
        name: '@angular/router',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Dev,
        name: '@angular-devkit/build-angular',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Dev,
        name: '@angular/cli',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Dev,
        name: '@angular/compiler-cli',
        version: '^18.0.0',
        overwrite: true
      },
      {
        type: NodeDependencyType.Dev,
        name: 'typescript',
        version: '~5.4.2',
        overwrite: true
      }
    ];

    // Add each dependency to package.json
    for (const dependency of dependencies) {
      addPackageJsonDependency(tree, dependency);
    }

    context.logger.info('Dependencies updated successfully');
    
    // Schedule package installation task
    context.addTask(new NodePackageInstallTask());

    return tree;
  };
} 
