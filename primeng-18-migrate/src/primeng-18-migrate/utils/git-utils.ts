import { execSync } from 'child_process';

/**
 * Check if there are unstaged changes in the Git repository
 * @returns True if there are unstaged changes
 */
export function hasUnstagedChanges(): boolean {
  try {
    const output = execSync('git status --porcelain').toString();
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
    execSync('git stash');
    return true;
  } catch (error) {
    console.error('Error stashing changes:', error);
    return false;
  }
}

/**
 * Commit changes to the Git repository
 * @param message The commit message
 * @returns True if the commit was successful
 */
export function commitChanges(message: string): boolean {
  try {
    execSync('git add .');
    execSync(`git commit -m "${message}"`);
    return true;
  } catch (error) {
    console.error('Error committing changes:', error);
    return false;
  }
} 
