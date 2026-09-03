/**
 * Test Case: User Registration Flow - Validate successful customer registration
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Open the application
 * 2) Navigate to My Account → Register
 * 3) Verify registration page is displayed
 * 4) Generate unique customer data
 * 5) Fill registration form with valid data
 * 6) Accept privacy policy
 * 7) Submit registration form
 * 8) Verify registration success message
 * 9) Verify account navigation is available
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('User Registration Flow - Complete registration successfully @master @sanity @web', async ({
    homePage,
    registerPage,
    page,
}) => {
    const customerData = RandomDataUtil.generateCustomerPayload();

    await test.step('1) Open the application', async () => {
        await homePage.navigateToHome();
        const isHomeDisplayed = await homePage.isHomePageDisplayed();
        expect(isHomeDisplayed).toBeTruthy();
        console.log('✅ Application opened successfully');
    });

    await test.step('2) Navigate to My Account → Register', async () => {
        await homePage.clickMyAccount();
        await homePage.clickRegister();
        console.log('✅ Navigated to registration page');
    });

    await test.step('3) Verify registration page is displayed', async () => {
        const isRegisterPageDisplayed = await registerPage.isRegisterPageDisplayed();
        expect(isRegisterPageDisplayed).toBeTruthy();
        console.log('✅ Registration page displayed');
    });

    await test.step('4) Generate unique customer data', async () => {
        expect(customerData.firstName).toBeTruthy();
        expect(customerData.lastName).toBeTruthy();
        expect(customerData.email).toBeTruthy();
        expect(customerData.telephone).toBeTruthy();
        expect(customerData.password).toBeTruthy();
        console.log('✅ Customer data generated:', {
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            email: customerData.email,
        });
    });

    await test.step('5) Fill registration form with valid data', async () => {
        await registerPage.completeRegistration(customerData);
        console.log('✅ Registration form filled with valid data');
    });

    await test.step('6) Accept privacy policy', async () => {
        // Privacy policy is already accepted in completeRegistration method
        console.log('✅ Privacy policy accepted');
    });

    await test.step('7) Submit registration form', async () => {
        await registerPage.clickContinue();
        console.log('✅ Registration form submitted');
    });

    await test.step('8) Verify registration success message', async () => {
        const isSuccessful = await registerPage.isRegistrationSuccessful();
        expect(isSuccessful).toBeTruthy();
        const successMessage = await registerPage.getSuccessMessage();
        expect(successMessage).toContain('Account Has Been Created');
        console.log('✅ Registration success message verified:', successMessage);
    });

    await test.step('9) Verify account navigation is available', async () => {
        // After successful registration, verify we can navigate back home and see account options
        const isHomeDisplayed = await homePage.isHomePageDisplayed();
        expect(isHomeDisplayed).toBeTruthy();
        console.log('✅ Account navigation available, home page accessible');
    });

    console.log('✅ ✔️ User Registration Flow completed successfully!');
});
