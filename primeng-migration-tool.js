#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility to prompt for confirmation
const confirm = async (message) => {
  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

// Check if git repository has unstaged changes
const hasUnstagedChanges = () => {
  try {
    const output = execSync('git status --porcelain').toString();
    return output.length > 0;
  } catch (error) {
    console.error('Error checking git status:', error.message);
    return true;
  }
};

// Stash changes if needed
const stashChanges = async () => {
  try {
    console.log('Stashing changes...');
    execSync('git stash');
    return true;
  } catch (error) {
    console.error('Failed to stash changes:', error.message);
    return false;
  }
};

// Find files that match pattern
const findFiles = (pattern, extensions = ['.ts', '.html', '.scss', '.css']) => {
  const files = [];
  const searchDirectories = ['src']; // Adjust as needed

  const processDirectory = (directory) => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('node_modules') && !entry.name.startsWith('.git')) {
        processDirectory(entryPath);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(entryPath, 'utf8');
        if (content.match(pattern)) {
          files.push(entryPath);
        }
      }
    }
  };

  try {
    for (const dir of searchDirectories) {
      if (fs.existsSync(dir)) {
        processDirectory(dir);
      }
    }
  } catch (error) {
    console.error('Error searching files:', error.message);
  }

  return files;
};

// Replace content in files
const replaceInFiles = (files, pattern, replacement) => {
  let count = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(pattern, replacement);
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      count++;
    }
  }
  
  return count;
};

// Commit changes
const commitChanges = (message) => {
  try {
    execSync('git add .');
    execSync(`git commit -m "${message}"`);
    console.log(`Changes committed with message: ${message}`);
    return true;
  } catch (error) {
    console.error('Failed to commit changes:', error.message);
    return false;
  }
};

