import * as utils from 'c/utils';
import { isOnline } from 'c/utils';

// Placeholder for your Apex REST API endpoint for Contacts.
// IMPORTANT: Replace this with your actual Salesforce Apex REST endpoint URL.
const APEX_REST_ENDPOINT_URL =
    'https://customization-app-1405-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/lwcosscontacts';

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
        console.log('🌐 Online: Getting contacts from Apex REST API');

        // IMPORTANT: Ensure sessionId is current and valid
        const sessionId =
            '00D7z00000P3CKp!AQEAQIMyD3k_iMTZVUWMArr.hwUFwl.DprNgTqJtGSxb.x.Qa1.5SC6CMC9ciVGG_kyN1CGymuWZGeBzjo1N0tMOwGwf5a7N'; // Keep this updated - UPDATED TO MATCH CREATE FUNCTION

        if (!sessionId || sessionId === 'YOUR_SALESFORCE_SESSION_ID') {
            console.error(
                '❌ ERROR: Session ID is not set. Please ensure it is valid.'
            );
            return Promise.reject(
                new Error(
                    'Session ID not configured. Cannot fetch from Salesforce.'
                )
            );
        }

        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };

        return fetch(APEX_REST_ENDPOINT_URL, {
            method: 'GET',
            mode: 'cors',
            headers: headers
        })
            .then((response) => {
                console.log(
                    `🌐 Received response from Apex REST API: ${response}`
                );
                if (response.status === 401) {
                    console.error(
                        '❌ 401 Unauthorized: The Salesforce session ID is likely invalid or expired.'
                    );
                    throw new Error(
                        'Unauthorized: Check Salesforce session ID/access token and CORS setup.'
                    );
                }
                if (!response.ok) {
                    // Try to get more error details from response if possible
                    return response.text().then((text) => {
                        console.error(
                            `❌ HTTP error! status: ${response.status}, message: ${text}`
                        );
                        throw new Error(
                            `HTTP error! status: ${response.status}, message: ${text}`
                        );
                    });
                }
                return response.json();
            })
            .then((fetchedContacts) => {
                console.log(
                    `✅ Fetched ${fetchedContacts.length} contacts from Apex REST API`
                );
                // Update the in-memory store and local storage
                console.log('fetchedContacts', fetchedContacts);
                contacts = [...fetchedContacts]; // Update the in-memory 'contacts' variable
                console.log(
                    `💾 Saving ${fetchedContacts.length} contacts to offline storage`
                );
                // Ensure the fields match what utils.saveItems expects or adapt if necessary
                utils.saveItems(utils.STORE_NAMES.CONTACTS, fetchedContacts);
                return fetchedContacts;
            })
            .catch((error) => {
                console.error(
                    '❌ Error fetching contacts from Apex REST API:',
                    error.message
                );
                console.log(
                    '📴 Falling back to offline: Getting contacts from local storage due to API error'
                );
                return utils
                    .getAll(utils.STORE_NAMES.CONTACTS)
                    .then((contactsFromStorage) => {
                        console.log(
                            `📋 Retrieved ${contactsFromStorage.length} contacts from offline storage (fallback)`
                        );
                        if (
                            contactsFromStorage &&
                            contactsFromStorage.length > 0
                        ) {
                            contacts = [...contactsFromStorage]; // Update in-memory store with fallback data
                            return contactsFromStorage;
                        }
                        // If local storage is also empty or call failed, rethrow the original error or a new one
                        throw new Error(
                            `Failed to fetch from API and no local data available. Original error: ${error.message}`
                        );
                    });
            });
    }

    console.log('📴 Offline: Getting contacts from local storage');
    // Offline: get from local storage
    return utils
        .getAll(utils.STORE_NAMES.CONTACTS)
        .then((contactsFromStorage) => {
            console.log(
                `📋 Retrieved ${contactsFromStorage.length} contacts from offline storage`
            );
            contacts = [...contactsFromStorage]; // Update in-memory store with offline data
            return contactsFromStorage;
        });
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
    }

    // Offline: get from local storage
    return utils.getById(utils.STORE_NAMES.CONTACTS, id);
}

