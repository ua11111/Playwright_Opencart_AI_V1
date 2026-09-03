import { faker } from '@faker-js/faker';

/**
 * RandomDataUtil - Generates random test data using Faker.js
 * Provides methods to generate customer registration data and other test fixtures
 */
export class RandomDataUtil {
    /**
     * Generate random customer registration payload
     * @returns Object containing random customer data
     */
    static generateCustomerPayload(): {
        firstName: string;
        lastName: string;
        email: string;
        telephone: string;
        password: string;
    } {
        return {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            telephone: faker.phone.number('+1##########'),
            password: faker.internet.password({ length: 12, memorable: false }),
        };
    }

    /**
     * Generate random first name
     */
    static generateFirstName(): string {
        return faker.person.firstName();
    }

    /**
     * Generate random last name
     */
    static generateLastName(): string {
        return faker.person.lastName();
    }

    /**
     * Generate random unique email
     */
    static generateUniqueEmail(): string {
        return faker.internet.email();
    }

    /**
     * Generate random telephone number
     */
    static generateTelephone(): string {
        return faker.phone.number('+1##########');
    }

    /**
     * Generate random password
     */
    static generatePassword(): string {
        return faker.internet.password({ length: 12, memorable: false });
    }
}