// Migration definitions
const migrations = [
  {
    name: 'Module Imports Update',
    description: 'Updates PrimeNG module imports',
    replacements: [
      {
        find: /import\s+{\s*([^}]*CalendarModule[^}]*)}\s+from\s+['"]primeng\/calendar['"]/g,
        replace: "import { $1} from 'primeng/datepicker'",
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update Calendar module imports to DatePicker for v18'
      },
      {
        find: /import\s+{\s*([^}]*DropdownModule[^}]*)}\s+from\s+['"]primeng\/dropdown['"]/g,
        replace: "import { $1} from 'primeng/select'",
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update Dropdown module imports to Select for v18'
      },
      {
        find: /import\s+{\s*([^}]*InputSwitchModule[^}]*)}\s+from\s+['"]primeng\/inputswitch['"]/g,
        replace: "import { $1} from 'primeng/toggleswitch'",
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update InputSwitch module imports to ToggleSwitch for v18'
      },
      {
        find: /import\s+{\s*([^}]*OverlayPanelModule[^}]*)}\s+from\s+['"]primeng\/overlaypanel['"]/g,
        replace: "import { $1} from 'primeng/popover'",
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update OverlayPanel module imports to Popover for v18'
      },
      {
        find: /import\s+{\s*([^}]*SidebarModule[^}]*)}\s+from\s+['"]primeng\/sidebar['"]/g,
        replace: "import { $1} from 'primeng/drawer'",
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update Sidebar module imports to Drawer for v18'
      },
      {
        find: /import\s+{\s*ButtonModule\s*}\s+from\s+['"]primeng\/button['"]/g,
        replace: "import { ButtonModule } from 'primeng/button'",
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update ButtonModule imports for v18'
      },
      {
        find: /import\s+{\s*InputTextModule\s*}\s+from\s+['"]primeng\/inputtext['"]/g,
        replace: "import { InputTextModule } from 'primeng/inputtext'",
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update InputTextModule imports for v18'
      },
      {
        find: /import\s+{\s*TableModule\s*}\s+from\s+['"]primeng\/table['"]/g,
        replace: "import { TableModule } from 'primeng/table'",
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update TableModule imports for v18'
      }
    ]
  },
  {
    name: 'Module Class Updates',
    description: 'Updates PrimeNG module class names',
    replacements: [
      {
        find: /\bCalendarModule\b/g,
        replace: 'DatePickerModule',
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update CalendarModule to DatePickerModule for v18'
      },
      {
        find: /\bDropdownModule\b/g,
        replace: 'SelectModule',
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update DropdownModule to SelectModule for v18'
      },
      {
        find: /\bInputSwitchModule\b/g,
        replace: 'ToggleSwitchModule',
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update InputSwitchModule to ToggleSwitchModule for v18'
      },
      {
        find: /\bOverlayPanelModule\b/g,
        replace: 'PopoverModule',
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update OverlayPanelModule to PopoverModule for v18'
      },
      {
        find: /\bSidebarModule\b/g,
        replace: 'DrawerModule',
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update SidebarModule to DrawerModule for v18'
      }
    ]
  },
  {
    name: 'Component Selector Updates',
    description: 'Updates component selectors in templates',
    replacements: [
      {
        find: /<p-calendar\b/g,
        replace: '<p-datepicker',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-calendar to p-datepicker for v18'
      },
      {
        find: /<\/p-calendar>/g,
        replace: '</p-datepicker>',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-calendar closing tag to p-datepicker for v18'
      },
      {
        find: /<p-dropdown\b/g,
        replace: '<p-select',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-dropdown to p-select for v18'
      },
      {
        find: /<\/p-dropdown>/g,
        replace: '</p-select>',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-dropdown closing tag to p-select for v18'
      },
      {
        find: /<p-inputSwitch\b/g,
        replace: '<p-toggleSwitch',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-inputSwitch to p-toggleSwitch for v18'
      },
      {
        find: /<\/p-inputSwitch>/g,
        replace: '</p-toggleSwitch>',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-inputSwitch closing tag to p-toggleSwitch for v18'
      },
      {
        find: /<p-overlayPanel\b/g,
        replace: '<p-popover',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-overlayPanel to p-popover for v18'
      },
      {
        find: /<\/p-overlayPanel>/g,
        replace: '</p-popover>',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-overlayPanel closing tag to p-popover for v18'
      },
      {
        find: /<p-sidebar\b/g,
        replace: '<p-drawer',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-sidebar to p-drawer for v18'
      },
      {
        find: /<\/p-sidebar>/g,
        replace: '</p-drawer>',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update p-sidebar closing tag to p-drawer for v18'
      },
      {
        find: /p-selectButton/g,
        replace: 'p-selectbutton',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update SelectButton element naming for v18'
      }
    ]
  },
  {
    name: 'CSS Class Updates',
    description: 'Updates deprecated CSS classes to new format',
    replacements: [
      {
        find: /p-component/g,
        replace: 'p-element',
        files: ['.html', '.scss', '.css'],
        commitMsg: 'refactor(primeng): update p-component to p-element for v18'
      },
      {
        find: /p-inputtext/g,
        replace: 'p-input',
        files: ['.html', '.scss', '.css'],
        commitMsg: 'refactor(primeng): update p-inputtext to p-input for v18'
      },
      {
        find: /\bp-link\b/g,
        replace: '',
        files: ['.html', '.scss', '.css'],
        commitMsg: 'refactor(primeng): remove p-link class (removed in v18)'
      },
      {
        find: /\bp-highlight\b/g,
        replace: '',
        files: ['.html', '.scss', '.css'],
        commitMsg: 'refactor(primeng): remove p-highlight class (removed in v18)'
      },
      {
        find: /\bp-fluid\b/g,
        replace: '',
        files: ['.html', '.scss', '.css'],
        commitMsg: 'refactor(primeng): remove p-fluid class (removed in v18)'
      }
    ]
  },
  {
    name: 'Component Property Changes',
    description: 'Updates component properties with breaking changes',
    replacements: [
      {
        find: /\[showTransitionOptions\]="[^"]*"/g,
        replace: '[showTransitionOptions]="\'.12s\'"',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update showTransitionOptions syntax for v18'
      },
      {
        find: /\[hideTransitionOptions\]="[^"]*"/g,
        replace: '[hideTransitionOptions]="\'.12s\'"',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update hideTransitionOptions syntax for v18'
      }
    ]
  },
  {
    name: 'Dialog Component Updates',
    description: 'Updates Dialog component API changes',
    replacements: [
      {
        find: /([(,]\s*)(modal)(\s*[),])/g,
        replace: '$1closeOnEscape$3',
        files: ['.ts', '.html'],
        commitMsg: 'refactor(primeng): update Dialog modal to closeOnEscape for v18'
      }
    ]
  },
  {
    name: 'Interface Updates',
    description: 'Updates renamed interfaces',
    replacements: [
      {
        find: /import\s+{([^}]*)Message([^}]*)}\s+from\s+['"]primeng\/api['"]/g,
        replace: "import {$1ToastMessageOptions$2} from 'primeng/api'",
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update Message interface to ToastMessageOptions for v18'
      },
      {
        find: /\bMessage\b(?!\s*=)/g,
        replace: 'ToastMessageOptions',
        files: ['.ts'],
        commitMsg: 'refactor(primeng): update Message type to ToastMessageOptions for v18'
      }
    ]
  },
  {
    name: 'Directive Updates',
    description: 'Updates renamed directives',
    replacements: [
      {
        find: /\bpAnimate\b/g,
        replace: 'pAnimateOnScroll',
        files: ['.html'],
        commitMsg: 'refactor(primeng): update pAnimate directive to pAnimateOnScroll for v18'
      },
      {
        find: /<p-defer\b[^>]*>((.|\n)*?)<\/p-defer>/g,
        replace: '<!-- p-defer is removed in PrimeNG v18. Consider using Angular @defer instead -->\n$1',
        files: ['.html'],
        commitMsg: 'refactor(primeng): remove p-defer (deprecated in v18, use Angular @defer)'
      }
    ]
  },
  {
    name: 'PrimeNG Configuration Updates',
    description: 'Identifies PrimeNGConfig usage for manual migration',
    replacements: [
      {
        find: /PrimeNGConfig/g,
        replace: 'PrimeNGConfig /* TODO: Replace with providePrimeNG() in PrimeNG v18 */',
        files: ['.ts'],
        commitMsg: 'refactor(primeng): mark PrimeNGConfig for migration to providePrimeNG'
      }
    ]
  }
];

