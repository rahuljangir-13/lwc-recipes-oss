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
            stageName: 'Lurker',
            from: '0',
            to: '10',
            colorClass: 'color-indicator red',
            isEditing: false
        },
        {
            id: '2',
            stageName: 'Active',
            from: '11',
            to: '50',
            colorClass: 'color-indicator yellow',
            isEditing: false
        },
        {
            id: '3',
            stageName: 'Super user',
            from: '96',
            to: '300',
            colorClass: 'color-indicator teal',
            isEditing: false
        },
        {
            id: '4',
            stageName: 'Ambassador',
            from: '301',
            to: '500',
            colorClass: 'color-indicator green',
            isEditing: false
        },
        {
            id: '5',
            stageName: 'Potential Ambassador',
            from: '501',
            to: '1000',
            colorClass: 'color-indicator blue',
            isEditing: false
        },
        {
            id: '6',
            stageName: 'Evangelist',
            from: '1001',
            to: '∞',
            colorClass: 'color-indicator purple',
            isEditing: false
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

    @track isGeneralInfoOpen = true;
    @track isRolesOpen = false;
    @track isScoringOpen = false;
    @track isSystemInfoOpen = false;

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

    toggleGeneralInfo() {
        this.isGeneralInfoOpen = !this.isGeneralInfoOpen;
    }
    toggleRoles() {
        this.isRolesOpen = !this.isRolesOpen;
    }
    toggleScoring() {
        this.isScoringOpen = !this.isScoringOpen;
    }
    toggleSystemInfo() {
        this.isSystemInfoOpen = !this.isSystemInfoOpen;
    }

    // Handle edit button click for a scoring range row
    handleEditRange(event) {
        const rangeId = event.currentTarget.dataset.id;
        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rangeId) {
                return { ...range, isEditing: true };
            }
            return range;
        });
    }

    // Handle field changes in edit mode
    handleRangeFieldChange(event) {
        const rangeId = event.target.dataset.id;
        const field = event.target.dataset.field;
        const value = event.target.value;

        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rangeId) {
                return { ...range, [field]: value };
            }
            return range;
        });
    }

    // Handle save button click
    handleSaveRange(event) {
        const rangeId = event.currentTarget.dataset.id;
        // In a real app, you would save changes to the server here

        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rangeId) {
                return { ...range, isEditing: false };
            }
            return range;
        });

        console.log(
            'Saved range:',
            this.scoringRanges.find((range) => range.id === rangeId)
        );
    }

    // Handle cancel button click
    handleCancelEdit(event) {
        const rangeId = event.currentTarget.dataset.id;

        // Revert changes by getting the original data
        const originalData = this.scoringRanges.find(
            (range) => range.id === rangeId
        );

        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rangeId) {
                return { ...originalData, isEditing: false };
            }
            return range;
        });
    }

    // Handle delete button click
    handleDeleteRange(event) {
        const rangeId = event.currentTarget.dataset.id;
        // In a real app, you would delete from the server here

        this.scoringRanges = this.scoringRanges.filter(
            (range) => range.id !== rangeId
        );

        console.log(`Deleted scoring range: ${rangeId}`);
    }
}
