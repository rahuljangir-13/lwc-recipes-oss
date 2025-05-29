import * as utils from 'c/utils';
import { isOnline } from 'c/utils';

// Mock data for contacts
const mockContacts = [
    {
        id: '1',
        accountId: '1',
        firstName: 'John',
        lastName: 'Smith',
        title: 'CEO',
        email: 'john.smith@globalmedia.com',
        phone: '(415) 555-1234',
        department: 'Executive',
        createdDate: '2023-01-12T10:30:00.000Z',
        lastModifiedDate: '2023-01-16T09:15:00.000Z'
    },
    {
        id: '2',
        accountId: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        title: 'CTO',
        email: 'sarah.johnson@globalmedia.com',
        phone: '(415) 555-5678',
        department: 'Technology',
        createdDate: '2023-01-14T11:20:00.000Z',
        lastModifiedDate: '2023-01-18T14:30:00.000Z'
    },
    {
        id: '3',
        accountId: '2',
        firstName: 'Mike',
        lastName: 'Wilson',
        title: 'VP Sales',
        email: 'mike.wilson@acme.com',
        phone: '(212) 555-7890',
        department: 'Sales',
        createdDate: '2023-02-07T13:45:00.000Z',
        lastModifiedDate: '2023-02-12T16:20:00.000Z'
    },
    {
        id: '4',
        accountId: '3',
        firstName: 'Lisa',
        lastName: 'Brown',
        title: 'Director',
        email: 'lisa.brown@universalservices.com',
        phone: '(650) 555-4321',
        department: 'Consulting',
        createdDate: '2023-03-18T10:10:00.000Z',
        lastModifiedDate: '2023-03-22T11:30:00.000Z'
    }
];

// In-memory store for contacts
let contacts = [...mockContacts];

// Utility function to generate unique IDs
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

// Initialize the local storage with mock data if empty
export function initializeOfflineStorage() {
    return utils.getAll(utils.STORE_NAMES.CONTACTS).then((storedContacts) => {
        if (!storedContacts || storedContacts.length === 0) {
            return utils.saveItems(utils.STORE_NAMES.CONTACTS, mockContacts);
        }
        return storedContacts;
    });
}

// Get all contacts
export function getContacts() {
    if (isOnline()) {
        // Online: get from server and update local storage
        return Promise.resolve([...contacts]).then((result) => {
            utils.saveItems(utils.STORE_NAMES.CONTACTS, result);
            return result;
        });
    } else {
        // Offline: get from local storage
        return utils.getAll(utils.STORE_NAMES.CONTACTS);
    }
}

// Get contact by ID
export function getContact(id) {
    if (isOnline()) {
        // Online: get from server
        const foundContact = contacts.find((contact) => contact.id === id);
        if (foundContact) {
            return Promise.resolve({ ...foundContact });
        }
        return Promise.reject(new Error(`Contact with id ${id} not found`));
    } else {
        // Offline: get from local storage
        return utils.getById(utils.STORE_NAMES.CONTACTS, id);
    }
}

// Get contacts by Account ID
export function getContactsByAccountId(accountId) {
    if (isOnline()) {
        // Online: get from server
        const filteredContacts = contacts.filter(
            (contact) => contact.accountId === accountId
        );
        return Promise.resolve([...filteredContacts]);
    } else {
        // Offline: get from local storage and filter
        return utils.getAll(utils.STORE_NAMES.CONTACTS).then((allContacts) => {
            return allContacts.filter(
                (contact) => contact.accountId === accountId
            );
        });
    }
}

// Create a new contact
export function createContact(contactData) {
    const newContact = {
        ...contactData,
        id: generateId(),
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
    };

    if (isOnline()) {
        // Online: create on server and update local storage
        contacts.push(newContact);
        return Promise.resolve({ ...newContact }).then((result) => {
            utils.saveItem(utils.STORE_NAMES.CONTACTS, result);
            return result;
        });
    } else {
        // Offline: save to local storage and queue for sync
        return utils
            .saveItem(utils.STORE_NAMES.CONTACTS, newContact)
            .then((result) => {
                // Add to pending operations queue
                return utils
                    .addPendingOperation({
                        type: 'CREATE_CONTACT',
                        data: result
                    })
                    .then(() => result);
            });
    }
}