// Check package.json for PrimeFlex and update to v4
const updatePrimeFlex = async () => {
  try {
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
      console.log('package.json not found. Skipping PrimeFlex update.');
      return false;
    }

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check if primeflex is a dependency
    if (packageJson.dependencies && packageJson.dependencies.primeflex) {
      const currentVersion = packageJson.dependencies.primeflex;
      console.log(`Found PrimeFlex v${currentVersion} in dependencies.`);
      
      // Ask for confirmation to update
      const shouldUpdate = await confirm('PrimeNG v18 requires PrimeFlex v4. Do you want to update PrimeFlex?');
      
      if (shouldUpdate) {
        // Update to v4
        packageJson.dependencies.primeflex = '^4.0.0';
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf8');
        console.log('Updated PrimeFlex to v4.0.0 in package.json');
        
        // Commit changes
        await commitChanges('chore(deps): update primeflex to v4 for primeng v18 compatibility');
        return true;
      }
    } else {
      console.log('PrimeFlex not found in dependencies. Skipping update.');
    }
    return false;
  } catch (error) {
    console.error('Error updating PrimeFlex:', error.message);
    return false;
  }
};

// Update PrimeNG version to v18
const updatePrimeNGVersion = async () => {
  try {
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
      console.log('package.json not found. Skipping PrimeNG version update.');
      return false;
    }

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check if primeng is a dependency
    if (packageJson.dependencies && packageJson.dependencies.primeng) {
      const currentVersion = packageJson.dependencies.primeng;
      console.log(`Found PrimeNG v${currentVersion} in dependencies.`);
      
      // Ask for confirmation to update
      const shouldUpdate = await confirm('Do you want to update PrimeNG to v18.0.0?');
      
      if (shouldUpdate) {
        // Update to v18
        packageJson.dependencies.primeng = '^18.0.0';
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf8');
        console.log('Updated PrimeNG to v18.0.0 in package.json');
        
        // Commit changes
        await commitChanges('chore(deps): update primeng to v18.0.0');
        return true;
      }
    } else {
      console.log('PrimeNG not found in dependencies. Skipping update.');
    }
    return false;
  } catch (error) {
    console.error('Error updating PrimeNG version:', error.message);
    return false;
  }
};

