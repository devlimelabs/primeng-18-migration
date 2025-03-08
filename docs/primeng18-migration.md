Migration
=========

Migration guide to PrimeNG v18

Overview
--------

At PrimeTek, we have been developing UI component libraries since 2008. The web continues to undergo technological advancements, and as a result, we have to modernize and update our libraries to stay relevant. PrimeNG v18 is the next-generation version that fully embraces modern Web APIs and removes technical debt like the legacy-styled mode. Every component has been reviewed and enhanced.

The most notable feature is the new [styled mode](https://primeng.org/theming) implementation. Previous iterations use SASS at an external repo called PrimeNG-sass-theme which requires compilation of a theme.cssa file. This file had to be included in the application and need to be swapped at runtime for basic tasks like dark mode or primary color changes. In v18, styled mode is now part of the core, SASS is not used at all, and a new design token based architecture that fully utilizes CSS variables has been created. The new API is modern and superior to the legacy styled mode.

Names of some of the components have been changed to more common alternatives for example, Popover replaced OverlayPanel and InputSwitch is now called ToggleSwitch. Each component has been reviewed for a consistent naming between CSS class names and sections. An example would be the option element of a Select component that uses p-select-option for the class name.

Components have been utilized more within other components, for instance Dialog close button is not actually a PrimeNG button so that closeButtonProps can be used to enable the features of button like outlined, raised and more.

Changes
-------

The list of backward compatible and breaking changes.

### Compatible

#### Renamed Components

Old names are deprecated but still functional, migrate to new import paths instead e.g. primeng/calendar becomes primeng/datepicker.

-   Calendar -> DatePicker.
-   Dropdown -> Select.
-   InputSwitch -> ToggleSwitch.
-   OverlayPanel -> Popover.
-   Sidebar -> Drawer.

### Deprecated Components

#### Deprecated Components

Components that are deprecated since their functionality is provided by other components.

-   Chips | Use AutoComplete with multiple enabled and typeahead disabled.
-   TabMenu | Use Tabs without panels.
-   Steps | Use Stepper without panels.
-   InlineMessage | Use Message component.
-   TabView | Use the new Tabs components.
-   Accordion | Use with the new *AccordionHeader* and *AccordionContent* components.
-   Messages | Use with the new *Message* component.
-   pDefer | Use Angular *defer* instead.

### Breaking

#### Configuration

The PrimeNGConfig has been replaced by PrimeNG and the initial configuration is now done via the providePrimeNG provider during startup. See the [installation](https://primeng.org/installation) section for an example.

#### SASS Themes

The styled mode theming has been reimplemented from scratch based on an all-new architecture. The theme.css and the primeng/resources do not exist anymore, so any imports of these assets needs to be removed. If you had a custom theme for v17, the theme needs to be recreated using the new APIs. See the customization section at [styled mode](https://primeng.org/theming) for details.

#### Removed Components

-   TriStateCheckbox | Use Checkbox with indeterminate option.
-   DataViewLayoutOptions | Use SelectButton instead.
-   pAnimate | Use pAnimateOnScroll instead.

#### Removed Files

-   Themes under the primeng/resources path, migration to new styled mode is necessary.

#### Messages and Message

Messages component is deprecated due to unnecessary role of being just a wrapper around multiple message instances and it's replaced with the new Message. Instead of message, users now need to loop through their custom array to display multiple messages to achieve same behavior. The spacing, closable and life properties of the Message have breaking changes to provide Message functionality. Default margin is removed, closable is false by default and messages do not disappear automatically.

#### Message Interface

Message interface in primeng/api is renamed as ToastMessageOptions due to name collision with the Message component.

#### Removed Features

-   Sidebar/Drawer size property is removed, use a responsive class utilty as replacement, demos have new examples.

#### Removed Style Classes

-   .p-link, use a button in link mode.
-   .p-highlight, each component have its own class such as .p-select-option-selected.
-   .p-fluid, use the new built-in fluid property of the supported components or the Fluid component.

#### PrimeFlex CSS

In case you are using PrimeFlex CSS library, upgrade to PrimeFlex v4 since PrimeFlex v3 is not compatible with PrimeNG v18+
