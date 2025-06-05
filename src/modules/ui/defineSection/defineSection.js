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

    // Available colors for scoring ranges
    @track availableColors = [
        { label: 'Red', value: 'red', colorClass: 'color-indicator red' },
        {
            label: 'Yellow',
            value: 'yellow',
            colorClass: 'color-indicator yellow'
        },
        { label: 'Green', value: 'green', colorClass: 'color-indicator green' },
        { label: 'Blue', value: 'blue', colorClass: 'color-indicator blue' },
        {
            label: 'Purple',
            value: 'purple',
            colorClass: 'color-indicator purple'
        },
        { label: 'Teal', value: 'teal', colorClass: 'color-indicator teal' },
        {
            label: 'Orange',
            value: 'orange',
            colorClass: 'color-indicator orange'
        }
    ];

    @track scoringRanges = [
        {
            id: '1',
            from: '0',
            to: '25',
            color: 'red',
            colorClass: 'color-indicator red',
            isEditing: false
        },
        {
            id: '2',
            from: '26',
            to: '50',
            color: 'yellow',
            colorClass: 'color-indicator yellow',
            isEditing: false
        },
        {
            id: '3',
            from: '51',
            to: '100',
            color: 'teal',
            colorClass: 'color-indicator teal',
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

    // Add new row functionality for + button
    handleAddNewRow(event) {
        const clickedRowId = event.target.dataset.id;
        console.log('Add new row clicked for:', clickedRowId);

        // Find the clicked row index
        const clickedRowIndex = this.scoringRanges.findIndex(
            (range) => range.id === clickedRowId
        );

        // Create new row object without stageName, with color selection
        const newRow = {
            id: 'new_' + Date.now(),
            from: '',
            to: '',
            color: 'red', // default color
            colorClass: 'color-indicator red',
            isEditing: true,
            isNewRow: true
        };

        // Insert new row below the clicked row
        const updatedRanges = [...this.scoringRanges];
        updatedRanges.splice(clickedRowIndex + 1, 0, newRow);
        this.scoringRanges = updatedRanges;
    }

    // Handle saving new row
    handleSaveNewRow(event) {
        const rowId = event.target.dataset.id;
        const rowIndex = this.scoringRanges.findIndex(
            (range) => range.id === rowId
        );

        if (rowIndex !== -1) {
            // Update row to non-editing mode
            this.scoringRanges[rowIndex].isEditing = false;
            this.scoringRanges[rowIndex].isNewRow = false;
            this.scoringRanges = [...this.scoringRanges];
            console.log('New row saved:', this.scoringRanges[rowIndex]);
        }
    }

    // Handle canceling new row
    handleCancelNewRow(event) {
        const rowId = event.target.dataset.id;
        const rowIndex = this.scoringRanges.findIndex(
            (range) => range.id === rowId
        );

        if (rowIndex !== -1) {
            // Remove the new row
            const updatedRanges = [...this.scoringRanges];
            updatedRanges.splice(rowIndex, 1);
            this.scoringRanges = updatedRanges;
            console.log('New row canceled');
        }
    }

    // Handle color selection change
    handleColorChange(event) {
        const rowId = event.target.dataset.id;
        const selectedColor = event.target.value;

        this.scoringRanges = this.scoringRanges.map((range) => {
            if (range.id === rowId) {
                return {
                    ...range,
                    color: selectedColor,
                    colorClass: `color-indicator ${selectedColor}`
                };
            }
            return range;
        });
    }

    // Getter for arrow rotation class
    get generalInfoArrowClass() {
        return this.isGeneralInfoOpen
            ? 'accordion-arrow rotated'
            : 'accordion-arrow';
    }

    get rolesArrowClass() {
        return this.isRolesOpen ? 'accordion-arrow rotated' : 'accordion-arrow';
    }

    get scoringArrowClass() {
        return this.isScoringOpen
            ? 'accordion-arrow rotated'
            : 'accordion-arrow';
    }

    get systemInfoArrowClass() {
        return this.isSystemInfoOpen
            ? 'accordion-arrow rotated'
            : 'accordion-arrow';
    }
}
