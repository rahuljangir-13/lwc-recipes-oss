import * as utils from 'c/utils';
import { isOnline } from 'c/utils';

// Mock data for accounts
const mockAccounts = [
    {
        id: '1',
        name: 'Global Media',
        industry: 'Media',
        type: 'Customer - Direct',
        website: 'https://globalmedia.com',
        phone: '(415) 555-1212',
        description: 'Global Media is a leading media company.',
        createdDate: '2023-01-10T08:30:00.000Z',
        lastModifiedDate: '2023-01-15T14:20:00.000Z'
    },
    {
        id: '2',
        name: 'Acme Corporation',
        industry: 'Manufacturing',
        type: 'Customer - Channel',
        website: 'https://acme.com',
        phone: '(212) 555-5555',
        description: 'Acme Corporation manufactures everything.',
        createdDate: '2023-02-05T09:45:00.000Z',
        lastModifiedDate: '2023-02-10T16:30:00.000Z'
    },
    {
        id: '3',
        name: 'Universal Services',
        industry: 'Consulting',
        type: 'Customer - Direct',
        website: 'https://universalservices.com',
        phone: '(650) 555-3333',
        description:
            'Universal Services provides consulting services worldwide.',
        createdDate: '2023-03-15T11:20:00.000Z',
        lastModifiedDate: '2023-03-20T13:10:00.000Z'
    }
];

// In-memory store for accounts
let accounts = [...mockAccounts];

// Utility function to generate unique IDs
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

// Initialize the local storage with mock data if empty
export function initializeOfflineStorage() {
    return utils.getAll(utils.STORE_NAMES.ACCOUNTS).then((storedAccounts) => {
        if (!storedAccounts || storedAccounts.length === 0) {
            return utils.saveItems(utils.STORE_NAMES.ACCOUNTS, mockAccounts);
        }
        return storedAccounts;
    });
}

// Get all accounts
export function getAccounts() {
    if (isOnline()) {
        // Online: get from server and update local storage
        return Promise.resolve([...accounts]).then((result) => {
            utils.saveItems(utils.STORE_NAMES.ACCOUNTS, result);
            return result;
        });
    } else {
        // Offline: get from local storage
        return utils.getAll(utils.STORE_NAMES.ACCOUNTS);
    }
}

// Get account by ID
export function getAccount(id) {
    if (isOnline()) {
        // Online: get from server
        const foundAccount = accounts.find((acc) => acc.id === id);
        if (foundAccount) {
            return Promise.resolve({ ...foundAccount });
        }
        return Promise.reject(new Error(`Account with id ${id} not found`));
    } else {
        // Offline: get from local storage
        return utils.getById(utils.STORE_NAMES.ACCOUNTS, id);
    }
}

// Create a new account
export function createAccount(accountData) {
    const newAccount = {
        ...accountData,
        id: generateId(),
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
    };

    if (isOnline()) {
        // Online: create on server and update local storage
        accounts.push(newAccount);
        return Promise.resolve({ ...newAccount }).then((result) => {
            utils.saveItem(utils.STORE_NAMES.ACCOUNTS, result);
            return result;
        });
    } else {
        // Offline: save to local storage and queue for sync
        return utils
            .saveItem(utils.STORE_NAMES.ACCOUNTS, newAccount)
            .then((result) => {
                // Add to pending operations queue
                return utils
                    .addPendingOperation({
                        type: 'CREATE_ACCOUNT',
                        data: result
                    })
                    .then(() => result);
            });
    }
}

// Update an existing account
export function updateAccount(accountData) {
    if (isOnline()) {
        // Online: update on server
        const index = accounts.findIndex((acc) => acc.id === accountData.id);
        if (index !== -1) {
            const updatedAccount = {
                ...accounts[index],
                ...accountData,
                lastModifiedDate: new Date().toISOString()
            };
            accounts[index] = updatedAccount;

            // Also update in local storage
            return Promise.resolve({ ...updatedAccount }).then((result) => {
                utils.saveItem(utils.STORE_NAMES.ACCOUNTS, result);
                return result;
            });
        }
        return Promise.reject(
            new Error(`Account with id ${accountData.id} not found`)
        );
    } else {
        // Offline: update in local storage and queue for sync
        return utils
            .getById(utils.STORE_NAMES.ACCOUNTS, accountData.id)
            .then((existingAccount) => {
                const updatedAccount = {
                    ...existingAccount,
                    ...accountData,
                    lastModifiedDate: new Date().toISOString()
                };

                return utils
                    .saveItem(utils.STORE_NAMES.ACCOUNTS, updatedAccount)
                    .then((result) => {
                        // Add to pending operations queue
                        return utils
                            .addPendingOperation({
                                type: 'UPDATE_ACCOUNT',
                                data: result
                            })
                            .then(() => result);
                    });
            });
    }
}

// Delete an account
export function deleteAccount(id) {
    if (isOnline()) {
        // Online: delete from server
        const index = accounts.findIndex((acc) => acc.id === id);
        if (index !== -1) {
            accounts.splice(index, 1);

            // Also delete from local storage
            return Promise.resolve({ success: true, id }).then((result) => {
                utils.deleteItem(utils.STORE_NAMES.ACCOUNTS, id);
                return result;
            });
        }
        return Promise.reject(new Error(`Account with id ${id} not found`));
    } else {
        // Offline: mark as deleted in local storage and queue for sync
        return utils.getById(utils.STORE_NAMES.ACCOUNTS, id).then((account) => {
            // Add to pending operations queue for later deletion
            return utils
                .addPendingOperation({
                    type: 'DELETE_ACCOUNT',
                    data: { id }
                })
                .then(() => {
                    // Remove from local storage
                    return utils.deleteItem(utils.STORE_NAMES.ACCOUNTS, id);
                });
        });
    }
}

// Sync pending operations when online
export function syncPendingOperations() {
    if (!isOnline()) {
        return Promise.reject(new Error('Cannot sync while offline'));
    }

    return utils.getPendingOperations().then((operations) => {
        // Filter account operations
        const accountOps = operations.filter((op) =>
            ['CREATE_ACCOUNT', 'UPDATE_ACCOUNT', 'DELETE_ACCOUNT'].includes(
                op.type
            )
        );

        if (!accountOps || accountOps.length === 0) {
            return { synced: 0 };
        }

        // Sort operations by timestamp
        const sortedOps = [...accountOps].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Process each operation in sequence
        return sortedOps.reduce(
            (promise, operation) => {
                return promise.then((result) => {
                    // Process the operation based on type
                    let processPromise;

                    switch (operation.type) {
                        case 'CREATE_ACCOUNT':
                            // Create account on server
                            const createData = { ...operation.data };
                            delete createData.id; // Let server assign ID
                            processPromise = createAccount(createData);
                            break;

                        case 'UPDATE_ACCOUNT':
                            // Update account on server
                            processPromise = updateAccount(operation.data);
                            break;

                        case 'DELETE_ACCOUNT':
                            // Delete account on server
                            processPromise = deleteAccount(operation.data.id);
                            break;

                        default:
                            processPromise = Promise.resolve();
                    }

                    return processPromise
                        .then(() => {
                            // Remove from pending operations
                            return utils.deletePendingOperation(operation.id);
                        })
                        .catch((error) => {
                            console.error(
                                'Error processing operation:',
                                operation,
                                error
                            );
                            // Continue with next operation
                        })
                        .then(() => {
                            // Increment counter
                            return {
                                synced: result.synced + 1,
                                total: sortedOps.length
                            };
                        });
                });
            },
            Promise.resolve({ synced: 0, total: sortedOps.length })
        );
    });
}
