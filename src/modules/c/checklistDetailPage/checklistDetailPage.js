//checklistDetailPage.js
import { LightningElement, api, track } from 'lwc';

export default class ChecklistDetailPage extends LightningElement {
    @api recordId;
    @track checklistDetail = {
        id: null,
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
    @track templateId = null; // ID of the template/checklist for questions

    connectedCallback() {
        // In a real application, you would load the data based on recordId
        console.log(
            'ChecklistDetailPage initialized with recordId:',
            this.recordId
        );

        // If recordId is available, set it as the templateId for questions
        if (this.recordId) {
            this.templateId = this.recordId;
        }
    }

    @api
    setChecklistData(data) {
        if (data) {
            // Store the item ID for questions fetch
            this.templateId = data.id;

            this.checklistDetail = {
                id: data.id,
                assessmentName: data.assessmentType || 'Assessment Template',
                category: data.category || 'Default Category',
                checklistName: data.name || 'Default Name',
                numberOfAssessment: data.numberOfAssessment || '0',
                createdFor: data.createdFor || 'Not Specified',
                description: data.description || 'No description available',
                status: data.status || 'Active',
                createdDate: data.formattedCreatedDate || 'Unknown',
                lastModifiedDate: data.formattedLastModifiedDate || 'Unknown'
            };

            console.log('Set template ID for questions:', this.templateId);
            console.log('Set checklist detail data:', this.checklistDetail);

            // If we're already on the questions tab, notify the questions component
            if (this.currentSection === 'questions') {
                this.refreshQuestionsForTemplate();
            }
        }
    }

    // When the questions component has been added to the DOM, initialize it with the templateId
    renderedCallback() {
        if (this.currentSection === 'questions' && this.templateId) {
            this.refreshQuestionsForTemplate();
        }
    }

    // Tell the questions component to load questions for the current template
    refreshQuestionsForTemplate() {
        const questionsComponent = this.template.querySelector(
            'c-checklist-questions-tree'
        );
        if (questionsComponent) {
            console.log(
                'Setting template ID on questions component:',
                this.templateId
            );
            questionsComponent.templateId = this.templateId;
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

            // If we navigated to the questions tab, make sure the questions component is initialized
            if (section === 'questions' && this.templateId) {
                this.refreshQuestionsForTemplate();
            }
        }
    }

    // Handle event when questions are loaded
    handleQuestionsLoaded(event) {
        console.log('Questions loaded for template:', event.detail.templateId);
    }
}
