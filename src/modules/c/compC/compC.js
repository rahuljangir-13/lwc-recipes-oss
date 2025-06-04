import { LightningElement, track } from 'lwc';
import pubsub from 'c/pubsub';
import userDataService from 'c/userDataService';

export default class CompC extends LightningElement {
    @track receivedMessage = '';
    @track receivedTimestamp = '';
    @track error = '';
    @track isLoading = false;
    @track currentUserData = null;
    userId = '';

    connectedCallback() {
        // Subscribe to messages when component is inserted in the DOM
        pubsub.subscribe('compAMessage', this.handleMessage.bind(this));

        // Load any existing user data
        this.loadExistingUserData();
    }

    disconnectedCallback() {
        // Unsubscribe when component is removed from the DOM
        pubsub.unsubscribe('compAMessage', this.handleMessage.bind(this));
    }

    handleMessage(message) {
        this.receivedMessage = message.data;
        this.receivedTimestamp = message.timestamp;
    }

    async handleSubmit() {
        // Get the input value directly from the input field
        const inputElement = this.template.querySelector('input');
        this.userId = inputElement.value;

        if (!this.userId) {
            this.error = 'Please enter a user ID';
            return;
        }

        if (this.userId < 1 || this.userId > 100) {
            this.error = 'Please enter a user ID between 1 and 100';
            return;
        }

        this.isLoading = true;
        this.error = '';

        try {
            const userData = await userDataService.fetchUserById(this.userId);
            this.currentUserData = userData;
            this.error = '';
        } catch (error) {
            this.error = error.message || 'Error fetching user data';
            this.currentUserData = null;
        } finally {
            this.isLoading = false;
        }
    }

    handleClearUser() {
        this.userId = '';
        this.currentUserData = null;
        this.error = '';
        userDataService.clearUserData();

        // Clear the input field
        const inputElement = this.template.querySelector('input');
        if (inputElement) {
            inputElement.value = '';
        }
    }

    loadExistingUserData() {
        const storedData = userDataService.getStoredUserData();
        if (storedData) {
            this.currentUserData = storedData;
            this.userId = storedData.id.toString();
        }
    }
}