// Update an existing contact
export function updateContact(contactData) {
    if (isOnline()) {
        // Online: update on server
        const index = contacts.findIndex(
            (contact) => contact.id === contactData.id
        );
        if (index !== -1) {
            const updatedContact = {
                ...contacts[index],
                ...contactData,
                lastModifiedDate: new Date().toISOString()
            };
            contacts[index] = updatedContact;

            // Also update in local storage
            return Promise.resolve({ ...updatedContact }).then((result) => {
                utils.saveItem(utils.STORE_NAMES.CONTACTS, result);
                return result;
            });
        }
        return Promise.reject(
            new Error(`Contact with id ${contactData.id} not found`)
        );
    } else {
        // Offline: update in local storage and queue for sync
        return utils
            .getById(utils.STORE_NAMES.CONTACTS, contactData.id)
            .then((existingContact) => {
                const updatedContact = {
                    ...existingContact,
                    ...contactData,
                    lastModifiedDate: new Date().toISOString()
                };

                return utils
                    .saveItem(utils.STORE_NAMES.CONTACTS, updatedContact)
                    .then((result) => {
                        // Add to pending operations queue
                        return utils
                            .addPendingOperation({
                                type: 'UPDATE_CONTACT',
                                data: result
                            })
                            .then(() => result);
                    });
            });
    }
}

// Delete a contact
export function deleteContact(id) {
    if (isOnline()) {
        // Online: delete from server
        const index = contacts.findIndex((contact) => contact.id === id);
        if (index !== -1) {
            contacts.splice(index, 1);

            // Also delete from local storage
            return Promise.resolve({ success: true, id }).then((result) => {
                utils.deleteItem(utils.STORE_NAMES.CONTACTS, id);
                return result;
            });
        }
        return Promise.reject(new Error(`Contact with id ${id} not found`));
    } else {
        // Offline: mark as deleted in local storage and queue for sync
        return utils.getById(utils.STORE_NAMES.CONTACTS, id).then((contact) => {
            // Add to pending operations queue for later deletion
            return utils
                .addPendingOperation({
                    type: 'DELETE_CONTACT',
                    data: { id }
                })
                .then(() => {
                    // Remove from local storage
                    return utils.deleteItem(utils.STORE_NAMES.CONTACTS, id);
                });
        });
    }
}

// Sync pending contact operations when online
export function syncPendingOperations() {
    if (!isOnline()) {
        return Promise.reject(new Error('Cannot sync while offline'));
    }

    return utils.getPendingOperations().then((operations) => {
        // Filter contact operations
        const contactOps = operations.filter((op) =>
            ['CREATE_CONTACT', 'UPDATE_CONTACT', 'DELETE_CONTACT'].includes(
                op.type
            )
        );

        if (!contactOps || contactOps.length === 0) {
            return { synced: 0 };
        }

        // Sort operations by timestamp
        const sortedOps = [...contactOps].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Process each operation in sequence
        return sortedOps.reduce(
            (promise, operation) => {
                return promise.then((result) => {
                    // Process the operation based on type
                    let processPromise;

                    switch (operation.type) {
                        case 'CREATE_CONTACT':
                            // Create contact on server
                            const createData = { ...operation.data };
                            delete createData.id; // Let server assign ID
                            processPromise = createContact(createData);
                            break;

                        case 'UPDATE_CONTACT':
                            // Update contact on server
                            processPromise = updateContact(operation.data);
                            break;

                        case 'DELETE_CONTACT':
                            // Delete contact on server
                            processPromise = deleteContact(operation.data.id);
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
