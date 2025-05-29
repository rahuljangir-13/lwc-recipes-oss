import { LightningElement, track } from 'lwc';
import * as accountService from 'c/accountService';
import * as contactService from 'c/contactService';

export default class App extends LightningElement {
    @track currentView = 'accounts'; // Default view
    @track syncingAccounts = false;
    @track syncingContacts = false;
    @track contentClass = 'slds-m-around_medium';

    connectedCallback() {
        // Initialize offline storage with mock data
        this.initializeOfflineStorage();

        // Listen for service worker sync events
        this.addEventListener(
            'sync-pending-operations',
            this.handleSyncOperations
        );

        // Listen for connectivity status changes
        this.addEventListener('sync-needed', this.handleSyncNeeded);
    }

    disconnectedCallback() {
        this.removeEventListener(
            'sync-pending-operations',
            this.handleSyncOperations
        );
        this.removeEventListener('sync-needed', this.handleSyncNeeded);
    }

    // Initialize offline storage with mock data if empty
    initializeOfflineStorage() {
        Promise.all([
            accountService.initializeOfflineStorage(),
            contactService.initializeOfflineStorage()
        ]).catch((error) => {
            console.error('Error initializing offline storage:', error);
        });
    }

    // Handle sync operations when coming back online
    handleSyncOperations() {
        // Get connectivity status component
        const connectivityStatus = this.template.querySelector(
            'c-connectivity-status'
        );

        if (connectivityStatus) {
            connectivityStatus.handleSyncStart();
        }

        // Sync accounts and contacts
        this.syncingAccounts = true;
        this.syncingContacts = true;

        // Start both sync operations in parallel
        Promise.all([
            accountService.syncPendingOperations().then((result) => {
                this.syncingAccounts = false;
                return result;
            }),
            contactService.syncPendingOperations().then((result) => {
                this.syncingContacts = false;
                return result;
            })
        ])
            .then(([accountResult, contactResult]) => {
                // Calculate total synced operations
                const synced =
                    (accountResult.synced || 0) + (contactResult.synced || 0);
                const total =
                    (accountResult.total || 0) + (contactResult.total || 0);

                // Notify user of sync completion
                if (connectivityStatus) {
                    connectivityStatus.handleSyncComplete({
                        detail: { synced, total }
                    });
                }

                // Refresh UI if needed
                if (synced > 0) {
                    this.refreshCurrentView();
                }
            })
            .catch((error) => {
                console.error('Error syncing pending operations:', error);

                // Notify user of sync error
                if (connectivityStatus) {
                    connectivityStatus.handleSyncError({
                        detail: { message: error.message || 'Unknown error' }
                    });
                }

                this.syncingAccounts = false;
                this.syncingContacts = false;
            });
    }

    // Handle sync needed event
    handleSyncNeeded() {
        this.handleSyncOperations();
    }

    // Refresh the current view after syncing
    refreshCurrentView() {
        const currentViewComponent = this.isAccountView
            ? this.template.querySelector('c-account-manager')
            : this.template.querySelector('c-contact-manager');

        if (currentViewComponent) {
            if (this.isAccountView) {
                currentViewComponent.loadAccounts();
            } else {
                currentViewComponent.loadContacts();
            }
        }
    }

    // Handle tab selection
    handleTabSelect(event) {
        const tabId = event.currentTarget.id;

        if (tabId === 'accounts-tab') {
            this.currentView = 'accounts';
        } else if (tabId === 'contacts-tab') {
            this.currentView = 'contacts';
        }
    }

    // Handle new contact creation from account view
    handleNewContact(event) {
        this.currentView = 'contacts';

        // Allow the DOM to update
        setTimeout(() => {
            const contactManager =
                this.template.querySelector('c-contact-manager');
            if (contactManager) {
                contactManager.createContactForAccount(event.detail.accountId);
            }
        }, 0);
    }

    // Handle contact edit from account view
    handleEditContact(event) {
        this.currentView = 'contacts';

        // Allow the DOM to update
        setTimeout(() => {
            const contactManager =
                this.template.querySelector('c-contact-manager');
            if (contactManager) {
                contactManager.editContact(event.detail.contactId);
            }
        }, 0);
    }

    // Handle view accounts
    handleViewAccounts() {
        this.currentView = 'accounts';
    }

    // Handle view contacts
    handleViewContacts() {
        this.currentView = 'contacts';
    }

    // Handle edit success notifications from child components
    handleEditSuccess(event) {
        // Get connectivity status component
        const connectivityStatus = this.template.querySelector(
            'c-connectivity-status'
        );

        if (connectivityStatus) {
            // Show a success toast
            connectivityStatus.handleSyncComplete({
                detail: {
                    synced: 1,
                    total: 1
                }
            });
        }
    }

    // Computed properties for conditional rendering
    get isAccountView() {
        return this.currentView === 'accounts';
    }

    get isContactView() {
        return this.currentView === 'contacts';
    }

    // Computed classes for tabs
    get accountsTabClass() {
        return `slds-tabs_default__item ${this.isAccountView ? 'slds-is-active' : ''}`;
    }

    get contactsTabClass() {
        return `slds-tabs_default__item ${this.isContactView ? 'slds-is-active' : ''}`;
    }

    // Computed properties for tab focus
    get accountsTabIndex() {
        return this.isAccountView ? 0 : -1;
    }

    get contactsTabIndex() {
        return this.isContactView ? 0 : -1;
    }

    // Dynamic header content
    get currentViewTitle() {
        return this.currentView === 'accounts' ? 'Accounts' : 'Contacts';
    }

    get currentViewDescription() {
        return this.currentView === 'accounts'
            ? 'Manage your accounts and related contacts'
            : 'Manage your contacts across all accounts';
    }

    get currentViewIcon() {
        return this.currentView === 'accounts'
            ? '/assets/icons/standard-sprite/svg/symbols.svg#account'
            : '/assets/icons/standard-sprite/svg/symbols.svg#contact';
    }
}
