import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('primeng-18-migrate', () => {
  const defaultOptions = {
    skipGitCheck: true,
    skipCommit: true,
  };
  
  it('works', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('primeng-18-migrate', defaultOptions, Tree.empty());

    // The schematic should complete without errors
    expect(tree).toBeDefined();
  });
});
