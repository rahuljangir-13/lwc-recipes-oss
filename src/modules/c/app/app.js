import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {
    @track currentView = 'incident'; // 'incident', 'hazard'
    @track isLoading = false;
    @track isLoggedIn = false;
    @track currentObjectApiName = '';
    @track searchTerm = '';
    @track showForm = false;

    connectedCallback() {
        // Check if user is logged in by looking for session storage
        this.checkLoginStatus();

        // Initialize routing
        this.initializeRouting();

        // Listen for URL changes
        window.addEventListener('popstate', this.handleUrlChange.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('popstate', this.handleUrlChange.bind(this));
    }

    initializeRouting() {
        // Get current URL and extract object API name
        this.handleUrlChange();
    }

    handleUrlChange() {
        // const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);

        // Extract object API name from URL
        // Expected URLs: /?object=Rhythm__Incident__c or /?object=Rhythm__Hazard__c
        const objectApiName = urlParams.get('object');

        if (objectApiName) {
            this.currentObjectApiName = objectApiName;

            // Determine view based on object API name
            if (objectApiName.includes('Incident')) {
                this.currentView = 'incident';
            } else if (objectApiName.includes('Hazard')) {
                this.currentView = 'hazard';
            }
        } else {
            // Default to incident if no object specified
            this.setDefaultRoute();
        }

        console.log('Current object API name:', this.currentObjectApiName);
        console.log('Current view:', this.currentView);
    }

    setDefaultRoute() {
        this.currentView = 'incident';
        this.currentObjectApiName = 'Rhythm__Incident__c';
        this.updateUrl('incident', 'Rhythm__Incident__c');
    }

    updateUrl(viewType, objectApiName) {
        const newUrl = `${window.location.origin}${window.location.pathname}?object=${objectApiName}`;
        window.history.pushState(
            { view: viewType, object: objectApiName },
            '',
            newUrl
        );
    }

    checkLoginStatus() {
        const accessToken = sessionStorage.getItem('sf_access_token');
        const instanceUrl = sessionStorage.getItem('sf_instance_url');
        const userId = sessionStorage.getItem('sf_user_id');

        this.isLoggedIn = !!(accessToken && instanceUrl && userId);
    }

    handleLoginSuccess() {
        this.isLoggedIn = true;
        this.checkLoginStatus();

        // Set default route after login
        if (!this.currentObjectApiName) {
            this.setDefaultRoute();
        }
    }

    handleMenuChange(event) {
        const selectedItem = event.detail.selectedItem;
        let objectApiName = '';

        // Map menu selection to object API name
        if (selectedItem === 'incident') {
            objectApiName = 'Rhythm__Incident__c';
        } else if (selectedItem === 'hazard') {
            objectApiName = 'Rhythm__Hazard__c';
        }

        this.currentView = selectedItem;
        this.currentObjectApiName = objectApiName;

        // Clear search when changing views
        this.searchTerm = '';

        // Update URL
        this.updateUrl(selectedItem, objectApiName);

        console.log('Menu changed to:', selectedItem, 'Object:', objectApiName);
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
        console.log('Search term:', this.searchTerm);

        // TODO: Implement search functionality
        // This could dispatch an event to child components
        // or filter data based on the search term

        // Dispatch search event to child components
        const searchEvent = new CustomEvent('search', {
            detail: {
                searchTerm: this.searchTerm,
                objectType: this.currentView
            }
        });

        // Dispatch to the current active component
        const activeComponent = this.template.querySelector(
            `c-${this.currentView}`
        );
        if (activeComponent) {
            activeComponent.dispatchEvent(searchEvent);
        }
    }

    handleFabClick() {
        console.log('FAB clicked for:', this.currentView);

        // Show the safety event form
        this.showForm = true;

        const action =
            this.currentView === 'incident'
                ? 'Create New Incident'
                : 'Create New Hazard';
        console.log('FAB Action:', action);
    }

    handleFormCancel() {
        this.showForm = false;
    }

    handleFormSuccess(event) {
        this.showForm = false;

        // Show success notification (you can implement a toast component)
        console.log('✅ Form submitted successfully:', event.detail.message);

        // Refresh the current view
        this.refreshCurrentView();
    }

    refreshCurrentView() {
        // Dispatch refresh event to the current active component
        const activeComponent = this.template.querySelector(
            `c-${this.currentView}`
        );
        if (activeComponent) {
            // Trigger a refresh by dispatching an event or calling a method
            const refreshEvent = new CustomEvent('refresh');
            activeComponent.dispatchEvent(refreshEvent);
        }
    }

    handleLogout() {
        // Clear session storage
        sessionStorage.removeItem('sf_access_token');
        sessionStorage.removeItem('sf_instance_url');
        sessionStorage.removeItem('sf_user_id');

        // Reset to login state
        this.isLoggedIn = false;
        this.currentView = 'incident';
        this.currentObjectApiName = '';
        this.searchTerm = '';
        this.showForm = false;

        // Clear URL
        window.history.pushState({}, '', window.location.pathname);
    }

    // Getter for showing login page
    get showLogin() {
        return !this.isLoggedIn;
    }

    // Getter for showing incident view
    get showIncident() {
        return this.isLoggedIn && this.currentView === 'incident';
    }

    // Getter for showing hazard view
    get showHazard() {
        return this.isLoggedIn && this.currentView === 'hazard';
    }

    // Getter for current object API name to pass to components
    get objectApiName() {
        return this.currentObjectApiName;
    }
}
