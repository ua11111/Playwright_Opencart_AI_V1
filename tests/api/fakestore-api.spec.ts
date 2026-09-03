import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import fs from 'node:fs';
import path from 'node:path';
import { Routes } from '../../api/endpoints/routes';

type Product = {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating?: { rate: number; count: number };
};

type User = {
    id: number;
    email: string;
    username: string;
    password: string;
    name: { firstname: string; lastname: string };
    phone: string;
};

type Cart = {
    id: number;
    userId: number;
    date: string;
    products: { productId: number; quantity: number }[];
};

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const PRODUCT_ID = 1;
const USER_ID = 1;
const CART_ID = 1;
const LIMIT = 3;
const VALID_USERNAME = 'johnd';
const VALID_PASSWORD = 'm38rmF$';
const PRODUCT_PAYLOAD = {
    title: 'Playwright deterministic product',
    price: 29.99,
    description: 'Product created by the Playwright API suite',
    image: 'https://i.pravatar.cc',
    category: "men's clothing",
};
const USER_PAYLOAD = {
    email: 'playwright.user@example.com',
    username: 'playwright-user',
    password: 'PlaywrightPassword123',
    name: { firstname: 'Playwright', lastname: 'User' },
    address: {
        city: 'Test City',
        street: 'Test Street',
        number: 1,
        zipcode: '12345',
        geolocation: { lat: '0', long: '0' },
    },
    phone: '555-0100',
};
const CART_PAYLOAD = {
    userId: USER_ID,
    products: [{ productId: PRODUCT_ID, quantity: 2 }],
};

function route(template: string, values: Record<string, string | number>): string {
    return Object.entries(values).reduce(
        (result, [key, value]) => result.replace(`{${key}}`, String(value)),
        template,
    );
}

