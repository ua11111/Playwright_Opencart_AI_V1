import { test as base, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';

dotenv.config();

type PageFixtures = {
    homePage: HomePage;
    registerPage: RegisterPage;
};

const APP_URL = process.env.WEB_APP_URL || 'http://localhost/opencart/upload/';

export const test = base.extend<PageFixtures>({
    homePage: async ({ page }, use) => {
        await page.goto(APP_URL);
        await page.waitForLoadState('networkidle');
        await use(new HomePage(page));
    },
    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },
});

export { expect } from '@playwright/test';
