import { Tree } from '@angular-devkit/schematics';

/**
 * Analyze files in the tree for migration
 * @param tree The Tree to analyze
 * @param predicate Function to determine if a file should be included
 * @returns Array of file paths that match the predicate
 */
export function analyzeFilesForMigration(
  tree: Tree, 
  predicate: (filePath: string, content: string) => boolean
): string[] {
  const result: string[] = [];

  tree.root.visit((filePath) => {
    if (
      filePath.endsWith('.ts') || 
      filePath.endsWith('.html') || 
      filePath.endsWith('.scss') || 
      filePath.endsWith('.css')
    ) {
      const content = tree.read(filePath);
      if (content) {
        const contentStr = content.toString();
        if (predicate(filePath, contentStr)) {
          result.push(filePath);
        }
      }
    }
  });

  return result;
} 
