import { LightningElement, api, track } from 'lwc';

export default class ChecklistDetailPage extends LightningElement {
    @api recordId;
    @track checklistDetail = {
        assessmentName: 'Assessment 16-05',
        category: 'Health & Safety',
        checklistName: 'Checklist11-B1',
        occurrence: 'One Time',
        startDate: '5/1/2025',
        endDate: '5/31/2025',
        customer: 'Alpha Corporation',
        description: 'description',
        orgComponent: 'Spare Parts Room'
    };

    @track currentSection = 'details';

    connectedCallback() {
        // In a real application, you would load the data based on recordId
        // For now, we're using mock data in the checklistDetail object
        console.log(
            'ChecklistDetailPage initialized with recordId:',
            this.recordId
        );
    }

    @api
    setChecklistData(data) {
        if (data) {
            this.checklistDetail = {
                assessmentName: data.name || 'Assessment 16-05',
                category: data.category || 'Health & Safety',
                checklistName: data.name || 'SIF Alert',
                occurrence: data.occurrence || 'One Time',
                startDate: data.startDate || '5/1/2025',
                endDate: data.endDate || '5/31/2025',
                customer: data.customer || 'Alpha Corporation',
                description: data.description || 'description',
                orgComponent: data.orgComponent || 'Spare Parts Room'
            };
        }
    }

    handleBack() {
        // Dispatch an event to navigate back
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleEdit() {
        // Dispatch an event to edit the checklist
        this.dispatchEvent(
            new CustomEvent('edit', {
                detail: {
                    recordId: this.recordId
                }
            })
        );
    }

    // Toggle general information section
    toggleGeneralInfo(event) {
        const sectionTitle = event.currentTarget;
        sectionTitle.classList.toggle('collapsed');

        const section = sectionTitle.closest('.section-header');
        const content = section.nextElementSibling;

        if (content && content.classList.contains('section-content')) {
            if (sectionTitle.classList.contains('collapsed')) {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        }
    }

    // Handle sidebar navigation
    handleSidebarNavigation(event) {
        const clickedItem = event.currentTarget;
        const section = clickedItem.dataset.section;

        if (section) {
            // Update current section
            this.currentSection = section;

            // Update active state in sidebar
            const sidebarItems =
                this.template.querySelectorAll('.sidebar-item');
            sidebarItems.forEach((item) => {
                if (item.dataset.section === section) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Show appropriate tab content
            const tabContents = this.template.querySelectorAll('.tab-content');
            tabContents.forEach((tab) => {
                if (tab.dataset.tab === section) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            console.log('Navigated to section:', section);
        }
    }
}
