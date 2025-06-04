import { LightningElement, api, track } from 'lwc';

export default class DefineSection extends LightningElement {
    @api recordId;

    @track sections = {
        information: {
            isOpen: true,
            isEditing: false,
            title: 'Information'
        },
        roles: {
            isOpen: true,
            isEditing: false,
            title: 'Assessment Roles'
        },
        scoring: {
            isOpen: true,
            isEditing: false,
            title: 'Configure Scoring Ranges'
        },
        systemInfo: {
            isOpen: true,
            title: 'System Information'
        }
    };

    @track assessmentData = {
        name: 'Assessment 16-05',
        checklistName: 'SIF Alert',
        startDate: '5/1/2025',
        endDate: '5/31/2025',
        category: 'Health & Safety',
        occurrence: 'One Time',
        associatedCustomer: 'Alpha Corporation',
        description: 'description',
        orgComponent: 'Spare Parts Room',
        summary: 'summary',
        status: 'Closed'
    };

    @track roles = [
        { name: 'Admin', group: 'IT Security', required: true },
        { name: 'Owner', group: 'Operations', required: true },
        { name: 'Manager', group: 'Compliance', required: false },
        { name: 'Approver', group: 'Executive', required: true },
        { name: 'Reviewer', group: 'Quality', required: false },
        { name: 'Contributor', group: 'Support', required: false }
    ];

    @track scoringRanges = [
        {
            id: '1',
            from: 0,
            to: 35,
            color: 'red-flag',
            isEditable: false,
            isDeletable: false
        },
        {
            id: '2',
            from: 36,
            to: 75,
            color: 'orange-flag',
            isEditable: true,
            isDeletable: true
        },
        {
            id: '3',
            from: 76,
            to: 100,
            color: 'green-flag',
            isEditable: true,
            isDeletable: false
        }
    ];

    @track systemInfo = {
        createdBy: {
            name: 'John Smith',
            date: '4/15/2025 10:30 AM',
            avatar: '/resources/images/avatar-john.jpg'
        },
        modifiedBy: {
            name: 'Sarah Johnson',
            date: '4/28/2025 2:45 PM',
            avatar: '/resources/images/avatar-sarah.jpg'
        }
    };

    @track isAdminReadonly = true;
    @track isApproverReadonly = true;
    @track isInitiatorReadonly = true;
    @track isRespondentReadonly = true;
    @track isReviewerReadonly = true;
    @track isViewerReadonly = true;

    connectedCallback() {
        // Initialize any data that needs to be set when component loads
    }

    // Toggle section collapse/expand
    toggleSection(event) {
        const sectionName = event.currentTarget.dataset.section;
        this.sections[sectionName].isOpen = !this.sections[sectionName].isOpen;
    }

    // Toggle edit mode for a section
    toggleEdit(event) {
        const sectionName = event.currentTarget.dataset.section;
        this.sections[sectionName].isEditing =
            !this.sections[sectionName].isEditing;
    }

    // Handle field edit icon click
    handleFieldEdit(event) {
        const fieldName = event.currentTarget.dataset.field;
        // In a real app, this would open an inline edit for the specific field
        console.log(`Editing field: ${fieldName}`);
    }

    // Add new scoring range
    handleAddScoringRange() {
        // In a real app, this would open a form to add a new scoring range
        console.log('Adding new scoring range');
    }

    // Enable editing mode for all scoring ranges
    handleEditScoringRanges() {
        // In a real app, this would enable editing mode for all scoring ranges
        console.log('Editing scoring ranges');
    }

    // Delete a specific scoring range
    handleDeleteScoringRange(event) {
        const rangeId = event.currentTarget.dataset.id;
        // In a real app, this would delete the specific scoring range
        console.log(`Deleting scoring range: ${rangeId}`);
    }

    // Handle the recurring assessments checkbox change
    handleCheckboxChange(event) {
        console.log(`Recurring assessments checkbox: ${event.target.checked}`);
    }

    // Handle form field changes
    handleFieldChange(event) {
        const field = event.target.dataset.field;
        this.assessmentData[field] = event.target.value;
    }

    handleLabelClick(event) {
        const role = event.target.dataset.role;
        switch (role) {
            case 'Administrators':
                this.isAdminReadonly = false;
                break;
            case 'Approvers':
                this.isApproverReadonly = false;
                break;
            case 'Initiators':
                this.isInitiatorReadonly = false;
                break;
            case 'Respondents':
                this.isRespondentReadonly = false;
                break;
            case 'Reviewers':
                this.isReviewerReadonly = false;
                break;
            case 'Viewers':
                this.isViewerReadonly = false;
                break;
            default:
                console.warn(`Unknown role: ${role}`);
        }
    }
}
