import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';

describe('PrimeNG v18 Migration', () => {
  const schematicRunner = new SchematicTestRunner(
    'primeng-18-migrate',
    join(__dirname, '../collection.json')
  );

  const defaultOptions = {
    skipGitCheck: true,
    skipCommit: true,
  };

  it('should update PrimeNG dependencies', async () => {
    const tree = await schematicRunner.runSchematic(
      'migrateToV18',
      defaultOptions
    );

    // Create a mock package.json if it doesn't exist
    if (!tree.exists('/package.json')) {
      tree.create(
        '/package.json',
        JSON.stringify({
          dependencies: {
            primeng: '^17.0.0',
            primeflex: '^3.0.0',
          },
        })
      );
    }

    // Run the schematic
    const resultTree = await schematicRunner.runSchematic(
      'migrateToV18',
      defaultOptions,
      tree
    );

    // Check if dependencies were updated
    const packageJson = JSON.parse(resultTree.readContent('/package.json'));
    expect(packageJson.dependencies.primeng).toBe('^18.0.0');
    expect(packageJson.dependencies.primeflex).toBe('^4.0.0');
  });

  it('should update component imports', async () => {
    // Create a mock TypeScript file with old imports
    const tree = await schematicRunner.runSchematic(
      'migrateToV18',
      defaultOptions
    );
    tree.create(
      '/src/app/test.component.ts',
      `
      import { Component } from '@angular/core';
      import { CalendarModule } from 'primeng/calendar';
      import { DropdownModule } from 'primeng/dropdown';
      import { Message } from 'primeng/api';
      
      @Component({
        selector: 'app-test',
        template: '<p-calendar></p-calendar>'
      })
      export class TestComponent {
        messages: Message[] = [];
      }
    `
    );

    // Run the schematic
    const resultTree = await schematicRunner.runSchematic(
      'migrateToV18',
      defaultOptions,
      tree
    );

    // Check if imports were updated
    const content = resultTree.readContent('/src/app/test.component.ts');
    expect(content).toContain(
      "import { CalendarModule } from 'primeng/datepicker'"
    );
    expect(content).toContain(
      "import { DropdownModule } from 'primeng/select'"
    );
    expect(content).toContain(
      "import { ToastMessageOptions } from 'primeng/api'"
    );
    expect(content).toContain('messages: ToastMessageOptions[] = [];');
  });
});
