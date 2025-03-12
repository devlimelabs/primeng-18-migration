# **Migrating to PrimeNG 18: A Comprehensive Guide**

PrimeNG 18 is a significant update to the popular Angular UI component library, bringing a host of new features, improvements, and a re-architected theming system [PrimeNG 18 Documentation](https://primeng.org/). This guide provides a comprehensive overview of the key changes, focusing on deprecated components, breaking changes, and how to address them effectively in a large Angular codebase.

## **Deprecated Components**

PrimeNG 18 deprecates several components in favor of newer alternatives. Here's a breakdown of the deprecated components and their recommended replacements:

| Deprecated Component | Suggested Replacement | Code Example |
| :---- | :---- | :---- |
| Chips | AutoComplete (with multiple and typeahead options) | html \<p-autoComplete \[(ngModel)\]="countries" \[suggestions\]="filteredCountries" (completeMethod)="filterCountry($event)" field="name" \[multiple\]="true"\> \</p-autoComplete\> |
| TabMenu | Tabs (without panels) | html \<p-tabs\> \<p-tabPanel header="Header 1"\> \</p-tabPanel\> \<p-tabPanel header="Header 2"\> \</p-tabPanel\> \<p-tabs\> |
| InlineMessage | Message | html \<p-message severity="info" text="This is an info message"\>\</p-message\> |
| TabView | Tabs | html \<p-tabs\> \<p-tabPanel header="Tab 1"\>Content 1\</p-tabPanel\> \<p-tabPanel header="Tab 2"\>Content 2\</p-tabPanel\> \</p-tabs\> |
| Messages | Message | html \<div \*ngFor="let msg of messages"\> \<p-message \[severity\]="msg.severity" \[text\]="msg.summary"\>\</p-message\> \</div\> |
| pDefer | Angular defer | html \<div \*ngIf="showContent; defer"\>This content is deferred.\</div\> |

## **Breaking Changes**

PrimeNG 18 introduces several breaking changes that require adjustments to your existing code. Here's a summary of these changes and how to address them:

| Breaking Change | Explanation and Solution | Code Example |
| :---- | :---- | :---- |
| PrimeNGConfig replaced by PrimeNG | The initial configuration of PrimeNG is now handled by the providePrimeNG provider during application startup1. | typescript import { PrimeNGConfig } from 'primeng/api'; // ... constructor(private config: PrimeNGConfig) { this.config.ripple \= true; } |
| SASS Themes re-implemented | The theming system has been re-architected to improve attractiveness, consistency, and design agnosticism2. The theme.css and primeng/resources files are no longer used. Custom themes from v17 need to be recreated using the new APIs based on the new PrimeOne design system with implementations like Saga, Vela, and Arya3. | N/A |
| TriStateCheckbox replaced by Checkbox with indeterminate option | Use the Checkbox component with the indeterminate option to achieve the same functionality3. | html \<p-checkbox \[(ngModel)\]="checked" \[indeterminate\]="indeterminate" (onChange)="onChange($event)"\> \</p-checkbox\> |
| DataViewLayoutOptions replaced by SelectButton | Use the SelectButton component to provide layout options for the DataView3. | html \<p-selectButton \[options\]="layoutOptions" \[(ngModel)\]="selectedLayout" (onChange)="changeLayout($event)"\> \</p-selectButton\> |
| pAnimate replaced by pAnimateOnScroll | Replace any instances of pAnimate with pAnimateOnScroll to apply animations on scroll3. | html \<div pAnimateOnScroll enterClass="animate\_\_fadeIn" leaveClass="animate\_\_fadeOut"\> Content to animate \</div\> |
| Themes removed, migration to styled mode required | Migrate to the new styled mode theming system3. | N/A |
| Messages component deprecated, replaced by Message | The Messages component, which was a wrapper for multiple messages, has been deprecated3. Developers now need to loop through an array of messages and display each one individually using the Message component. | html \<div \*ngFor="let msg of messages"\> \<p-message \[severity\]="msg.severity" \[text\]="msg.summary"\>\</p-message\> \</div\> |
| Message interface renamed to ToastMessageOptions | Update your code to use the ToastMessageOptions interface from primeng/api3. | typescript import { ToastMessageOptions } from 'primeng/api'; const message: ToastMessageOptions \= { severity: 'info', summary: 'Info', detail: 'Message Content' }; |
| Sidebar/Drawer size property removed | Use responsive class utilities to control the size of the sidebar/drawer3. | html \<p-sidebar \[(visible)\]="visible" class="w-full sm:w-6 md:w-20rem"\> \</p-sidebar\> |
| p-link removed | Use a button with link mode instead3. | html \<button pButton pRipple type="button" label="Link" class="p-button-link"\>\</button\> |
| p-highlight removed | The global .p-highlight class has been removed. Each component now has its own specific class for highlighting, such as .p-select-option-selected for selected options in the Select component3. | N/A |
| p-fluid removed | Use the built-in fluid property of supported components or the Fluid component3. | html \<p-inputtext \[(ngModel)\]="value" \[fluid\]="true"\>\</p-inputtext\> |
| PrimeFlex CSS library v3 incompatible | Upgrade to PrimeFlex v4 for compatibility with PrimeNG 18+3. | N/A |
| p-table pagination | The pagination API for p-table has changed. The old paginate method has been replaced with onPageChange4. | typescript // Old API this.table.paginate({ first: 0, rows: 10 }); // New API this.table.onPageChange({ first: 0, rows: 10 }); |
| Dialog component closeButtonProps removed | The closeButtonProps property has been removed from the Dialog component3. Developers can now use standard button properties like outlined and raised directly on the close button element. | html \<p-dialog header="Dialog" \[(visible)\]="display"\> \<button pButton type="button" icon="pi pi-times" (click)="display=false" class="p-button-text"\>\</button\> \</p-dialog\> |

## **Key Considerations for Large Codebases**

When migrating a large Angular codebase to PrimeNG 18, consider these points:

| Consideration | Description |
| :---- | :---- |
| Impact Analysis | Conduct a comprehensive review to identify all instances of deprecated components and breaking changes. |
| Incremental Migration | Migrate components and features step-by-step to minimize disruption. |
| Testing and Validation | Thoroughly test after each migration step. |
| Documentation | Update internal documentation to reflect the changes. |
| Version Control | Utilize a version control system like Git to track changes and allow for easy rollback if necessary. |
| Code Editor Assistance | Leverage code editor features like "Find and Replace" to efficiently update code across the codebase. |
| Automated Testing | Implement automated tests to ensure that existing functionality remains intact after migration. |
| Team Communication | Clearly communicate the migration plan and timeline to all team members to ensure a smooth transition. |

## **Conclusion**

Migrating to PrimeNG 18 might require some effort, but the benefits of the new features, improved performance, and updated theming system are worth it. PrimeNG 18 offers simplified integration with the PrimeNGConfig theme provider, streamlining theme loading and configuration. The re-architected theming system, based on the PrimeOne design system, aims for enhanced visual appeal, consistency, and design agnosticism. By carefully following this guide, addressing the deprecated components and breaking changes, and considering the key considerations for large codebases, you can successfully transition to PrimeNG 18 and leverage its enhancements in your Angular applications.

#### **Works cited**

1\. Dark theme switch in Angular with PrimeNG 18 and Tailwind | by Mathieu Schnoor \- Medium, accessed March 11, 2025, [https://medium.com/@mathieu.schnoor/dark-theme-switch-in-angular-with-primeng-18-and-tailwind-623637c9f42d](https://medium.com/@mathieu.schnoor/dark-theme-switch-in-angular-with-primeng-18-and-tailwind-623637c9f42d)  
2\. Migration Guide to PrimeNG 10 \- YouTube, accessed March 11, 2025, [https://www.youtube.com/watch?v=W8lVy60wEOY](https://www.youtube.com/watch?v=W8lVy60wEOY)  
3\. Migration \- PrimeNG, accessed March 11, 2025, [https://primeng.org/guides/migration\#breaking](https://primeng.org/guides/migration#breaking)  
4\. Migration \- PrimeNG, accessed March 11, 2025, [https://primeng.org/guides/migration\#deprecated](https://primeng.org/guides/migration#deprecated)
