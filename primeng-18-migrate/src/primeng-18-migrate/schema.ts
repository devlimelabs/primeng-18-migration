/**
 * Schema for the primeng-18-migrate command
 */
export interface Schema {
  /**
   * Skip checking for unstaged Git changes
   */
  skipGitCheck?: boolean;

  /**
   * Skip committing changes after migration
   */
  skipCommit?: boolean;

  /**
   * Indicates if this migration is part of a parent migration
   * This is used internally to prevent child migrations from performing Git operations
   */
  partOfParentMigration?: boolean;
} 
