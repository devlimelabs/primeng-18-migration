Title: Angular

URL Source: https://angular.dev/tools/cli/schematics-for-libraries

Markdown Content:
When you create an Angular library, you can provide and package it with schematics that integrate it with the Angular CLI. With your schematics, your users can use `ng add` to install an initial version of your library, `ng generate` to create artifacts defined in your library, and `ng update` to adjust their project for a new version of your library that introduces breaking changes.

All three types of schematics can be part of a collection that you package with your library.

[Creating a schematics collection](https://angular.dev/#creating-a-schematics-collection)
-----------------------------------------------------------------------------------------

To start a collection, you need to create the schematic files. The following steps show you how to add initial support without modifying any project files.

1.  In your library's root folder, create a `schematics` folder.
    
2.  In the `schematics/` folder, create an `ng-add` folder for your first schematic.
    
3.  At the root level of the `schematics` folder, create a `collection.json` file.
    
4.  Edit the `collection.json` file to define the initial schema for your collection.
    
          
    
    ```
    {  "$schema": "../../../node_modules/@angular-devkit/schematics/collection-schema.json",  "schematics": {    "ng-add": {      "description": "Add my library to the project.",      "factory": "./ng-add/index#ngAdd",      "schema": "./ng-add/schema.json"    }  }}
    ```
    
        
    
    *   The `$schema` path is relative to the Angular Devkit collection schema.
    *   The `schematics` object describes the named schematics that are part of this collection.
    *   The first entry is for a schematic named `ng-add`. It contains the description, and points to the factory function that is called when your schematic is executed.
5.  In your library project's `package.json` file, add a "schematics" entry with the path to your schema file. The Angular CLI uses this entry to find named schematics in your collection when it runs commands.
    
          
    
    ```
    {  "name": "my-lib",  "version": "0.0.1",  "scripts": {    "build": "tsc -p tsconfig.schematics.json",    "postbuild": "copyfiles schematics/*/schema.json schematics/*/files/** schematics/collection.json ../../dist/my-lib/"  },  "peerDependencies": {    "@angular/common": "^19.0.0",    "@angular/core": "^19.0.0"  },  "schematics": "./schematics/collection.json",  "ng-add": {    "save": "devDependencies"  },  "devDependencies": {    "copyfiles": "file:../../node_modules/copyfiles",    "typescript": "file:../../node_modules/typescript"  }}
    ```
    
        
    

The initial schema that you have created tells the CLI where to find the schematic that supports the `ng add` command. Now you are ready to create that schematic.

[Providing installation support](https://angular.dev/#providing-installation-support)
-------------------------------------------------------------------------------------

A schematic for the `ng add` command can enhance the initial installation process for your users. The following steps define this type of schematic.

1.  Go to the `<lib-root>/schematics/ng-add` folder.
2.  Create the main file, `index.ts`.
3.  Open `index.ts` and add the source code for your schematic factory function.
    
          
    
    ```
    import {Rule} from '@angular-devkit/schematics';import {addRootImport} from '@schematics/angular/utility';import {Schema} from './schema';export function ngAdd(options: Schema): Rule {  // Add an import `MyLibModule` from `my-lib` to the root of the user's project.  return addRootImport(    options.project,    ({code, external}) => code`${external('MyLibModule', 'my-lib')}`,  );}
    ```
    
        
    

The Angular CLI will install the latest version of the library automatically, and this example is taking it a step further by adding the `MyLibModule` to the root of the application. The `addRootImport` function accepts a callback that needs to return a code block. You can write any code inside of the string tagged with the `code` function and any external symbol have to be wrapped with the `external` function to ensure that the appropriate import statements are generated.

### [Define dependency type](https://angular.dev/#define-dependency-type)

Use the `save` option of `ng-add` to configure if the library should be added to the `dependencies`, the `devDependencies`, or not saved at all in the project's `package.json` configuration file.

      

```
{  "name": "my-lib",  "version": "0.0.1",  "scripts": {    "build": "tsc -p tsconfig.schematics.json",    "postbuild": "copyfiles schematics/*/schema.json schematics/*/files/** schematics/collection.json ../../dist/my-lib/"  },  "peerDependencies": {    "@angular/common": "^19.0.0",    "@angular/core": "^19.0.0"  },  "schematics": "./schematics/collection.json",  "ng-add": {    "save": "devDependencies"  },  "devDependencies": {    "copyfiles": "file:../../node_modules/copyfiles",    "typescript": "file:../../node_modules/typescript"  }}
```

    

Possible values are:

[Building your schematics](https://angular.dev/#building-your-schematics)
-------------------------------------------------------------------------

To bundle your schematics together with your library, you must configure the library to build the schematics separately, then add them to the bundle. You must build your schematics _after_ you build your library, so they are placed in the correct directory.

*   Your library needs a custom Typescript configuration file with instructions on how to compile your schematics into your distributed library
*   To add the schematics to the library bundle, add scripts to the library's `package.json` file

Assume you have a library project `my-lib` in your Angular workspace. To tell the library how to build the schematics, add a `tsconfig.schematics.json` file next to the generated `tsconfig.lib.json` file that configures the library build.

1.  Edit the `tsconfig.schematics.json` file to add the following content.
    
          
    
    ```
    {  "compilerOptions": {    "baseUrl": ".",    "lib": [      "es2018",      "dom"    ],    "declaration": true,    "module": "commonjs",    "moduleResolution": "node",    "noEmitOnError": true,    "noFallthroughCasesInSwitch": true,    "noImplicitAny": true,    "noImplicitThis": true,    "noUnusedParameters": true,    "noUnusedLocals": true,    "rootDir": "schematics",    "outDir": "../../dist/my-lib/schematics",    "skipDefaultLibCheck": true,    "skipLibCheck": true,    "sourceMap": true,    "strictNullChecks": true,    "target": "es6",    "types": [      "jasmine",      "node"    ]  },  "include": [    "schematics/**/*"  ],  "exclude": [    "schematics/*/files/**/*"  ]}
    ```
    
        
    
2.  To make sure your schematics source files get compiled into the library bundle, add the following scripts to the `package.json` file in your library project's root folder (`projects/my-lib`).
    
          
    
    ```
    {  "name": "my-lib",  "version": "0.0.1",  "scripts": {    "build": "tsc -p tsconfig.schematics.json",    "postbuild": "copyfiles schematics/*/schema.json schematics/*/files/** schematics/collection.json ../../dist/my-lib/"  },  "peerDependencies": {    "@angular/common": "^19.0.0",    "@angular/core": "^19.0.0"  },  "schematics": "./schematics/collection.json",  "ng-add": {    "save": "devDependencies"  },  "devDependencies": {    "copyfiles": "file:../../node_modules/copyfiles",    "typescript": "file:../../node_modules/typescript"  }}
    ```
    
        
    
    *   The `build` script compiles your schematic using the custom `tsconfig.schematics.json` file
    *   The `postbuild` script copies the schematic files after the `build` script completes
    *   Both the `build` and the `postbuild` scripts require the `copyfiles` and `typescript` dependencies. To install the dependencies, navigate to the path defined in `devDependencies` and run `npm install` before you run the scripts.

[Providing generation support](https://angular.dev/#providing-generation-support)
---------------------------------------------------------------------------------

You can add a named schematic to your collection that lets your users use the `ng generate` command to create an artifact that is defined in your library.

We'll assume that your library defines a service, `my-service`, that requires some setup. You want your users to be able to generate it using the following CLI command.

      

```
ng generate my-lib:my-service
```

    

To begin, create a new subfolder, `my-service`, in the `schematics` folder.

### [Configure the new schematic](https://angular.dev/#configure-the-new-schematic)

When you add a schematic to the collection, you have to point to it in the collection's schema, and provide configuration files to define options that a user can pass to the command.

1.  Edit the `schematics/collection.json` file to point to the new schematic subfolder, and include a pointer to a schema file that specifies inputs for the new schematic.
    
          
    
    ```
    {  "$schema": "../../../node_modules/@angular-devkit/schematics/collection-schema.json",  "schematics": {    "ng-add": {      "description": "Add my library to the project.",      "factory": "./ng-add/index#ngAdd",      "schema": "./ng-add/schema.json"    },    "my-service": {      "description": "Generate a service in the project.",      "factory": "./my-service/index#myService",      "schema": "./my-service/schema.json"    }  }}
    ```
    
        
    
2.  Go to the `<lib-root>/schematics/my-service` folder.
    
3.  Create a `schema.json` file and define the available options for the schematic.
    
          
    
    ```
    {  "$schema": "http://json-schema.org/schema",  "$id": "SchematicsMyService",  "title": "My Service Schema",  "type": "object",  "properties": {    "name": {      "description": "The name of the service.",      "type": "string"    },    "path": {      "type": "string",      "format": "path",      "description": "The path to create the service.",      "visible": false,      "$default": {        "$source": "workingDirectory"      }    },    "project": {      "type": "string",      "description": "The name of the project.",      "$default": {        "$source": "projectName"      }    }   },  "required": [    "name"  ]}
    ```
    
        
    
    *   _id_: A unique ID for the schema in the collection.
    *   _title_: A human-readable description of the schema.
    *   _type_: A descriptor for the type provided by the properties.
    *   _properties_: An object that defines the available options for the schematic.
    
    Each option associates key with a type, description, and optional alias. The type defines the shape of the value you expect, and the description is displayed when the user requests usage help for your schematic.
    
    See the workspace schema for additional customizations for schematic options.
    
4.  Create a `schema.ts` file and define an interface that stores the values of the options defined in the `schema.json` file.
    
          
    
    ```
    export interface Schema {  // The name of the service.  name: string;  // The path to create the service.  path?: string;  // The name of the project.  project?: string;}
    ```
    
        
    

### [Add template files](https://angular.dev/#add-template-files)

To add artifacts to a project, your schematic needs its own template files. Schematic templates support special syntax to execute code and variable substitution.

1.  Create a `files/` folder inside the `schematics/my-service/` folder.
    
2.  Create a file named `__name@dasherize__.service.ts.template` that defines a template to use for generating files. This template will generate a service that already has Angular's `HttpClient` injected into its constructor.
    
          
    
    ```
    import { Injectable } from '@angular/core'; import { HttpClient } from '@angular/common/http'; @Injectable({   providedIn: 'root' }) export class <%= classify(name) %>Service {   constructor(private http: HttpClient) { } }
    ```
    
        
    
    *   The `classify` and `dasherize` methods are utility functions that your schematic uses to transform your source template and filename.
        
    *   The `name` is provided as a property from your factory function. It is the same `name` you defined in the schema.
        

### [Add the factory function](https://angular.dev/#add-the-factory-function)

Now that you have the infrastructure in place, you can define the main function that performs the modifications you need in the user's project.

The Schematics framework provides a file templating system, which supports both path and content templates. The system operates on placeholders defined inside files or paths that loaded in the input `Tree`. It fills these in using values passed into the `Rule`.

For details of these data structures and syntax, see the [Schematics README](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md).

1.  Create the main file `index.ts` and add the source code for your schematic factory function.
    
2.  First, import the schematics definitions you will need. The Schematics framework offers many utility functions to create and use rules when running a schematic.
    
          
    
    ```
    import {  Rule,  Tree,  SchematicsException,  apply,  url,  applyTemplates,  move,  chain,  mergeWith,} from '@angular-devkit/schematics';import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';import {Schema as MyServiceSchema} from './schema';function createHost(tree: Tree): workspaces.WorkspaceHost {  return {    async readFile(path: string): Promise<string> {      const data = tree.read(path);      if (!data) {        throw new SchematicsException('File not found.');      }      return virtualFs.fileBufferToString(data);    },    async writeFile(path: string, data: string): Promise<void> {      return tree.overwrite(path, data);    },    async isDirectory(path: string): Promise<boolean> {      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;    },    async isFile(path: string): Promise<boolean> {      return tree.exists(path);    },  };}export function myService(options: MyServiceSchema): Rule {  return async (tree: Tree) => {    const host = createHost(tree);    const {workspace} = await workspaces.readWorkspace('/', host);    const project = options.project != null ? workspace.projects.get(options.project) : null;    if (!project) {      throw new SchematicsException(`Invalid project name: ${options.project}`);    }    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';    if (options.path === undefined) {      options.path = `${project.sourceRoot}/${projectType}`;    }    const templateSource = apply(url('./files'), [      applyTemplates({        classify: strings.classify,        dasherize: strings.dasherize,        name: options.name,      }),      move(normalize(options.path as string)),    ]);    return chain([mergeWith(templateSource)]);  };}
    ```
    
        
    
3.  Import the defined schema interface that provides the type information for your schematic's options.
    
          
    
    ```
    import {  Rule,  Tree,  SchematicsException,  apply,  url,  applyTemplates,  move,  chain,  mergeWith,} from '@angular-devkit/schematics';import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';import {Schema as MyServiceSchema} from './schema';function createHost(tree: Tree): workspaces.WorkspaceHost {  return {    async readFile(path: string): Promise<string> {      const data = tree.read(path);      if (!data) {        throw new SchematicsException('File not found.');      }      return virtualFs.fileBufferToString(data);    },    async writeFile(path: string, data: string): Promise<void> {      return tree.overwrite(path, data);    },    async isDirectory(path: string): Promise<boolean> {      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;    },    async isFile(path: string): Promise<boolean> {      return tree.exists(path);    },  };}export function myService(options: MyServiceSchema): Rule {  return async (tree: Tree) => {    const host = createHost(tree);    const {workspace} = await workspaces.readWorkspace('/', host);    const project = options.project != null ? workspace.projects.get(options.project) : null;    if (!project) {      throw new SchematicsException(`Invalid project name: ${options.project}`);    }    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';    if (options.path === undefined) {      options.path = `${project.sourceRoot}/${projectType}`;    }    const templateSource = apply(url('./files'), [      applyTemplates({        classify: strings.classify,        dasherize: strings.dasherize,        name: options.name,      }),      move(normalize(options.path as string)),    ]);    return chain([mergeWith(templateSource)]);  };}
    ```
    
        
    
4.  To build up the generation schematic, start with an empty rule factory.
    
          
    
    ```
    import {Rule, Tree} from '@angular-devkit/schematics';import {Schema as MyServiceSchema} from './schema';export function myService(options: MyServiceSchema): Rule {  return (tree: Tree) => tree;}
    ```
    
        
    

This rule factory returns the tree without modification. The options are the option values passed through from the `ng generate` command.

[Define a generation rule](https://angular.dev/#define-a-generation-rule)
-------------------------------------------------------------------------

You now have the framework in place for creating the code that actually modifies the user's application to set it up for the service defined in your library.

The Angular workspace where the user installed your library contains multiple projects (applications and libraries). The user can specify the project on the command line, or let it default. In either case, your code needs to identify the specific project to which this schematic is being applied, so that you can retrieve information from the project configuration.

Do this using the `Tree` object that is passed in to the factory function. The `Tree` methods give you access to the complete file tree in your workspace, letting you read and write files during the execution of the schematic.

### [Get the project configuration](https://angular.dev/#get-the-project-configuration)

1.  To determine the destination project, use the `workspaces.readWorkspace` method to read the contents of the workspace configuration file, `angular.json`. To use `workspaces.readWorkspace` you need to create a `workspaces.WorkspaceHost` from the `Tree`. Add the following code to your factory function.
    
          
    
    ```
    import {  Rule,  Tree,  SchematicsException,  apply,  url,  applyTemplates,  move,  chain,  mergeWith,} from '@angular-devkit/schematics';import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';import {Schema as MyServiceSchema} from './schema';function createHost(tree: Tree): workspaces.WorkspaceHost {  return {    async readFile(path: string): Promise<string> {      const data = tree.read(path);      if (!data) {        throw new SchematicsException('File not found.');      }      return virtualFs.fileBufferToString(data);    },    async writeFile(path: string, data: string): Promise<void> {      return tree.overwrite(path, data);    },    async isDirectory(path: string): Promise<boolean> {      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;    },    async isFile(path: string): Promise<boolean> {      return tree.exists(path);    },  };}export function myService(options: MyServiceSchema): Rule {  return async (tree: Tree) => {    const host = createHost(tree);    const {workspace} = await workspaces.readWorkspace('/', host);    const project = options.project != null ? workspace.projects.get(options.project) : null;    if (!project) {      throw new SchematicsException(`Invalid project name: ${options.project}`);    }    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';    if (options.path === undefined) {      options.path = `${project.sourceRoot}/${projectType}`;    }    const templateSource = apply(url('./files'), [      applyTemplates({        classify: strings.classify,        dasherize: strings.dasherize,        name: options.name,      }),      move(normalize(options.path as string)),    ]);    return chain([mergeWith(templateSource)]);  };}
    ```
    
        
    
    Be sure to check that the context exists and throw the appropriate error.
    
2.  Now that you have the project name, use it to retrieve the project-specific configuration information.
    
          
    
    ```
    import {  Rule,  Tree,  SchematicsException,  apply,  url,  applyTemplates,  move,  chain,  mergeWith,} from '@angular-devkit/schematics';import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';import {Schema as MyServiceSchema} from './schema';function createHost(tree: Tree): workspaces.WorkspaceHost {  return {    async readFile(path: string): Promise<string> {      const data = tree.read(path);      if (!data) {        throw new SchematicsException('File not found.');      }      return virtualFs.fileBufferToString(data);    },    async writeFile(path: string, data: string): Promise<void> {      return tree.overwrite(path, data);    },    async isDirectory(path: string): Promise<boolean> {      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;    },    async isFile(path: string): Promise<boolean> {      return tree.exists(path);    },  };}export function myService(options: MyServiceSchema): Rule {  return async (tree: Tree) => {    const host = createHost(tree);    const {workspace} = await workspaces.readWorkspace('/', host);    const project = options.project != null ? workspace.projects.get(options.project) : null;    if (!project) {      throw new SchematicsException(`Invalid project name: ${options.project}`);    }    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';    if (options.path === undefined) {      options.path = `${project.sourceRoot}/${projectType}`;    }    const templateSource = apply(url('./files'), [      applyTemplates({        classify: strings.classify,        dasherize: strings.dasherize,        name: options.name,      }),      move(normalize(options.path as string)),    ]);    return chain([mergeWith(templateSource)]);  };}
    ```
    
        
    
    The `workspace.projects` object contains all the project-specific configuration information.
    
3.  The `options.path` determines where the schematic template files are moved to once the schematic is applied.
    
    The `path` option in the schematic's schema is substituted by default with the current working directory. If the `path` is not defined, use the `sourceRoot` from the project configuration along with the `projectType`.
    
          
    
    ```
    import {  Rule,  Tree,  SchematicsException,  apply,  url,  applyTemplates,  move,  chain,  mergeWith,} from '@angular-devkit/schematics';import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';import {Schema as MyServiceSchema} from './schema';function createHost(tree: Tree): workspaces.WorkspaceHost {  return {    async readFile(path: string): Promise<string> {      const data = tree.read(path);      if (!data) {        throw new SchematicsException('File not found.');      }      return virtualFs.fileBufferToString(data);    },    async writeFile(path: string, data: string): Promise<void> {      return tree.overwrite(path, data);    },    async isDirectory(path: string): Promise<boolean> {      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;    },    async isFile(path: string): Promise<boolean> {      return tree.exists(path);    },  };}export function myService(options: MyServiceSchema): Rule {  return async (tree: Tree) => {    const host = createHost(tree);    const {workspace} = await workspaces.readWorkspace('/', host);    const project = options.project != null ? workspace.projects.get(options.project) : null;    if (!project) {      throw new SchematicsException(`Invalid project name: ${options.project}`);    }    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';    if (options.path === undefined) {      options.path = `${project.sourceRoot}/${projectType}`;    }    const templateSource = apply(url('./files'), [      applyTemplates({        classify: strings.classify,        dasherize: strings.dasherize,        name: options.name,      }),      move(normalize(options.path as string)),    ]);    return chain([mergeWith(templateSource)]);  };}
    ```
    
        
    

### [Define the rule](https://angular.dev/#define-the-rule)

A `Rule` can use external template files, transform them, and return another `Rule` object with the transformed template. Use the templating to generate any custom files required for your schematic.

1.  Add the following code to your factory function.
    
          
    
    ```
    import {  Rule,  Tree,  SchematicsException,  apply,  url,  applyTemplates,  move,  chain,  mergeWith,} from '@angular-devkit/schematics';import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';import {Schema as MyServiceSchema} from './schema';function createHost(tree: Tree): workspaces.WorkspaceHost {  return {    async readFile(path: string): Promise<string> {      const data = tree.read(path);      if (!data) {        throw new SchematicsException('File not found.');      }      return virtualFs.fileBufferToString(data);    },    async writeFile(path: string, data: string): Promise<void> {      return tree.overwrite(path, data);    },    async isDirectory(path: string): Promise<boolean> {      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;    },    async isFile(path: string): Promise<boolean> {      return tree.exists(path);    },  };}export function myService(options: MyServiceSchema): Rule {  return async (tree: Tree) => {    const host = createHost(tree);    const {workspace} = await workspaces.readWorkspace('/', host);    const project = options.project != null ? workspace.projects.get(options.project) : null;    if (!project) {      throw new SchematicsException(`Invalid project name: ${options.project}`);    }    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';    if (options.path === undefined) {      options.path = `${project.sourceRoot}/${projectType}`;    }    const templateSource = apply(url('./files'), [      applyTemplates({        classify: strings.classify,        dasherize: strings.dasherize,        name: options.name,      }),      move(normalize(options.path as string)),    ]);    return chain([mergeWith(templateSource)]);  };}
    ```
    
        
    
2.  Finally, the rule factory must return a rule.
    
          
    
    ```
    import {  Rule,  Tree,  SchematicsException,  apply,  url,  applyTemplates,  move,  chain,  mergeWith,} from '@angular-devkit/schematics';import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';import {Schema as MyServiceSchema} from './schema';function createHost(tree: Tree): workspaces.WorkspaceHost {  return {    async readFile(path: string): Promise<string> {      const data = tree.read(path);      if (!data) {        throw new SchematicsException('File not found.');      }      return virtualFs.fileBufferToString(data);    },    async writeFile(path: string, data: string): Promise<void> {      return tree.overwrite(path, data);    },    async isDirectory(path: string): Promise<boolean> {      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;    },    async isFile(path: string): Promise<boolean> {      return tree.exists(path);    },  };}export function myService(options: MyServiceSchema): Rule {  return async (tree: Tree) => {    const host = createHost(tree);    const {workspace} = await workspaces.readWorkspace('/', host);    const project = options.project != null ? workspace.projects.get(options.project) : null;    if (!project) {      throw new SchematicsException(`Invalid project name: ${options.project}`);    }    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';    if (options.path === undefined) {      options.path = `${project.sourceRoot}/${projectType}`;    }    const templateSource = apply(url('./files'), [      applyTemplates({        classify: strings.classify,        dasherize: strings.dasherize,        name: options.name,      }),      move(normalize(options.path as string)),    ]);    return chain([mergeWith(templateSource)]);  };}
    ```
    
        
    
    The `chain()` method lets you combine multiple rules into a single rule, so that you can perform multiple operations in a single schematic. Here you are only merging the template rules with any code executed by the schematic.
    

See a complete example of the following schematic rule function.

      

```
import {  Rule,  Tree,  SchematicsException,  apply,  url,  applyTemplates,  move,  chain,  mergeWith,} from '@angular-devkit/schematics';import {strings, normalize, virtualFs, workspaces} from '@angular-devkit/core';import {Schema as MyServiceSchema} from './schema';function createHost(tree: Tree): workspaces.WorkspaceHost {  return {    async readFile(path: string): Promise<string> {      const data = tree.read(path);      if (!data) {        throw new SchematicsException('File not found.');      }      return virtualFs.fileBufferToString(data);    },    async writeFile(path: string, data: string): Promise<void> {      return tree.overwrite(path, data);    },    async isDirectory(path: string): Promise<boolean> {      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;    },    async isFile(path: string): Promise<boolean> {      return tree.exists(path);    },  };}export function myService(options: MyServiceSchema): Rule {  return async (tree: Tree) => {    const host = createHost(tree);    const {workspace} = await workspaces.readWorkspace('/', host);    const project = options.project != null ? workspace.projects.get(options.project) : null;    if (!project) {      throw new SchematicsException(`Invalid project name: ${options.project}`);    }    const projectType = project.extensions.projectType === 'application' ? 'app' : 'lib';    if (options.path === undefined) {      options.path = `${project.sourceRoot}/${projectType}`;    }    const templateSource = apply(url('./files'), [      applyTemplates({        classify: strings.classify,        dasherize: strings.dasherize,        name: options.name,      }),      move(normalize(options.path as string)),    ]);    return chain([mergeWith(templateSource)]);  };}
```

    

For more information about rules and utility methods, see [Provided Rules](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics#provided-rules).

[Running your library schematic](https://angular.dev/#running-your-library-schematic)
-------------------------------------------------------------------------------------

After you build your library and schematics, you can install the schematics collection to run against your project. The following steps show you how to generate a service using the schematic you created earlier.

### [Build your library and schematics](https://angular.dev/#build-your-library-and-schematics)

From the root of your workspace, run the `ng build` command for your library.

Then, you change into your library directory to build the schematic

      

```
cd projects/my-libnpm run build
```

    

### [Link the library](https://angular.dev/#link-the-library)

Your library and schematics are packaged and placed in the `dist/my-lib` folder at the root of your workspace. For running the schematic, you need to link the library into your `node_modules` folder. From the root of your workspace, run the `npm link` command with the path to your distributable library.

### [Run the schematic](https://angular.dev/#run-the-schematic)

Now that your library is installed, run the schematic using the `ng generate` command.

      

```
ng generate my-lib:my-service --name my-data
```

    

In the console, you see that the schematic was run and the `my-data.service.ts` file was created in your application folder.

      

```
CREATE src/app/my-data.service.ts (208 bytes)
```
