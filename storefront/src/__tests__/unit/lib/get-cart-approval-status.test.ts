/**
 * @jest-environment node
 */

import { getCartApprovalStatus } from '@/lib/util/get-cart-approval-status';
import { ApprovalStatusType, ApprovalType, QueryApproval } from '@/types/approval';

describe('getCartApprovalStatus', () => {
    const createApproval = (
        type: ApprovalType,
        status: ApprovalStatusType
    ): QueryApproval => ({
        id: `approval-${type}-${status}`,
        cart_id: 'cart-1',
        type,
        status,
        created_by: 'user-1',
        handled_by: 'handler-1',
    } as QueryApproval);

    it('should return default status when cart is null', () => {
        const result = getCartApprovalStatus(null);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: false,
            isCompleted: false,
        });
    });

    it('should return default status when cart has no approvals', () => {
        const cart = { id: 'cart-1', approvals: [] };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: false,
            isCompleted: false,
        });
    });

    it('should return default status when approvals is undefined', () => {
        const cart = { id: 'cart-1' };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: false,
            isCompleted: false,
        });
    });

    it('should return isCompleted true when cart has completed_at', () => {
        const cart = {
            id: 'cart-1',
            completed_at: '2024-03-15T10:00:00.000Z',
            approvals: [createApproval(ApprovalType.ADMIN, ApprovalStatusType.APPROVED)],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: false,
            isCompleted: true,
        });
    });

    it('should return isPendingAdminApproval when admin approval is pending', () => {
        const cart = {
            id: 'cart-1',
            approvals: [createApproval(ApprovalType.ADMIN, ApprovalStatusType.PENDING)],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: true,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: false,
            isCompleted: false,
        });
    });

    it('should return isPendingSalesManagerApproval when sales manager approval is pending', () => {
        const cart = {
            id: 'cart-1',
            approvals: [
                createApproval(ApprovalType.SALES_MANAGER, ApprovalStatusType.PENDING),
            ],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: true,
            isFullyApproved: false,
            isRejected: false,
            isCompleted: false,
        });
    });

    it('should prioritize admin approval over sales manager approval', () => {
        const cart = {
            id: 'cart-1',
            approvals: [
                createApproval(ApprovalType.ADMIN, ApprovalStatusType.PENDING),
                createApproval(ApprovalType.SALES_MANAGER, ApprovalStatusType.PENDING),
            ],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: true,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: false,
            isCompleted: false,
        });
    });

    it('should return isRejected when any approval is rejected', () => {
        const cart = {
            id: 'cart-1',
            approvals: [createApproval(ApprovalType.ADMIN, ApprovalStatusType.REJECTED)],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: true,
            isCompleted: false,
        });
    });

    it('should prioritize rejected over pending sales manager approval', () => {
        const cart = {
            id: 'cart-1',
            approvals: [
                createApproval(ApprovalType.ADMIN, ApprovalStatusType.REJECTED),
                createApproval(ApprovalType.SALES_MANAGER, ApprovalStatusType.PENDING),
            ],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: true,
            isCompleted: false,
        });
    });

    it('should return isFullyApproved when all approvals are approved', () => {
        const cart = {
            id: 'cart-1',
            approvals: [
                createApproval(ApprovalType.ADMIN, ApprovalStatusType.APPROVED),
                createApproval(ApprovalType.SALES_MANAGER, ApprovalStatusType.APPROVED),
            ],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: true,
            isRejected: false,
            isCompleted: false,
        });
    });

    it('should return isFullyApproved for single approved approval', () => {
        const cart = {
            id: 'cart-1',
            approvals: [createApproval(ApprovalType.ADMIN, ApprovalStatusType.APPROVED)],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: true,
            isRejected: false,
            isCompleted: false,
        });
    });

    it('should return default status for mixed approved and pending (not all approved)', () => {
        const cart = {
            id: 'cart-1',
            approvals: [
                createApproval(ApprovalType.ADMIN, ApprovalStatusType.APPROVED),
                createApproval(ApprovalType.SALES_MANAGER, ApprovalStatusType.PENDING),
            ],
        };
        const result = getCartApprovalStatus(cart);

        // Admin approval is approved, but sales manager is pending
        // Since admin is not pending, it checks sales manager
        // Sales manager is pending, so isPendingSalesManagerApproval should be true
        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: true,
            isFullyApproved: false,
            isRejected: false,
            isCompleted: false,
        });
    });

    it('should handle multiple rejected approvals', () => {
        const cart = {
            id: 'cart-1',
            approvals: [
                createApproval(ApprovalType.ADMIN, ApprovalStatusType.REJECTED),
                createApproval(ApprovalType.SALES_MANAGER, ApprovalStatusType.REJECTED),
            ],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: true,
            isCompleted: false,
        });
    });

    it('should handle cart with completed_at even if approvals are rejected', () => {
        const cart = {
            id: 'cart-1',
            completed_at: '2024-03-15T10:00:00.000Z',
            approvals: [createApproval(ApprovalType.ADMIN, ApprovalStatusType.REJECTED)],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: false,
            isRejected: false,
            isCompleted: true,
        });
    });

    it('should handle empty completed_at as falsy', () => {
        const cart = {
            id: 'cart-1',
            completed_at: null,
            approvals: [createApproval(ApprovalType.ADMIN, ApprovalStatusType.APPROVED)],
        };
        const result = getCartApprovalStatus(cart);

        expect(result).toEqual({
            isPendingAdminApproval: false,
            isPendingSalesManagerApproval: false,
            isFullyApproved: true,
            isRejected: false,
            isCompleted: false,
        });
    });
});
