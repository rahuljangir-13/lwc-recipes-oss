import { LightningElement, track, api } from 'lwc';
import * as accountService from 'c/accountService';
import * as contactService from 'c/contactService';

const VIEW_STATES = {
    LIST: 'list',
    FORM: 'form',
    DETAIL: 'detail'
};

export default class AccountManager extends LightningElement {
    @track accounts = [];
    @track currentAccount = {};
    @track relatedContacts = [];
    @track error = null;
    @track isLoading = false;
    @track viewState = VIEW_STATES.LIST;
    @track isNew = false;
    @track showDeleteConfirmation = false;
    @track itemToDeleteId = null;
    @track deleteType = '';

    connectedCallback() {
        this.loadAccounts();
    }

    // API Methods
    @api
    loadAccountDetails(accountId) {
        this.isLoading = true;
        this.error = null;

        Promise.all([
            accountService.getAccount(accountId),
            contactService.getContactsByAccountId(accountId)
        ])
            .then(([account, contacts]) => {
                this.currentAccount = account;
                this.relatedContacts = contacts.map((contact) => ({
                    ...contact,
                    emailHref: `mailto:${contact.email}`
                }));
                this.viewState = VIEW_STATES.DETAIL;
                this.isLoading = false;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading account details';
                this.isLoading = false;
            });
    }

    // COMPUTED PROPERTIES
    get showAccountList() {
        return this.viewState === VIEW_STATES.LIST;
    }

    get showAccountForm() {
        return this.viewState === VIEW_STATES.FORM;
    }

    get showAccountDetail() {
        return this.viewState === VIEW_STATES.DETAIL;
    }

    get formattedCreatedDate() {
        return this.formatDate(this.currentAccount.createdDate);
    }

    get formattedModifiedDate() {
        return this.formatDate(this.currentAccount.lastModifiedDate);
    }

    get deleteConfirmationMessage() {
        return this.deleteType === 'account'
            ? 'Are you sure you want to delete this account? This will also delete all related contacts.'
            : 'Are you sure you want to delete this contact?';
    }

    // DATA LOADING METHODS
    loadAccounts() {
        this.isLoading = true;
        this.error = null;

        accountService
            .getAccounts()
            .then((result) => {
                this.accounts = result;
                this.isLoading = false;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading accounts';
                this.isLoading = false;
            });
    }

    // EVENT HANDLERS
    handleFieldChange(event) {
        const field = event.target.dataset.field;
        this.currentAccount = {
            ...this.currentAccount,
            [field]: event.target.value
        };
    }

    handleNewAccount() {
        this.currentAccount = {};
        this.isNew = true;
        this.viewState = VIEW_STATES.FORM;
    }

    handleSave() {
        if (!this.validateForm()) {
            return;
        }

        this.isLoading = true;
        this.error = null;

        const saveOperation = this.isNew
            ? accountService.createAccount(this.currentAccount)
            : accountService.updateAccount(this.currentAccount);

        saveOperation
            .then(() => {
                this.loadAccounts();
                this.viewState = VIEW_STATES.LIST;

                // Dispatch success event
                this.dispatchEvent(
                    new CustomEvent('editsuccess', {
                        detail: {
                            type: 'account',
                            id: this.currentAccount.id,
                            isNew: this.isNew
                        }
                    })
                );
            })
            .catch((error) => {
                this.error = error.message || 'Error saving account';
                this.isLoading = false;
            });
    }

    handleCancel() {
        this.viewState = VIEW_STATES.LIST;
    }

    handleViewAccount(event) {
        event.preventDefault();
        const accountId = event.target.dataset.id;
        this.loadAccountDetails(accountId);
    }

    handleEditAccount(event) {
        const accountId = event.target.dataset.id;
        this.isLoading = true;

        accountService
            .getAccount(accountId)
            .then((account) => {
                this.currentAccount = account;
                this.isNew = false;
                this.viewState = VIEW_STATES.FORM;
                this.isLoading = false;
            })
            .catch((error) => {
                this.error = error.message || 'Error loading account for edit';
                this.isLoading = false;
            });
    }

    handleDeleteAccount(event) {
        const accountId = event.target.dataset.id;
        this.itemToDeleteId = accountId;
        this.deleteType = 'account';
        this.showDeleteConfirmation = true;
    }

    handleConfirmDelete() {
        this.showDeleteConfirmation = false;

        if (this.deleteType === 'account') {
            this.deleteAccount(this.itemToDeleteId);
        } else if (this.deleteType === 'contact') {
            this.deleteContactRecord(this.itemToDeleteId);
        }

        this.itemToDeleteId = null;
        this.deleteType = '';
    }

    handleCancelDelete() {
        this.showDeleteConfirmation = false;
        this.itemToDeleteId = null;
        this.deleteType = '';
    }

    deleteAccount(accountId) {
        this.isLoading = true;
        this.error = null;

        accountService
            .deleteAccount(accountId)
            .then(() => {
                this.loadAccounts();
                // Dispatch delete success event
                this.dispatchEvent(
                    new CustomEvent('editsuccess', {
                        detail: {
                            type: 'account',
                            action: 'delete',
                            id: accountId
                        }
                    })
                );
            })
            .catch((error) => {
                this.error = error.message || 'Error deleting account';
                this.isLoading = false;
            });
    }

    handleBackToList() {
        this.viewState = VIEW_STATES.LIST;
        // Dispatch viewaccounts event
        this.dispatchEvent(new CustomEvent('viewaccounts'));
    }

    handleViewContacts(event) {
        const accountId = event.target.dataset.id;
        this.loadAccountDetails(accountId);
    }

    handleNewContact() {
        // Dispatch event to open contact form with pre-populated accountId
        const selectEvent = new CustomEvent('newcontact', {
            detail: { accountId: this.currentAccount.id }
        });
        this.dispatchEvent(selectEvent);
    }

    handleEditContact(event) {
        const contactId = event.target.dataset.id;
        // Dispatch event to open contact form with this contact for editing
        const selectEvent = new CustomEvent('editcontact', {
            detail: { contactId }
        });
        this.dispatchEvent(selectEvent);
    }

    handleDeleteContact(event) {
        const contactId = event.target.dataset.id;
        this.itemToDeleteId = contactId;
        this.deleteType = 'contact';
        this.showDeleteConfirmation = true;
    }

    deleteContactRecord(contactId) {
        this.isLoading = true;
        this.error = null;

        contactService
            .deleteContact(contactId)
            .then(() => {
                // Refresh the related contacts
                return contactService.getContactsByAccountId(
                    this.currentAccount.id
                );
            })
            .then((contacts) => {
                this.relatedContacts = contacts.map((contact) => ({
                    ...contact,
                    emailHref: `mailto:${contact.email}`
                }));
                this.isLoading = false;

                // Dispatch delete success event
                this.dispatchEvent(
                    new CustomEvent('editsuccess', {
                        detail: {
                            type: 'contact',
                            action: 'delete',
                            id: contactId
                        }
                    })
                );
            })
            .catch((error) => {
                this.error = error.message || 'Error deleting contact';
                this.isLoading = false;
            });
    }

    // UTILITY METHODS
    validateForm() {
        // Basic validation
        if (!this.currentAccount.name) {
            this.error = 'Account Name is required';
            return false;
        }
        return true;
    }

    formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
}