function isAscending(values: number[]): boolean {
    return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

function isDescending(values: number[]): boolean {
    return values.every((value, index) => index === 0 || values[index - 1] >= value);
}

function readSchema(fileName: string): object {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../api/schemas', fileName), 'utf8')) as object;
}

async function expectSchema(responseBody: object, schemaFile: string): Promise<void> {
    const validator = new Ajv().compile(readSchema(schemaFile));
    const valid = validator(responseBody);
    expect(valid, `Response did not match ${schemaFile}: ${JSON.stringify(validator.errors)}`).toBeTruthy();
}

test.describe('FakeStore REST API Tests', () => {
    test('POST - Successful login @master @sanity @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: { username: VALID_USERNAME, password: VALID_PASSWORD },
        });
        expect(response.status(), 'Valid login should return HTTP 201').toBe(201);
        const body = await response.json();
        expect(typeof body.token, 'Login response should contain a token string').toBe('string');
        expect(body.token.length, 'Login token should not be empty').toBeGreaterThan(0);
    });

    test('POST - Invalid login @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: { username: 'invalid-user', password: 'invalid-password' },
        });
        expect(response.status(), 'Invalid login should return HTTP 401').toBe(401);
        expect(await response.text(), 'Invalid login should explain the authentication failure').toBe('username or password is incorrect');
    });

    test('GET - All products @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
        expect(response.status(), 'Products request should return HTTP 200').toBe(200);
        const products = await response.json() as Product[];
        expect(Array.isArray(products), 'Products response should be an array').toBeTruthy();
        expect(products.length, 'Products response should not be empty').toBeGreaterThan(0);
        expect(products[0]).toEqual(expect.objectContaining({
            id: expect.any(Number), title: expect.any(String), price: expect.any(Number),
            category: expect.any(String), image: expect.any(String),
        }));
    });

    test('GET - Product by ID @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_PRODUCT_BY_ID, { id: PRODUCT_ID })}`);
        expect(response.status(), 'Product lookup should return HTTP 200').toBe(200);
        const product = await response.json() as Product;
        expect(product.id, 'Returned product ID should match the request').toBe(PRODUCT_ID);
        expect(product.title).toEqual(expect.any(String));
        expect(product.price).toEqual(expect.any(Number));
        expect(product.category).toEqual(expect.any(String));
        expect(product.image).toEqual(expect.any(String));
    });

    test('GET - Products with limit @master @regression @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_PRODUCTS_WITH_LIMIT, { limit: LIMIT })}`);
        expect(response.status()).toBe(200);
        const products = await response.json() as Product[];
        expect(Array.isArray(products)).toBeTruthy();
        expect(products.length, 'Product count should respect the requested limit').toBe(LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Products sorted ${order} @master @regression @api`, async ({ request }) => {
            const response = await request.get(`${BASE_URL}${route(Routes.GET_PRODUCTS_SORTED, { order })}`);
            expect(response.status()).toBe(200);
            const products = await response.json() as Product[];
            const ids = products.map((product) => product.id);
            expect(order === 'asc' ? isAscending(ids) : isDescending(ids), `Product IDs should be sorted ${order}`).toBeTruthy();
        });
    }

    test('GET - All product categories @master @regression @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
        expect(response.status()).toBe(200);
        const categories = await response.json();
        expect(Array.isArray(categories)).toBeTruthy();
        expect(categories.length).toBeGreaterThan(0);
        expect(categories.every((category: unknown) => typeof category === 'string')).toBeTruthy();
    });

    test('GET - Products by category @master @regression @api', async ({ request }) => {
        const category = 'electronics';
        const response = await request.get(`${BASE_URL}${route(Routes.GET_PRODUCTS_BY_CATEGORY, { category })}`);
        expect(response.status()).toBe(200);
        const products = await response.json() as Product[];
        expect(Array.isArray(products)).toBeTruthy();
        expect(products.length).toBeGreaterThan(0);
        expect(products.every((product) => product.category === category)).toBeTruthy();
    });

    test('POST - Create product @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: PRODUCT_PAYLOAD });
        expect(response.status()).toBe(201);
        const product = await response.json() as Product;
        expect(product.id).toEqual(expect.any(Number));
        expect(product).toEqual(expect.objectContaining(PRODUCT_PAYLOAD));
    });

    test('PUT - Update product @master @regression @api', async ({ request }) => {
        const updated = { ...PRODUCT_PAYLOAD, title: 'Updated Playwright product', price: 39.99 };
        const response = await request.put(`${BASE_URL}${route(Routes.UPDATE_PRODUCT, { id: PRODUCT_ID })}`, { data: updated });
        expect(response.status()).toBe(200);
        const product = await response.json() as Product;
        expect(product.id).toBe(PRODUCT_ID);
        expect(product.title).toBe(updated.title);
        expect(product.price).toBe(updated.price);
    });

    test('DELETE - Product @master @regression @api', async ({ request }) => {
        const response = await request.delete(`${BASE_URL}${route(Routes.DELETE_PRODUCT, { id: PRODUCT_ID })}`);
        expect(response.status()).toBe(200);
        expect((await response.json()).id).toBe(PRODUCT_ID);
    });

    test('GET - All users @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
        expect(response.status()).toBe(200);
        const users = await response.json() as User[];
        expect(Array.isArray(users)).toBeTruthy();
        expect(users.length).toBeGreaterThan(0);
    });

    test('GET - User by ID @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_USER_BY_ID, { id: USER_ID })}`);
        expect(response.status()).toBe(200);
        const user = await response.json() as User;
        expect(user.id).toBe(USER_ID);
    });

    test('GET - Users with limit @master @regression @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_USERS_WITH_LIMIT, { limit: LIMIT })}`);
        expect(response.status()).toBe(200);
        const users = await response.json() as User[];
        expect(users.length).toBe(LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Users sorted ${order} @master @regression @api`, async ({ request }) => {
            const response = await request.get(`${BASE_URL}${route(Routes.GET_USERS_SORTED, { order })}`);
            expect(response.status()).toBe(200);
            const users = await response.json() as User[];
            const ids = users.map((user) => user.id);
            expect(order === 'asc' ? isAscending(ids) : isDescending(ids)).toBeTruthy();
        });
    }

    test('POST - Create user @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: USER_PAYLOAD });
        expect(response.status()).toBe(201);
        const user = await response.json() as User;
        expect(user.id).toEqual(expect.any(Number));
    });

    test('PUT - Update user @master @regression @api', async ({ request }) => {
        const updated = { ...USER_PAYLOAD, username: 'updated-playwright-user' };
        const response = await request.put(`${BASE_URL}${route(Routes.UPDATE_USER, { id: USER_ID })}`, { data: updated });
        expect(response.status()).toBe(200);
        const user = await response.json() as User;
        expect(user.username).toBe(updated.username);
    });

    test('DELETE - User @master @regression @api', async ({ request }) => {
        const response = await request.delete(`${BASE_URL}${route(Routes.DELETE_USER, { id: USER_ID })}`);
        expect(response.status()).toBe(200);
        expect((await response.json()).id).toBe(USER_ID);
    });

    test('GET - All carts @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
        expect(response.status()).toBe(200);
        const carts = await response.json() as Cart[];
        expect(Array.isArray(carts)).toBeTruthy();
        expect(carts.length).toBeGreaterThan(0);
    });

    test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_CART_BY_ID, { id: CART_ID })}`);
        expect(response.status()).toBe(200);
        const cart = await response.json() as Cart;
        expect(cart.id).toBe(CART_ID);
    });

    test('GET - Carts by date range @master @regression @api', async ({ request }) => {
        const startdate = '2019-01-01';
        const enddate = '2020-12-31';
        const response = await request.get(`${BASE_URL}${route(Routes.GET_CARTS_BY_DATE_RANGE, { startdate, enddate })}`);
        expect(response.status()).toBe(200);
        const carts = await response.json() as Cart[];
        expect(Array.isArray(carts)).toBeTruthy();
        for (const cart of carts) {
            const date = new Date(cart.date).getTime();
            expect(date).toBeGreaterThanOrEqual(new Date(startdate).getTime());
            expect(date).toBeLessThanOrEqual(new Date(`${enddate}T23:59:59.999Z`).getTime());
        }
    });

    test('GET - User carts @master @regression @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_USER_CART, { userId: USER_ID })}`);
        expect(response.status()).toBe(200);
        const carts = await response.json() as Cart[];
        expect(Array.isArray(carts)).toBeTruthy();
        expect(carts.every((cart) => cart.userId === USER_ID)).toBeTruthy();
    });

    test('GET - Carts with limit @master @regression @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_CARTS_WITH_LIMIT, { limit: LIMIT })}`);
        expect(response.status()).toBe(200);
        const carts = await response.json() as Cart[];
        expect(carts.length).toBe(LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Carts sorted ${order} @master @regression @api`, async ({ request }) => {
            const response = await request.get(`${BASE_URL}${route(Routes.GET_CARTS_SORTED, { order })}`);
            expect(response.status()).toBe(200);
            const carts = await response.json() as Cart[];
            const ids = carts.map((cart) => cart.id);
            expect(order === 'asc' ? isAscending(ids) : isDescending(ids)).toBeTruthy();
        });
    }

    test('POST - Create cart @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: CART_PAYLOAD });
        expect(response.status()).toBe(201);
        const cart = await response.json() as Cart;
        expect(cart.id).toEqual(expect.any(Number));
        expect(cart.userId).toBe(CART_PAYLOAD.userId);
        expect(cart.products).toEqual(CART_PAYLOAD.products);
    });

    test('PUT - Update cart @master @regression @api', async ({ request }) => {
        const updated = { ...CART_PAYLOAD, products: [{ productId: PRODUCT_ID, quantity: 5 }] };
        const response = await request.put(`${BASE_URL}${route(Routes.UPDATE_CART, { id: CART_ID })}`, { data: updated });
        expect(response.status()).toBe(200);
        const cart = await response.json() as Cart;
        expect(cart.products[0].quantity).toBe(5);
    });

    test('DELETE - Cart @master @regression @api', async ({ request }) => {
        const response = await request.delete(`${BASE_URL}${route(Routes.DELETE_CART, { id: CART_ID })}`);
        expect(response.status()).toBe(200);
        expect((await response.json()).id).toBe(CART_ID);
    });

    test('GET - Product response schema @master @regression @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_PRODUCT_BY_ID, { id: PRODUCT_ID })}`);
        expect(response.status()).toBe(200);
        await expectSchema(await response.json(), 'product_api_schema.json');
    });

    test('GET - User response schema @master @regression @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_USER_BY_ID, { id: USER_ID })}`);
        expect(response.status()).toBe(200);
        await expectSchema(await response.json(), 'user_api_schema.json');
    });

    test('GET - Cart response schema @master @regression @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${route(Routes.GET_CART_BY_ID, { id: CART_ID })}`);
        expect(response.status()).toBe(200);
        await expectSchema(await response.json(), 'cart_api_schema.json');
    });

    test.describe.serial('CRUD workflows @master @end-to-end @api', () => {
        test('Product create, update, delete workflow', async ({ request }) => {
            const create = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: PRODUCT_PAYLOAD });
            expect(create.status()).toBe(201);
            const created = await create.json() as Product;
            const productId = created.id;
            const updatedPayload = { ...PRODUCT_PAYLOAD, title: 'Workflow product update' };
            const update = await request.put(`${BASE_URL}${route(Routes.UPDATE_PRODUCT, { id: productId })}`, { data: updatedPayload });
            expect(update.status()).toBe(200);
            expect((await update.json()).title).toBe(updatedPayload.title);
            const deletion = await request.delete(`${BASE_URL}${route(Routes.DELETE_PRODUCT, { id: productId })}`);
            expect(deletion.status()).toBe(200);
        });

        test('User create, update, delete workflow', async ({ request }) => {
            const create = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: USER_PAYLOAD });
            expect(create.status()).toBe(201);
            const created = await create.json() as User;
            const userId = created.id;
            const updatedPayload = { ...USER_PAYLOAD, username: 'workflow-updated-user' };
            const update = await request.put(`${BASE_URL}${route(Routes.UPDATE_USER, { id: userId })}`, { data: updatedPayload });
            expect(update.status()).toBe(200);
            expect((await update.json()).username).toBe(updatedPayload.username);
            const deletion = await request.delete(`${BASE_URL}${route(Routes.DELETE_USER, { id: userId })}`);
            expect(deletion.status()).toBe(200);
        });

        test('Cart create, update, delete workflow', async ({ request }) => {
            const create = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: CART_PAYLOAD });
            expect(create.status()).toBe(201);
            const created = await create.json() as Cart;
            const cartId = created.id;
            expect(created.userId).toBe(CART_PAYLOAD.userId);
            const updatedPayload = { ...CART_PAYLOAD, products: [{ productId: PRODUCT_ID, quantity: 7 }] };
            const update = await request.put(`${BASE_URL}${route(Routes.UPDATE_CART, { id: cartId })}`, { data: updatedPayload });
            expect(update.status()).toBe(200);
            expect((await update.json()).products[0].quantity).toBe(7);
            const deletion = await request.delete(`${BASE_URL}${route(Routes.DELETE_CART, { id: cartId })}`);
            expect(deletion.status()).toBe(200);
        });
    });
});