// Get contacts by Account ID
export function getContactsByAccountId(accountId) {
    if (isOnline()) {
        // Online: get from server
        const filteredContacts = contacts.filter(
            (contact) => contact.accountId === accountId
        );
        return Promise.resolve([...filteredContacts]);
    }

    // Offline: get from local storage and filter
    return utils.getAll(utils.STORE_NAMES.CONTACTS).then((allContacts) => {
        return allContacts.filter((contact) => contact.accountId === accountId);
    });
}

// Create a new contact
export function createContact(contactData) {
    console.log('🔄 Creating contact:', contactData);

    if (isOnline()) {
        console.log(
            '🌐 Online: Creating contact on server',
            `${contactData.firstName} ${contactData.lastName}`
        );
        // Log the detailed contactData object being sent
        console.log(
            '📦 Contact data being sent to server:',
            JSON.stringify(contactData, null, 2)
        );

        // IMPORTANT: Ensure sessionId is current and valid - Get a fresh session ID from Salesforce
        // Get this by running UserInfo.getSessionId() in Developer Console Execute Anonymous window
        const sessionId =
            '00D7z00000P3CKp!AQEAQIMyD3k_iMTZVUWMArr.hwUFwl.DprNgTqJtGSxb.x.Qa1.5SC6CMC9ciVGG_kyN1CGymuWZGeBzjo1N0tMOwGwf5a7N'; // <-- UPDATED SESSION ID

        if (!sessionId || sessionId === 'YOUR_SALESFORCE_SESSION_ID') {
            console.error(
                '❌ ERROR: Session ID is not set for createContact. Please ensure it is valid.'
            );
            // Instead of rejecting immediately, let's fall back to offline creation
            console.log(
                '📴 Falling back to offline contact creation due to missing session ID'
            );
            return createContactOffline(contactData);
        }

        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        };

        // Send the contact data for creation
        return fetch(APEX_REST_ENDPOINT_URL, {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: JSON.stringify(contactData)
        })
            .then((response) => {
                console.log(`🌐 Server response status: ${response.status}`);
                if (response.status === 401) {
                    console.error(
                        '❌ 401 Unauthorized: The Salesforce session ID is likely invalid or expired.'
                    );
                    // Instead of throwing, let's fall back to offline creation
                    console.log(
                        '📴 Falling back to offline contact creation due to authentication error'
                    );
                    return createContactOffline(contactData);
                }
                if (!response.ok) {
                    return response.text().then((text) => {
                        console.error(
                            `❌ HTTP error! status: ${response.status}, message: ${text}`
                        );
                        console.error('Full response details:', response);
                        // Instead of throwing, let's fall back to offline creation
                        console.log(
                            '📴 Falling back to offline contact creation due to server error'
                        );
                        return createContactOffline(contactData);
                    });
                }
                return response.json();
            })
            .then((createdContactFromSF) => {
                // Check if this is a contact object or undefined (from offline fallback)
                if (!createdContactFromSF || !createdContactFromSF.id) {
                    console.log(
                        '⚠️ No valid contact returned from server, using offline created contact'
                    );
                    return createContactOffline(contactData);
                }

                console.log(
                    '✅ Contact created on server:',
                    createdContactFromSF
                );
                // Add to in-memory array
                contacts.push(createdContactFromSF);
                // Save the server-confirmed contact (with SF ID) to local DB
                console.log(
                    '💾 Saving server-created contact to offline storage'
                );
                return utils
                    .saveItem(utils.STORE_NAMES.CONTACTS, createdContactFromSF)
                    .then(() => createdContactFromSF); // Return the contact from SF
            })
            .catch((error) => {
                console.error(
                    '❌ Error creating contact via Apex REST API:',
                    error.message
                );
                // Fall back to offline creation instead of rethrowing
                console.log(
                    '📴 Falling back to offline contact creation due to error:',
                    error.message
                );
                return createContactOffline(contactData);
            });
    }

    // If offline, use the offline creation function
    return createContactOffline(contactData);
}

