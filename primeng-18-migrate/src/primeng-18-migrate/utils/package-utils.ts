import { Tree } from '@angular-devkit/schematics';

/**
 * Types of dependencies in package.json
 */
export enum NodeDependencyType {
  Default = 'dependencies',
  Dev = 'devDependencies',
  Peer = 'peerDependencies',
  Optional = 'optionalDependencies'
}

/**
 * Interface for a package dependency
 */
export interface PackageDependency {
  type: NodeDependencyType;
  name: string;
  version: string;
  overwrite: boolean;
}

/**
 * Add a dependency to package.json
 * @param tree The Tree to modify
 * @param dependency The dependency to add
 */
export function addPackageJsonDependency(tree: Tree, dependency: PackageDependency): void {
  const packageJsonPath = '/package.json';
  
  if (!tree.exists(packageJsonPath)) {
    throw new Error('No package.json found in the tree.');
  }

  const packageJsonContent = tree.read(packageJsonPath);
  if (!packageJsonContent) {
    throw new Error('Could not read package.json.');
  }

  const packageJson = JSON.parse(packageJsonContent.toString());

  if (!packageJson[dependency.type]) {
    packageJson[dependency.type] = {};
  }

  // Skip if the dependency exists and overwrite is false
  if (packageJson[dependency.type][dependency.name] && !dependency.overwrite) {
    return;
  }

  packageJson[dependency.type][dependency.name] = dependency.version;

  tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
} 
