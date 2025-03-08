import { chain, Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { updateAngularConfig } from './migrations/angular-config';
import { migrateCalendarToDatePicker } from './migrations/calendar-datepicker';
import { updateDependencies } from './migrations/dependencies';
import { updateDialogComponent } from './migrations/dialog';
import { updateDirectives } from './migrations/directives';
import { migrateDropdownToSelect } from './migrations/dropdown-select';
import { migrateInputSwitchToToggleSwitch } from './migrations/inputswitch-toggleswitch';
import { migrateOverlayPanelToPopover } from './migrations/overlaypanel-popover';
import { migrateSidebarToDrawer } from './migrations/sidebar-drawer';
import { Schema } from './schema';
import { commitChanges, hasUnstagedChanges, stashChanges } from './utils/git-utils';

/**
 * PrimeNG v17 to v18 Migration Schematics
 *
 * This file contains schematics for migrating from PrimeNG v17 to v18.
 * Each migration is broken out into its own file for better maintainability.
 */

/**
 * Main migration function that orchestrates all the individual migrations
 * @param options Migration options
 * @returns Rule to execute
 */
export function migrateToV18(options: Schema = {}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    // Log start message
    context.logger.info('Starting PrimeNG v18 migration...');
    
    // Check for unstaged changes if not skipped
    if (!options.skipGitCheck && hasUnstagedChanges()) {
      const stashed = stashChanges();
      if (!stashed) {
        throw new SchematicsException(
          'You have unstaged changes. Please commit or stash them before running this migration.'
        );
      }
      context.logger.info('Unstaged changes have been stashed.');
    }

    // Create options for the child migrations to indicate they're part of a parent migration
    const childMigrationOptions: Schema = {
      ...options,
      skipGitCheck: true, // Skip Git checks in child migrations
      skipCommit: true,   // Skip commits in child migrations
      partOfParentMigration: true // Flag to indicate it's part of a parent migration
    };

    // Chain all the migration rules
    const migrationRules = chain([
      // Update dependencies
      updateDependencies(),
      
      // Component migrations
      migrateDropdownToSelect(childMigrationOptions),
      migrateCalendarToDatePicker(childMigrationOptions),
      migrateInputSwitchToToggleSwitch(),
      migrateOverlayPanelToPopover(),
      migrateSidebarToDrawer(),
      updateDialogComponent(),
      
      // Configuration updates
      updateAngularConfig(),
      
      // Directive updates
      updateDirectives(),
      
      // Install dependencies
      (tree: Tree, context: SchematicContext) => {
        context.logger.info('Scheduling npm dependencies installation...');
        context.addTask(new NodePackageInstallTask());
        return tree;
      }
    ]);

    // Execute the migration rules
    const result = migrationRules(tree, context);

    // Commit changes if not skipped
    if (!options.skipCommit) {
      const committed = commitChanges('PrimeNG v18 migration');
      if (committed) {
        context.logger.info('Changes have been committed.');
      } else {
        context.logger.warn('Failed to commit changes.');
      }
    }

    context.logger.info('PrimeNG v18 migration completed successfully.');
    return result;
  };
}

// Default rule
export default migrateToV18; 
