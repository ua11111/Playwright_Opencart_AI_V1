import { Page, Locator } from '@playwright/test';

/**
 * RegisterPage - Customer registration page in OpenCart
 */
export class RegisterPage {
    private readonly page: Page;

    // Locators
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly emailInput: Locator;
    private readonly telephoneInput: Locator;
    private readonly passwordInput: Locator;
    private readonly confirmPasswordInput: Locator;
    private readonly privacyPolicyCheckbox: Locator;
    private readonly continueButton: Locator;
    private readonly registerHeading: Locator;
    private readonly successMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators
        this.registerHeading = page.locator('h1').filter({ hasText: /Register/i });
        this.firstNameInput = page.locator('#input-firstname');
        this.lastNameInput = page.locator('#input-lastname');
        this.emailInput = page.locator('#input-email');
        this.telephoneInput = page.locator('#input-telephone');
        this.passwordInput = page.locator('#input-password');
        this.confirmPasswordInput = page.locator('#input-confirm');
        this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
        // Try multiple button locator strategies
        this.continueButton = page.locator('button[type="submit"]').last().or(page.locator('input[type="submit"]')).or(page.locator('button').filter({ hasText: /Continue|Register/i }).first());
        this.successMessage = page.locator('h1').filter({ hasText: /Account Has Been Created|account has been created/i });
    }

    /**
     * Verify that register page is displayed
     */
    async isRegisterPageDisplayed(): Promise<boolean> {
        try {
            return await this.registerHeading.isVisible();
        } catch (error) {
            console.log(`Error checking register page: ${error}`);
            return false;
        }
    }

    /**
     * Fill first name field
     * @param firstName - First name value
     */
    async setFirstName(firstName: string): Promise<void> {
        await this.firstNameInput.fill(firstName);
    }

    /**
     * Fill last name field
     * @param lastName - Last name value
     */
    async setLastName(lastName: string): Promise<void> {
        await this.lastNameInput.fill(lastName);
    }

    /**
     * Fill email field
     * @param email - Email address
     */
    async setEmail(email: string): Promise<void> {
        await this.emailInput.fill(email);
    }

    /**
     * Fill telephone field
     * @param telephone - Telephone number
     */
    async setTelephone(telephone: string): Promise<void> {
        await this.telephoneInput.fill(telephone);
    }

    /**
     * Fill password field
     * @param password - Password value
     */
    async setPassword(password: string): Promise<void> {
        await this.passwordInput.fill(password);
    }

    /**
     * Fill password confirmation field
     * @param password - Password confirmation value
     */
    async setConfirmPassword(password: string): Promise<void> {
        await this.confirmPasswordInput.fill(password);
    }

    /**
     * Accept privacy policy checkbox
     */
    async acceptPrivacyPolicy(): Promise<void> {
        await this.privacyPolicyCheckbox.check();
    }

    /**
     * Complete the registration form with all required fields
     * @param userData - Object containing registration data
     */
    async completeRegistration(userData: {
        firstName: string;
        lastName: string;
        email: string;
        telephone: string;
        password: string;
    }): Promise<void> {
        try {
            await this.setFirstName(userData.firstName);
            await this.setLastName(userData.lastName);
            await this.setEmail(userData.email);
            await this.setTelephone(userData.telephone);
            await this.setPassword(userData.password);
            await this.setConfirmPassword(userData.password);
            await this.acceptPrivacyPolicy();
        } catch (error) {
            console.log(`Error filling registration form: ${error}`);
            throw error;
        }
    }

    /**
     * Click the Continue/Register button
     */
    async clickContinue(): Promise<void> {
        try {
            // Scroll to button if needed
            await this.continueButton.scrollIntoViewIfNeeded();
            // Wait for button to be enabled
            await this.continueButton.waitFor({ state: 'visible', timeout: 10000 });
            await this.continueButton.click({ timeout: 5000 });
            // Wait for page navigation
            await this.page.waitForLoadState('networkidle');
        } catch (error) {
            console.log(`Error clicking continue button: ${error}`);
            // Try alternative approach - find button by text content
            try {
                const buttons = await this.page.locator('button, input[type="submit"]').all();
                for (const btn of buttons) {
                    const text = await btn.textContent();
                    if (text && /continue|register|submit/i.test(text)) {
                        await btn.click();
                        await this.page.waitForLoadState('networkidle');
                        return;
                    }
                }
            } catch (altError) {
                console.log(`Alternative button click also failed: ${altError}`);
            }
            throw error;
        }
    }

    /**
     * Verify registration success message is displayed
     */
    async isRegistrationSuccessful(): Promise<boolean> {
        try {
            return await this.successMessage.isVisible({ timeout: 5000 });
        } catch (error) {
            console.log(`Error checking success message: ${error}`);
            return false;
        }
    }

    /**
     * Get the success message text
     */
    async getSuccessMessage(): Promise<string> {
        return await this.successMessage.textContent() || '';
    }
}
