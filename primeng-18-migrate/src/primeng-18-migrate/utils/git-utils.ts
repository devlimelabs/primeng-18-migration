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
export function commitChanges(message: string, options?: { verbose?: boolean }): boolean {
  const verbose = options?.verbose || false;
  
  try {
    // Stage all changes
    if (verbose) {
      console.log('Staging changes...');
    }
    
    execSync('git add --all', { 
      encoding: 'utf8',
      stdio: verbose ? 'inherit' : 'pipe'
    });
    
    // Check if there are changes to commit
    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
    if (statusOutput.trim().length === 0) {
      console.log('No changes to commit');
      return false;
    }
    
    // Execute commit
    if (verbose) {
      console.log(`Committing with message: "${message}"`);
    }
    
    execSync(`git commit -m "${message}"`, { 
      encoding: 'utf8',
      stdio: verbose ? 'inherit' : 'pipe'
    });
    
    if (verbose) {
      console.log('Changes committed successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error committing changes:', error);
    return false;
  }
} 
