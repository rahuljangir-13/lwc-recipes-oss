import { LightningElement, track } from 'lwc';

export default class AssessmentPage extends LightningElement {
    @track selectedSidebarTab = 'create'; // Default to 'create' tab
    @track selectedTab = 'define'; // Default subtab
    recordId = '123456'; // Mock recordId for demo purposes

    // Handle sidebar tab change
    handleTabChange(event) {
        this.selectedSidebarTab = event.detail;

        // Set default subtab based on sidebar selection
        if (this.selectedSidebarTab === 'create') {
            this.selectedTab = 'define'; // Default subtab for Create is Define
        } else if (this.selectedSidebarTab === 'manage') {
            this.selectedTab = 'response'; // Default subtab for Manage is Response
        }

        // Pass the selected tab to the details component
        const detailsComponent = this.template.querySelector(
            'ui-assessment-details'
        );
        if (detailsComponent) {
            detailsComponent.selectedTab = this.selectedTab;
        }
    }

    // Handle delete button click in banner
    handleDelete() {
        console.log('Delete button clicked');
    }
}
