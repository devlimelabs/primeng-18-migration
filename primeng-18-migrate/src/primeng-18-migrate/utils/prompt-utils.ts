import { checkbox, confirm, select } from '@inquirer/prompts';

/**
 * Prompt the user to select from a list of options
 * @param message The message to display
 * @param choices Array of choices to select from
 * @param defaultValue The default selected value
 * @returns Promise resolving to the selected choice
 */
export async function promptSelect<T extends string>(
  message: string, 
  choices: T[], 
  defaultValue?: T
): Promise<T> {
  const result: any = await select({
    message,
    choices,
    default: defaultValue
  });

  console.log('select result', result);
  return result;
}

/**
 * Prompt the user to select multiple options from a list
 * @param message The message to display
 * @param choices Array of choices to select from
 * @param defaultValues Array of default selected values
 * @returns Promise resolving to an array of selected choices
 */
export async function promptMultiSelect<T extends string>(
  message: string, 
  choices: T[]
): Promise<T[]> {
  const result: any = await checkbox({
    message,
    choices
  });

  console.log('checkbox result', result);

  return result;
}

/**
 * Legacy function for backward compatibility
 * Prompt the user for confirmation with run/skip/cancel options
 * @param message The message to display
 * @returns Promise resolving to the user's response ('run', 'skip', or 'cancel')
 */
export async function promptConfirm(message: string, defaultValue = true): Promise<boolean> {
  const result = await confirm({
    message,
    default: defaultValue
  });

  console.log('confirm result', result);

  return result;
} 
