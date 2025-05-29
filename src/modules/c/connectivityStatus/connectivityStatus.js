import { LightningElement, track } from 'lwc';
import {
    isOnline,
    initConnectivityListeners,
    addConnectivityListener,
    removeConnectivityListener,
    getPendingOperations
} from 'c/utils';

/**
 * Component to display the online/offline status and sync status
 */
export default class ConnectivityStatus extends LightningElement {
    @track isOnline = true;
    @track syncStatus = 'idle'; // idle, syncing, completed, error
    @track syncMessage = '';
    @track showToast = false;
    @track pendingOperationsCount = 0;

    connectedCallback() {
        // Initialize with current status
        this.isOnline = initConnectivityListeners();

        // Listen for connectivity changes
        this._onConnectivityChange = this.handleConnectivityChange.bind(this);
        addConnectivityListener(this._onConnectivityChange);

        // Check for pending operations
        this.checkPendingOperations();
    }

    disconnectedCallback() {
        removeConnectivityListener(this._onConnectivityChange);
    }

    handleConnectivityChange(isOnline) {
        this.isOnline = isOnline;

        if (isOnline) {
            this.showToast = true;
            this.syncMessage = 'You are back online. Syncing changes...';

            // Dispatch event to trigger sync
            this.dispatchEvent(new CustomEvent('sync-needed'));

            // Hide toast after 5 seconds
            setTimeout(() => {
                this.showToast = false;
            }, 5000);
        } else {
            this.showToast = true;
            this.syncMessage =
                'You are offline. Changes will be saved locally and synced when you reconnect.';

            // Keep offline message visible
            setTimeout(() => {
                this.showToast = false;
            }, 5000);
        }
    }

    handleSyncStart() {
        this.syncStatus = 'syncing';
        this.syncMessage = 'Syncing your changes...';
        this.showToast = true;
    }

    handleSyncComplete(event) {
        const { synced, total } = event.detail || { synced: 0, total: 0 };

        this.syncStatus = 'completed';
        this.syncMessage = `Successfully synced ${synced} of ${total} changes.`;
        this.showToast = true;
        this.pendingOperationsCount = 0;

        // Hide toast after 3 seconds
        setTimeout(() => {
            this.showToast = false;
            this.syncStatus = 'idle';
        }, 3000);
    }

    handleSyncError(event) {
        const { message } = event.detail || { message: 'Unknown error' };

        this.syncStatus = 'error';
        this.syncMessage = `Sync error: ${message}`;
        this.showToast = true;

        // Hide toast after 5 seconds
        setTimeout(() => {
            this.showToast = false;
            this.syncStatus = 'idle';
        }, 5000);
    }

    closeToast() {
        this.showToast = false;
    }

    checkPendingOperations() {
        // Check pending operations from the utils module
        getPendingOperations()
            .then((operations) => {
                this.pendingOperationsCount = operations
                    ? operations.length
                    : 0;
            })
            .catch((error) => {
                console.error('Error checking pending operations:', error);
            });
    }

    get statusClass() {
        return this.isOnline
            ? 'status-indicator online'
            : 'status-indicator offline';
    }

    get statusText() {
        return this.isOnline ? 'Online' : 'Offline';
    }

    get hasPendingOperations() {
        return this.pendingOperationsCount > 0;
    }

    get pendingOperationsText() {
        return `${this.pendingOperationsCount} pending ${this.pendingOperationsCount === 1 ? 'change' : 'changes'}`;
    }

    get toastClass() {
        if (this.syncStatus === 'error') {
            return 'toast error';
        } else if (this.syncStatus === 'completed') {
            return 'toast success';
        } else if (!this.isOnline) {
            return 'toast warning';
        }
        return 'toast info';
    }
}
