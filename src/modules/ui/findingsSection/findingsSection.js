import { LightningElement, api, track } from 'lwc';

export default class FindingsSection extends LightningElement {
    @api recordId;

    @track findings = [];

    get findingsCount() {
        return this.findings.length;
    }

    handleNewFinding() {
        // In a real app, this would open a modal to create a new finding
        console.log('Creating new finding...');
    }
}
