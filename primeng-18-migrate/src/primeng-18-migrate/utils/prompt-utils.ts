import * as readline from 'readline';

// Test mode configuration
let isTestMode = false;
let testPromptResponse = 'run';

/**
 * Configure test mode for prompts
 * @param enabled Whether test mode is enabled
 * @param response The response to return in test mode
 */
export function setupTestMode(enabled: boolean, response: string = 'run'): void {
  isTestMode = enabled;
  testPromptResponse = response;
}

/**
 * Prompt the user for confirmation
 * @param message The message to display
 * @returns Promise resolving to the user's response
 */
export function promptForConfirmation(message: string): Promise<string> {
  // In test mode, return the preset answer immediately
  if (isTestMode) {
    return Promise.resolve(testPromptResponse);
  }

  // In normal mode, prompt the user
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<string>((resolve) => {
    rl.question(`${message} (run/skip/cancel): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
} 
