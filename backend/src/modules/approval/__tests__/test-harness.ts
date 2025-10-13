/**
 * Test Harness for Approval Module
 * Provides mock manager/repository for unit tests
 */

export function createMockApprovalRepository() {
  return {
    listApprovalRules_: jest.fn(),
    listAndCountApprovals_: jest.fn(),
    createApprovalHistories_: jest.fn(),
    retrieveApproval_: jest.fn(),
    listApprovalSettingses_: jest.fn(),
    createApprovals_: jest.fn(),
    updateApprovals_: jest.fn(),
  };
}

export function injectMocksIntoService(service: any, mocks: any) {
  // Attach raw mock props for direct calls
  Object.keys(mocks).forEach((key) => {
    service[key] = mocks[key];
  });

  // Bridge high-level MedusaService methods to mocks to avoid InjectManager context
  // List methods
  if (mocks.listApprovalRules_) {
    const impl = (...args: any[]) => mocks.listApprovalRules_(...args);
    try { Object.defineProperty(Object.getPrototypeOf(service), 'listApprovalRules', { value: impl }); } catch {}
  }
  if (mocks.listAndCountApprovals_) {
    const impl = (...args: any[]) => mocks.listAndCountApprovals_(...args);
    try { Object.defineProperty(Object.getPrototypeOf(service), 'listAndCountApprovals', { value: impl }); } catch {}
  }
  if (mocks.listApprovals_) {
    const impl = (...args: any[]) => mocks.listApprovals_(...args);
    try { Object.defineProperty(Object.getPrototypeOf(service), 'listApprovals', { value: impl }); } catch {}
  }
  if (mocks.listApprovalSettingses_) {
    const impl = (...args: any[]) => mocks.listApprovalSettingses_(...args);
    try { Object.defineProperty(Object.getPrototypeOf(service), 'listApprovalSettingses', { value: impl }); } catch {}
  }

  // Retrieve/Create/Update methods
  if (mocks.retrieveApproval_) {
    const impl = (...args: any[]) => mocks.retrieveApproval_(...args);
    try { Object.defineProperty(Object.getPrototypeOf(service), 'retrieveApproval', { value: impl }); } catch {}
  }
  if (mocks.createApprovalHistories_) {
    const impl = (...args: any[]) => mocks.createApprovalHistories_(...args);
    try { Object.defineProperty(Object.getPrototypeOf(service), 'createApprovalHistories', { value: impl }); } catch {}
  }
  if (mocks.createApprovals_) {
    const impl = (...args: any[]) => mocks.createApprovals_(...args);
    try { Object.defineProperty(Object.getPrototypeOf(service), 'createApprovals', { value: impl }); } catch {}
  }
  if (mocks.updateApprovals_) {
    const impl = (...args: any[]) => mocks.updateApprovals_(...args);
    try { Object.defineProperty(Object.getPrototypeOf(service), 'updateApprovals', { value: impl }); } catch {}
  }
}
