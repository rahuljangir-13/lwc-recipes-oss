import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {
    @track currentView = 'accounts'; // Default view
    @track pendingAction = null;

    // Computed properties for tab classes
    get accountsTabClass() {
        return this.isAccountView
            ? 'slds-tabs_default__item slds-is-active'
            : 'slds-tabs_default__item';
    }

    get contactsTabClass() {
        return this.isContactView
            ? 'slds-tabs_default__item slds-is-active'
            : 'slds-tabs_default__item';
    }

    // Computed properties for tab content
    get accountsContentClass() {
        return this.isAccountView
            ? 'slds-tabs_default__content slds-show'
            : 'slds-tabs_default__content slds-hide';
    }

    get contactsContentClass() {
        return this.isContactView
            ? 'slds-tabs_default__content slds-show'
            : 'slds-tabs_default__content slds-hide';
    }

    // Computed properties for tab focus
    get accountsTabIndex() {
        return this.isAccountView ? 0 : -1;
    }

    get contactsTabIndex() {
        return this.isContactView ? 0 : -1;
    }

    // Computed properties for conditional rendering
    get isAccountView() {
        return this.currentView === 'accounts';
    }

    get isContactView() {
        return this.currentView === 'contacts';
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

    // Tab click handlers
    handleAccountsClick() {
        this.currentView = 'accounts';
    }

    handleContactsClick() {
        this.currentView = 'contacts';
    }

    // Lifecycle hook to handle pending actions after rendering
    renderedCallback() {
        if (this.pendingAction) {
            const { action, params } = this.pendingAction;
            this.pendingAction = null;

            if (action === 'viewAccount') {
                const accountManager =
                    this.template.querySelector('c-account-manager');
                if (accountManager) {
                    accountManager.loadAccountDetails(params.accountId);
                }
            } else if (action === 'viewContact') {
                const contactManager =
                    this.template.querySelector('c-contact-manager');
                if (contactManager) {
                    contactManager.loadContactDetails(params.contactId);
                }
            } else if (action === 'editContact') {
                const contactManager =
                    this.template.querySelector('c-contact-manager');
                if (contactManager) {
                    contactManager.handleEditContactById(params.contactId);
                }
            } else if (action === 'newContact') {
                const contactManager =
                    this.template.querySelector('c-contact-manager');
                if (contactManager) {
                    contactManager.handleNewContactForAccount(params.accountId);
                }
            }
        }
    }

    // Event handlers for component interactions
    handleViewAccount(event) {
        const accountId = event.detail.accountId;
        this.currentView = 'accounts';
        this.pendingAction = { action: 'viewAccount', params: { accountId } };
    }

    handleViewContact(event) {
        const contactId = event.detail.contactId;
        this.currentView = 'contacts';
        this.pendingAction = { action: 'viewContact', params: { contactId } };
    }

    handleEditContact(event) {
        const contactId = event.detail.contactId;
        this.currentView = 'contacts';
        this.pendingAction = { action: 'editContact', params: { contactId } };
    }

    handleNewContact(event) {
        const accountId = event.detail.accountId;
        this.currentView = 'contacts';
        this.pendingAction = { action: 'newContact', params: { accountId } };
    }

    handleViewContacts() {
        this.currentView = 'contacts';
    }

    handleViewAccounts() {
        this.currentView = 'accounts';
    }

    handleEditSuccess() {
        // Could implement toast notifications or other success feedback here
    }
}
