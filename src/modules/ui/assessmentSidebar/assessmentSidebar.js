import { LightningElement } from 'lwc';

export default class AssessmentSidebar extends LightningElement {
    createExpanded = true;
    manageExpanded = false;
    currentTab = 'define'; // Default selected tab

    // Get classes for main tabs
    get createTabClass() {
        return this.createExpanded ? 'main-tab main-tab-active' : 'main-tab';
    }

    get manageTabClass() {
        return this.manageExpanded ? 'main-tab main-tab-active' : 'main-tab';
    }

    // Get classes for subtabs containers
    get createSubTabsClass() {
        return this.createExpanded
            ? 'sub-tabs-container expanded'
            : 'sub-tabs-container collapsed';
    }

    get manageSubTabsClass() {
        return this.manageExpanded
            ? 'sub-tabs-container expanded'
            : 'sub-tabs-container collapsed';
    } // Get chevron classes based on expansion state
    get createChevronClass() {
        return this.createExpanded
            ? 'chevron-icon chevron-down'
            : 'chevron-icon chevron-right';
    }

    get manageChevronClass() {
        return this.manageExpanded
            ? 'chevron-icon chevron-down'
            : 'chevron-icon chevron-right';
    }

    // Dynamic classes for Create section subtabs
    get defineTabContainerClass() {
        return this.currentTab === 'define'
            ? 'sub-tab sub-tab-active'
            : 'sub-tab';
    }

    get assignTabContainerClass() {
        return this.currentTab === 'assign'
            ? 'sub-tab sub-tab-active'
            : 'sub-tab';
    }

    // Dynamic classes for Manage section subtabs
    get responsesTabContainerClass() {
        return this.currentTab === 'response'
            ? 'sub-tab sub-tab-active'
            : 'sub-tab';
    }

    get findingsTabContainerClass() {
        return this.currentTab === 'finding'
            ? 'sub-tab sub-tab-active'
            : 'sub-tab';
    }

    get emailTabContainerClass() {
        return this.currentTab === 'email'
            ? 'sub-tab sub-tab-active'
            : 'sub-tab';
    }

    // Event handlers
    handleCreateClick() {
        // If already expanded, don't change anything
        if (!this.createExpanded) {
            this.createExpanded = true;
            this.manageExpanded = false;
            this.currentTab = 'define';
            this.fireTabChangeEvent('define');
        }
    }

    handleManageClick() {
        // If already expanded, don't change anything
        if (!this.manageExpanded) {
            this.createExpanded = false;
            this.manageExpanded = true;
            this.currentTab = 'response';
            this.fireTabChangeEvent('response');
        }
    }

    handleSubTabClick(event) {
        const tab = event.currentTarget.dataset.tab;
        this.currentTab = tab;
        this.fireTabChangeEvent(tab);
    }

    fireTabChangeEvent(tabName) {
        const selectedEvent = new CustomEvent('selectedtabchange', {
            detail: tabName
        });
        this.dispatchEvent(selectedEvent);
    }
}
