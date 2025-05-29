import { LightningElement } from 'lwc';
import { syncPendingOperationsWhenOnline } from 'c/utils';

/**
 * Component to register the Service Worker for offline capability
 */
export default class ServiceWorkerRegistration extends LightningElement {
    isInitialized = false;

    connectedCallback() {
        this.registerServiceWorker();

        // Setup connectivity change listener
        window.addEventListener('online', this.handleOnlineStatus.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener(
            'online',
            this.handleOnlineStatus.bind(this)
        );
    }

    handleOnlineStatus() {
        console.log('🌐 App is back online, checking for pending operations');
        // Trigger sync of pending operations
        syncPendingOperationsWhenOnline().then((hasPendingOps) => {
            if (hasPendingOps) {
                console.log('🔄 Sync will be triggered for pending operations');
                this.dispatchEvent(new CustomEvent('syncpendingoperations'));
            }
        });
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator && !this.isInitialized) {
            this.isInitialized = true;

            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/serviceWorker.js')
                    .then((registration) => {
                        console.log(
                            'ServiceWorker registration successful with scope: ',
                            registration.scope
                        );

                        // Setup background sync when back online
                        this.setupBackgroundSync(registration);

                        // Listen for messages from service worker
                        this.setupMessageListener();
                    })
                    .catch((error) => {
                        console.error(
                            'ServiceWorker registration failed: ',
                            error
                        );
                    });
            });
        }
    }

    setupBackgroundSync(registration) {
        // Reuse existing periodic sync or create a new one
        if ('periodicSync' in registration) {
            // Check permission
            navigator.permissions
                .query({
                    name: 'periodic-background-sync'
                })
                .then((status) => {
                    if (status.state === 'granted') {
                        registration.periodicSync.register(
                            'sync-pending-operations',
                            {
                                minInterval: 60 * 1000 // Attempt sync every minute
                            }
                        );
                    }
                });
        } else {
            // Fallback to regular sync
            this.performSyncWhenOnline(registration);
        }
    }

    performSyncWhenOnline(registration) {
        window.addEventListener('online', () => {
            console.log('🌐 Network is back online, registering sync task');
            if ('sync' in registration) {
                registration.sync
                    .register('sync-pending-operations')
                    .then(() => {
                        console.log(
                            '🔄 Background sync registered successfully'
                        );
                    })
                    .catch((err) => {
                        console.error(
                            'Background sync registration failed:',
                            err
                        );
                        // If background sync fails, attempt manual sync
                        console.log('⚠️ Falling back to manual sync');
                        this.dispatchEvent(
                            new CustomEvent('syncpendingoperations')
                        );
                    });
            } else {
                // Manual sync if background sync not available
                console.log(
                    '⚠️ Background sync not supported, using manual sync'
                );
                this.dispatchEvent(new CustomEvent('syncpendingoperations'));
            }
        });
    }

    setupMessageListener() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('📬 Message received from Service Worker:', event.data);
            if (event.data && event.data.type === 'SYNC_PENDING_OPERATIONS') {
                console.log('🔄 Triggering sync for pending operations');
                this.dispatchEvent(new CustomEvent('syncpendingoperations'));
            }
        });
    }
}