// Update angular.json to remove deprecated theme imports
const updateAngularJson = async () => {
  try {
    // Check if angular.json exists
    if (!fs.existsSync('angular.json')) {
      console.log('angular.json not found. Skipping theme updates.');
      return false;
    }

    // Read angular.json
    const angularJson = JSON.parse(fs.readFileSync('angular.json', 'utf8'));
    let updatedFiles = false;
    
    // Check for projects in angular.json
    if (angularJson.projects) {
      const projectNames = Object.keys(angularJson.projects);
      
      for (const projectName of projectNames) {
        const project = angularJson.projects[projectName];
        
        // Check if project has architect > build > options > styles
        if (project.architect?.build?.options?.styles) {
          const styles = project.architect.build.options.styles;
          const originalStylesCount = styles.length;
          
          // Filter out primeng/resources styles
          const updatedStyles = styles.filter(style => {
            if (typeof style === 'string') {
              return !style.includes('primeng/resources');
            }
            if (typeof style === 'object' && style.input) {
              return !style.input.includes('primeng/resources');
            }
            return true;
          });
          
          // If styles were removed, update angular.json
          if (updatedStyles.length < originalStylesCount) {
            const removedCount = originalStylesCount - updatedStyles.length;
            console.log(`Found ${removedCount} deprecated PrimeNG theme imports in ${projectName}.`);
            
            // Ask for confirmation to update
            const shouldUpdate = await confirm('Do you want to remove these deprecated theme imports?');
            
            if (shouldUpdate) {
              project.architect.build.options.styles = updatedStyles;
              updatedFiles = true;
              console.log(`Removed ${removedCount} deprecated theme imports from ${projectName}.`);
            }
          }
        }
      }
      
      if (updatedFiles) {
        // Write updated angular.json
        fs.writeFileSync('angular.json', JSON.stringify(angularJson, null, 2), 'utf8');
        
        // Commit changes
        await commitChanges('refactor(primeng): remove deprecated theme imports for v18');
        return true;
      } else {
        console.log('No deprecated PrimeNG theme imports found in angular.json');
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error updating angular.json:', error.message);
    return false;
  }
};

// Main function
const runMigration = async () => {
  // Check for git unstaged changes
  if (hasUnstagedChanges()) {
    console.log('There are unstaged changes in the repository.');
    const shouldStash = await confirm('Do you want to stash these changes?');
    
    if (shouldStash) {
      const stashSuccessful = await stashChanges();
      if (!stashSuccessful) {
        console.log('Exiting migration script due to stash failure.');
        rl.close();
        return;
      }
    } else {
      console.log('Exiting migration script. Please commit or stash your changes before running the migration.');
      rl.close();
      return;
    }
  }

  console.log('PrimeNG v17 to v18 Migration Tool');
  console.log('=================================\n');
  
  // First handle dependencies and configuration files
  console.log('Step 1: Updating dependencies and configuration files');
  
  // Update PrimeNG version in package.json
  await updatePrimeNGVersion();
  
  // Update PrimeFlex if present
  await updatePrimeFlex();
  
  // Update theme imports in angular.json
  await updateAngularJson();
  
  // Display available code migrations
  console.log('\nStep 2: Code Migrations');
  console.log('Available code migrations:');
  migrations.forEach((migration, index) => {
    console.log(`${index + 1}. ${migration.name} - ${migration.description}`);
  });
  console.log(`${migrations.length + 1}. Run all migrations\n`);
  
  // Prompt for migration selection
  const answer = await new Promise((resolve) => {
    rl.question('Select migrations to run (comma separated numbers, e.g. 1,3,5): ', (answer) => {
      resolve(answer);
    });
  });
  
  // Parse selection
  const selections = answer.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
  const selectedMigrations = [];
  
  if (selections.includes(migrations.length + 1)) {
    // Run all migrations
    selectedMigrations.push(...migrations);
  } else {
    // Add selected migrations
    for (const selection of selections) {
      if (selection >= 1 && selection <= migrations.length) {
        selectedMigrations.push(migrations[selection - 1]);
      }
    }
  }
  
  if (selectedMigrations.length === 0) {
    console.log('No code migrations selected.');
    console.log('\nMigration completed successfully!');
    rl.close();
    return;
  }
  
  // Run selected migrations
  for (const migration of selectedMigrations) {
    console.log(`\nRunning migration: ${migration.name}`);
    
    for (const replacement of migration.replacements) {
      // Find files with matching pattern
      const files = findFiles(replacement.find, replacement.files);
      
      if (files.length === 0) {
        console.log(`No files found containing pattern: ${replacement.find}`);
        continue;
      }
      
      console.log(`Found ${files.length} files with matching pattern:`);
      files.forEach(file => console.log(`  - ${file}`));
      
      // Confirm replacement
      const shouldReplace = await confirm('Do you want to proceed with the replacement?');
      
      if (shouldReplace) {
        // Replace in files
        const replacedCount = replaceInFiles(files, replacement.find, replacement.replace);
        console.log(`Replaced in ${replacedCount} files.`);
        
        // Commit changes
        await commitChanges(replacement.commitMsg);
      } else {
        console.log('Skipping this replacement.');
      }
    }
  }
  
  console.log('\nMigration completed successfully!');
  console.log('\nReminder: You may need to manually update:');
  console.log('1. PrimeNG Configuration (replace PrimeNGConfig with providePrimeNG())');
  console.log('2. Add new theme imports if you removed the deprecated ones');
  console.log('3. Run npm install to install the updated dependencies');
  rl.close();
};

// Run the migration
runMigration().catch(error => {
  console.error('Error during migration:', error);
  rl.close();
});
