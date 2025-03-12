import { SchematicContext } from '@angular-devkit/schematics';
import { execSync } from 'child_process';

/**
 * Check if there are unstaged changes in the Git repository
 * @returns True if there are unstaged changes
 */
export function hasUnstagedChanges(): boolean {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf8' });
    return output.trim().length > 0;
  } catch (error) {
    console.error('Error checking Git status:', error);
    return false;
  }
}

/**
 * Stash changes in the Git repository
 * @returns True if stashing was successful
 */
export function stashChanges(): boolean {
  try {
    execSync('git stash', { encoding: 'utf8' });
    return true;
  } catch (error) {
    console.error('Error stashing changes:', error);
    return false;
  }
}

/**
 * Stage and commit changes to the Git repository
 * @param message The commit message
 * @param verbose Whether to output verbose information
 * @returns True if the commit was successful
 */
export function commitChanges(message: string, logger: SchematicContext['logger']): boolean {
  try {
    logger.info('Staging all changes for commit...');
    execSync('git add --all', { 
      encoding: 'utf8',
      stdio: 'pipe' 
    });
    
    // Check if there are changes to commit
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
    if (statusOutput.trim().length === 0) {
      logger.info('No changes to commit');
      return false;
    }
    
    logger.info(`Committing with message: "${message}"`);
    execSync(`git commit -m "${message}"`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    return true;
  } catch (error) {
    logger.error(`Error committing changes: ${error}`);
    return false;
  }
} 
