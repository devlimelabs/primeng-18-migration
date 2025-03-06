import { Tree } from '@angular-devkit/schematics';

/**
 * Utility functions for working with the Tree object
 */
export class TreeUtils {
  /**
   * Check if a file exists in the tree
   * @param tree The Tree to check
   * @param path The file path to check
   * @returns True if the file exists
   */
  static exists(tree: Tree, path: string): boolean {
    return tree.read(path) !== null;
  }
} 
