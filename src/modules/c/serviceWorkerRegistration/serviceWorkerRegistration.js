import { LightningElement } from 'lwc';

/**
 * Component to register the Service Worker for offline capability
 */
export default class ServiceWorkerRegistration extends LightningElement {
    isInitialized = false;

    connectedCallback() {
        this.registerServiceWorker();
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
            if ('sync' in registration) {
                registration.sync
                    .register('sync-pending-operations')
                    .catch((err) =>
                        console.error(
                            'Background sync registration failed:',
                            err
                        )
                    );
            } else {
                // Manual sync if background sync not available
                this.dispatchEvent(new CustomEvent('syncpendingoperations'));
            }
        });
    }

    setupMessageListener() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SYNC_PENDING_OPERATIONS') {
                this.dispatchEvent(new CustomEvent('syncpendingoperations'));
            }
        });
    }
}
