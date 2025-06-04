import { LightningElement } from 'lwc';

export default class AssessmentPage extends LightningElement {
    selectedTab = 'define'; // Default selected tab

    handleTabChange(event) {
        this.selectedTab = event.detail;
    }

    handleDelete() {
        // Handle delete action here
        console.log('Delete button clicked');
    }
}
