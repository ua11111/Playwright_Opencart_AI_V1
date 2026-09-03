import { Page, Locator } from '@playwright/test';

/**
 * HomePage - Main landing page of OpenCart
 */
export class HomePage {
    private readonly page: Page;

    // Locators
    private readonly myAccountButton: Locator;
    private readonly myAccountDropdown: Locator;
    private readonly registerLink: Locator;
    private readonly loginLink: Locator;
    private readonly logoutLink: Locator;
    private readonly searchInput: Locator;
    private readonly searchButton: Locator;
    private readonly cartLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with accessible patterns and CSS selectors
        this.myAccountButton = page.locator('a').filter({ hasText: /My Account/i }).first();
        this.myAccountDropdown = page.locator('ul.dropdown-menu');
        this.registerLink = page.locator('a').filter({ hasText: /Register/i });
        this.loginLink = page.locator('a').filter({ hasText: /Login/i });
        this.logoutLink = page.locator('a').filter({ hasText: /Logout/i });
        this.searchInput = page.locator('#search input[type="text"]');
        this.searchButton = page.locator('#search button');
        this.cartLink = page.locator('a').filter({ hasText: /Shopping Cart/i });
    }

    /**
     * Navigate to the home page
     */
    async navigateToHome(): Promise<void> {
        await this.page.goto(process.env.WEB_APP_URL || 'http://localhost/opencart/upload/');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Click on My Account button to reveal dropdown
     */
    async clickMyAccount(): Promise<void> {
        await this.myAccountButton.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Click on Register link in dropdown
     */
    async clickRegister(): Promise<void> {
        await this.registerLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Click on Login link in dropdown
     */
    async clickLogin(): Promise<void> {
        await this.loginLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Click on Logout link
     */
    async clickLogout(): Promise<void> {
        await this.logoutLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Search for a product
     * @param productName - Name of the product to search
     */
    async searchProduct(productName: string): Promise<void> {
        await this.searchInput.fill(productName);
        await this.searchButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Open shopping cart
     */
    async openCart(): Promise<void> {
        await this.cartLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Verify that home page is displayed
     */
    async isHomePageDisplayed(): Promise<boolean> {
        try {
            return await this.myAccountButton.isVisible();
        } catch (error) {
            console.log(`Error checking home page: ${error}`);
            return false;
        }
    }
}