// Helper function for offline contact creation
function createContactOffline(contactData) {
    console.log(
        '📴 Creating contact in local storage',
        `${contactData.firstName} ${contactData.lastName}`
    );

    const newContact = {
        ...contactData,
        id: generateId(),
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
    };

    return utils
        .saveItem(utils.STORE_NAMES.CONTACTS, newContact)
        .then((result) => {
            console.log('💾 Contact saved to offline storage', result);
            // Add to in-memory array
            contacts.push(result);
            // Add to pending operations queue
            console.log('📝 Adding CREATE operation to pending queue');
            return utils
                .addPendingOperation({
                    type: 'CREATE_CONTACT',
                    data: result
                })
                .then(() => {
                    console.log(
                        '✅ Contact created locally and queued for sync'
                    );
                    return result;
                });
        });
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
    }

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
    }

    // Offline: mark as deleted in local storage and queue for sync
    return utils.getById(utils.STORE_NAMES.CONTACTS, id).then(() => {
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

// Sync pending contact operations when online
export function syncPendingOperations() {
    if (!isOnline()) {
        console.log('❌ Cannot sync while offline');
        return Promise.reject(new Error('Cannot sync while offline'));
    }

    console.log('🔄 Syncing pending contact operations');
    return utils.getPendingOperations().then((operations) => {
        // Filter contact operations
        const contactOps = operations.filter((op) =>
            ['CREATE_CONTACT', 'UPDATE_CONTACT', 'DELETE_CONTACT'].includes(
                op.type
            )
        );

        if (!contactOps || contactOps.length === 0) {
            console.log('✅ No pending contact operations to sync');
            return { synced: 0, total: 0 };
        }

        console.log(`🔄 Found ${contactOps.length} pending contact operations`);

        // Sort operations by timestamp
        const sortedOps = [...contactOps].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Process each operation in sequence
        return sortedOps.reduce(
            (promise, operation) => {
                return promise.then((result) => {
                    // Skip already processed operations
                    if (operation.processed) {
                        console.log(
                            `⏭️ Skipping already processed operation ${operation.id}`
                        );
                        return result;
                    }

                    // Process the operation based on type
                    let processPromise;
                    console.log(
                        `🔄 Processing ${operation.type} operation for id: ${operation.data?.id || 'new'}`
                    );

                    switch (operation.type) {
                        case 'CREATE_CONTACT':
                            // For create operations, we need to check if it was already created
                            processPromise = new Promise((resolve) => {
                                // Check if contact already exists with this ID
                                const existingContact = contacts.find(
                                    (c) => c.id === operation.data.id
                                );
                                if (existingContact) {
                                    console.log(
                                        `⚠️ Contact already exists, treating as successful sync`
                                    );
                                    resolve(existingContact);
                                } else {
                                    // Create contact on server
                                    const createData = { ...operation.data };
                                    resolve(createContact(createData));
                                }
                            });
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

                    // Mark operation as being processed
                    operation.processing = true;

                    return processPromise
                        .then(() => {
                            console.log(
                                `✅ Successfully processed ${operation.type} for id: ${operation.data?.id || 'new'}`
                            );
                            // Remove from pending operations
                            return utils.deletePendingOperation(operation.id);
                        })
                        .then(() => {
                            // Update counts for result
                            result.synced += 1;
                            return result;
                        })
                        .catch((error) => {
                            console.error(
                                `❌ Error processing ${operation.type}:`,
                                error.message || error
                            );

                            // Increment error count but continue with next operation
                            result.errors = (result.errors || 0) + 1;
                            return result;
                        });
                });
            },
            { synced: 0, errors: 0, total: contactOps.length }
        );
    });
}
