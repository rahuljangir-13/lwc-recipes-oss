import { LightningElement, api } from 'lwc';

export default class AssessmentDetails extends LightningElement {
    @api selectedTab = 'define';
    @api recordId;

    // Create section tabs
    get isDefineTab() {
        return this.selectedTab === 'define';
    }

    get isAssignTab() {
        return this.selectedTab === 'assign';
    }

    // Manage section tabs
    get isResponseTab() {
        return this.selectedTab === 'response';
    }

    get isFindingTab() {
        return this.selectedTab === 'finding';
    }

    get isEmailTab() {
        return this.selectedTab === 'email';
    }
}
