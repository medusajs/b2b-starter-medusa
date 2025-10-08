/**
 * @jest-environment node
 */

import {
    checkSpendingLimit,
    getSpendWindow,
    getOrderTotalInSpendWindow,
} from '@/lib/util/check-spending-limit';
import {
    ModuleCompanySpendingLimitResetFrequency,
    QueryCompany,
    B2BCart,
    B2BCustomer,
} from '@/types';
import { HttpTypes } from '@medusajs/types';

describe('check-spending-limit', () => {
    describe('getSpendWindow', () => {
        const mockCompany = (frequency: ModuleCompanySpendingLimitResetFrequency): QueryCompany => ({
            id: 'company-1',
            name: 'Test Company',
            spending_limit_reset_frequency: frequency,
        } as QueryCompany);

        beforeEach(() => {
            // Mock date to 2024-03-15 15:30:00 (Friday)
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-03-15T15:30:00.000Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should return window from epoch for NEVER frequency', () => {
            const company = mockCompany(ModuleCompanySpendingLimitResetFrequency.NEVER);
            const { start, end } = getSpendWindow(company);

            expect(start.getTime()).toBe(new Date(0).getTime());
            expect(end.getTime()).toBe(new Date('2024-03-15T15:30:00.000Z').getTime());
        });

        it('should return current day window for DAILY frequency', () => {
            const company = mockCompany(ModuleCompanySpendingLimitResetFrequency.DAILY);
            const { start, end } = getSpendWindow(company);

            expect(start.toISOString()).toContain('T00:00:00.000Z');
            expect(end.getTime()).toBe(new Date('2024-03-15T15:30:00.000Z').getTime());
        });

        it('should return current week window for WEEKLY frequency (starting Sunday)', () => {
            const company = mockCompany(ModuleCompanySpendingLimitResetFrequency.WEEKLY);
            const { start, end } = getSpendWindow(company);

            // March 15, 2024 is Friday, so week starts on March 10 (Sunday)
            expect(start.getUTCDate()).toBe(10);
            expect(start.getUTCHours()).toBe(0);
            expect(start.getUTCMinutes()).toBe(0);
            expect(end.getTime()).toBe(new Date('2024-03-15T15:30:00.000Z').getTime());
        });

        it('should return current month window for MONTHLY frequency', () => {
            const company = mockCompany(ModuleCompanySpendingLimitResetFrequency.MONTHLY);
            const { start, end } = getSpendWindow(company);

            expect(start.getFullYear()).toBe(2024);
            expect(start.getMonth()).toBe(2); // March (0-indexed)
            expect(start.getDate()).toBe(1);
            expect(end.getTime()).toBe(new Date('2024-03-15T15:30:00.000Z').getTime());
        });

        it('should return current year window for YEARLY frequency', () => {
            const company = mockCompany(ModuleCompanySpendingLimitResetFrequency.YEARLY);
            const { start, end } = getSpendWindow(company);

            expect(start.getFullYear()).toBe(2024);
            expect(start.getMonth()).toBe(0); // January
            expect(start.getDate()).toBe(1);
            expect(end.getTime()).toBe(new Date('2024-03-15T15:30:00.000Z').getTime());
        });

        it('should default to NEVER for unknown frequency', () => {
            const company = mockCompany('UNKNOWN' as any);
            const { start, end } = getSpendWindow(company);

            expect(start.getTime()).toBe(new Date(0).getTime());
            expect(end.getTime()).toBe(new Date('2024-03-15T15:30:00.000Z').getTime());
        });
    });

    describe('getOrderTotalInSpendWindow', () => {
        const mockOrder = (createdAt: string, total: number): HttpTypes.StoreOrder => ({
            id: `order-${createdAt}`,
            created_at: createdAt,
            total,
        } as HttpTypes.StoreOrder);

        it('should sum orders within the spend window', () => {
            const orders = [
                mockOrder('2024-03-10T10:00:00.000Z', 1000),
                mockOrder('2024-03-12T10:00:00.000Z', 2000),
                mockOrder('2024-03-14T10:00:00.000Z', 1500),
            ];

            const spendWindow = {
                start: new Date('2024-03-10T00:00:00.000Z'),
                end: new Date('2024-03-15T00:00:00.000Z'),
            };

            const total = getOrderTotalInSpendWindow(orders, spendWindow);
            expect(total).toBe(4500);
        });

        it('should exclude orders before the window start', () => {
            const orders = [
                mockOrder('2024-03-05T10:00:00.000Z', 1000),
                mockOrder('2024-03-12T10:00:00.000Z', 2000),
            ];

            const spendWindow = {
                start: new Date('2024-03-10T00:00:00.000Z'),
                end: new Date('2024-03-15T00:00:00.000Z'),
            };

            const total = getOrderTotalInSpendWindow(orders, spendWindow);
            expect(total).toBe(2000);
        });

        it('should exclude orders after the window end', () => {
            const orders = [
                mockOrder('2024-03-12T10:00:00.000Z', 2000),
                mockOrder('2024-03-20T10:00:00.000Z', 1000),
            ];

            const spendWindow = {
                start: new Date('2024-03-10T00:00:00.000Z'),
                end: new Date('2024-03-15T00:00:00.000Z'),
            };

            const total = getOrderTotalInSpendWindow(orders, spendWindow);
            expect(total).toBe(2000);
        });

        it('should include orders exactly at window boundaries', () => {
            const orders = [
                mockOrder('2024-03-10T00:00:00.000Z', 1000),
                mockOrder('2024-03-15T00:00:00.000Z', 1500),
            ];

            const spendWindow = {
                start: new Date('2024-03-10T00:00:00.000Z'),
                end: new Date('2024-03-15T00:00:00.000Z'),
            };

            const total = getOrderTotalInSpendWindow(orders, spendWindow);
            expect(total).toBe(2500);
        });

        it('should return 0 for empty orders array', () => {
            const spendWindow = {
                start: new Date('2024-03-10T00:00:00.000Z'),
                end: new Date('2024-03-15T00:00:00.000Z'),
            };

            const total = getOrderTotalInSpendWindow([], spendWindow);
            expect(total).toBe(0);
        });

        it('should return 0 when no orders match the window', () => {
            const orders = [
                mockOrder('2024-03-05T10:00:00.000Z', 1000),
                mockOrder('2024-03-20T10:00:00.000Z', 2000),
            ];

            const spendWindow = {
                start: new Date('2024-03-10T00:00:00.000Z'),
                end: new Date('2024-03-15T00:00:00.000Z'),
            };

            const total = getOrderTotalInSpendWindow(orders, spendWindow);
            expect(total).toBe(0);
        });
    });

    describe('checkSpendingLimit', () => {
        const mockCart = (total: number): B2BCart => ({
            id: 'cart-1',
            total,
        } as B2BCart);

        const mockCustomer = (
            spendingLimit: number | null,
            orders: HttpTypes.StoreOrder[] = [],
            resetFrequency: ModuleCompanySpendingLimitResetFrequency = ModuleCompanySpendingLimitResetFrequency.MONTHLY
        ): B2BCustomer => ({
            id: 'customer-1',
            employee: {
                id: 'employee-1',
                spending_limit: spendingLimit,
                company: {
                    id: 'company-1',
                    name: 'Test Company',
                    spending_limit_reset_frequency: resetFrequency,
                } as QueryCompany,
            },
            orders,
        } as B2BCustomer);

        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-03-15T15:30:00.000Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should return false when cart is null', () => {
            const customer = mockCustomer(10000);
            expect(checkSpendingLimit(null, customer)).toBe(false);
        });

        it('should return false when customer is null', () => {
            const cart = mockCart(1000);
            expect(checkSpendingLimit(cart, null)).toBe(false);
        });

        it('should return false when customer has no employee', () => {
            const cart = mockCart(1000);
            const customer = { id: 'customer-1', employee: null } as B2BCustomer;
            expect(checkSpendingLimit(cart, customer)).toBe(false);
        });

        it('should return false when spending limit is null', () => {
            const cart = mockCart(1000);
            const customer = mockCustomer(null);
            expect(checkSpendingLimit(cart, customer)).toBe(false);
        });

        it('should return false when spending limit is 0', () => {
            const cart = mockCart(1000);
            const customer = mockCustomer(0);
            expect(checkSpendingLimit(cart, customer)).toBe(false);
        });

        it('should return false when cart total is within spending limit', () => {
            const cart = mockCart(3000);
            const customer = mockCustomer(10000);
            expect(checkSpendingLimit(cart, customer)).toBe(false);
        });

        it('should return true when cart total exceeds spending limit', () => {
            const cart = mockCart(12000);
            const customer = mockCustomer(10000);
            expect(checkSpendingLimit(cart, customer)).toBe(true);
        });

        it('should return true when cart + previous orders exceed spending limit', () => {
            const cart = mockCart(3000);
            const orders: HttpTypes.StoreOrder[] = [
                {
                    id: 'order-1',
                    created_at: '2024-03-10T10:00:00.000Z',
                    total: 8000,
                } as HttpTypes.StoreOrder,
            ];

            const customer = mockCustomer(10000, orders);
            expect(checkSpendingLimit(cart, customer)).toBe(true);
        });

        it('should only count orders within the current spending window', () => {
            const cart = mockCart(3000);
            const orders: HttpTypes.StoreOrder[] = [
                {
                    id: 'order-1',
                    created_at: '2024-02-15T10:00:00.000Z', // Last month
                    total: 8000,
                } as HttpTypes.StoreOrder,
                {
                    id: 'order-2',
                    created_at: '2024-03-10T10:00:00.000Z', // This month
                    total: 2000,
                } as HttpTypes.StoreOrder,
            ];

            const customer = mockCustomer(
                10000,
                orders,
                ModuleCompanySpendingLimitResetFrequency.MONTHLY
            );

            // Only order-2 (2000) + cart (3000) = 5000, which is < 10000
            expect(checkSpendingLimit(cart, customer)).toBe(false);
        });

        it('should return false when cart + orders exactly equal the spending limit', () => {
            const cart = mockCart(3000);
            const orders: HttpTypes.StoreOrder[] = [
                {
                    id: 'order-1',
                    created_at: '2024-03-10T10:00:00.000Z',
                    total: 7000,
                } as HttpTypes.StoreOrder,
            ];

            const customer = mockCustomer(10000, orders);
            expect(checkSpendingLimit(cart, customer)).toBe(false);
        });

        it('should return true when cart + orders exceed limit by 1', () => {
            const cart = mockCart(3001);
            const orders: HttpTypes.StoreOrder[] = [
                {
                    id: 'order-1',
                    created_at: '2024-03-10T10:00:00.000Z',
                    total: 7000,
                } as HttpTypes.StoreOrder,
            ];

            const customer = mockCustomer(10000, orders);
            expect(checkSpendingLimit(cart, customer)).toBe(true);
        });

        it('should handle DAILY spending limit reset', () => {
            const cart = mockCart(3000);
            const orders: HttpTypes.StoreOrder[] = [
                {
                    id: 'order-1',
                    created_at: '2024-03-14T10:00:00.000Z', // Yesterday
                    total: 8000,
                } as HttpTypes.StoreOrder,
                {
                    id: 'order-2',
                    created_at: '2024-03-15T10:00:00.000Z', // Today
                    total: 2000,
                } as HttpTypes.StoreOrder,
            ];

            const customer = mockCustomer(
                10000,
                orders,
                ModuleCompanySpendingLimitResetFrequency.DAILY
            );

            // Only order-2 (2000) + cart (3000) = 5000, which is < 10000
            expect(checkSpendingLimit(cart, customer)).toBe(false);
        });

        it('should handle WEEKLY spending limit reset', () => {
            const cart = mockCart(3000);
            const orders: HttpTypes.StoreOrder[] = [
                {
                    id: 'order-1',
                    created_at: '2024-03-05T10:00:00.000Z', // Last week
                    total: 8000,
                } as HttpTypes.StoreOrder,
                {
                    id: 'order-2',
                    created_at: '2024-03-12T10:00:00.000Z', // This week
                    total: 2000,
                } as HttpTypes.StoreOrder,
            ];

            const customer = mockCustomer(
                10000,
                orders,
                ModuleCompanySpendingLimitResetFrequency.WEEKLY
            );

            // Only order-2 (2000) + cart (3000) = 5000, which is < 10000
            expect(checkSpendingLimit(cart, customer)).toBe(false);
        });

        it('should handle YEARLY spending limit reset', () => {
            const cart = mockCart(3000);
            const orders: HttpTypes.StoreOrder[] = [
                {
                    id: 'order-1',
                    created_at: '2023-12-15T10:00:00.000Z', // Last year
                    total: 8000,
                } as HttpTypes.StoreOrder,
                {
                    id: 'order-2',
                    created_at: '2024-01-10T10:00:00.000Z', // This year
                    total: 2000,
                } as HttpTypes.StoreOrder,
            ];

            const customer = mockCustomer(
                10000,
                orders,
                ModuleCompanySpendingLimitResetFrequency.YEARLY
            );

            // Only order-2 (2000) + cart (3000) = 5000, which is < 10000
            expect(checkSpendingLimit(cart, customer)).toBe(false);
        });

        it('should handle NEVER spending limit reset (all orders count)', () => {
            const cart = mockCart(3000);
            const orders: HttpTypes.StoreOrder[] = [
                {
                    id: 'order-1',
                    created_at: '2020-01-15T10:00:00.000Z', // Years ago
                    total: 5000,
                } as HttpTypes.StoreOrder,
                {
                    id: 'order-2',
                    created_at: '2024-03-10T10:00:00.000Z', // Recent
                    total: 3000,
                } as HttpTypes.StoreOrder,
            ];

            const customer = mockCustomer(
                10000,
                orders,
                ModuleCompanySpendingLimitResetFrequency.NEVER
            );

            // All orders (5000 + 3000) + cart (3000) = 11000 > 10000
            expect(checkSpendingLimit(cart, customer)).toBe(true);
        });
    });
});
