import { LightningElement, track, api } from 'lwc';

export default class AssessmentModal extends LightningElement {
    @api recordType;

    @track form = {
        assessmentName: '',
        assessmentArea: '',
        recordType: '',
        status: 'Active'
    };

    @track errors = {};

    recordTypeOptions = [
        { label: 'Assessment Area', value: 'Assessment Area' },
        { label: 'Assessment Type', value: 'Assessment Type' }
    ];

    statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Draft', value: 'Draft' }
    ];

    connectedCallback() {
        // Pre-fill the record type if provided
        if (this.recordType) {
            this.form.recordType = this.recordType.label;

            // Additional initialization based on record type if needed
            if (this.recordType.value === 'siteAssessment') {
                this.form.assessmentArea = 'Site';
            } else if (this.recordType.value === 'safetyChecklist') {
                this.form.assessmentArea = 'Safety';
            } else if (this.recordType.value === 'qualityAudit') {
                this.form.assessmentArea = 'Quality';
            }
        }
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.form = { ...this.form, [name]: value };

        // Clear error for this field when user changes it
        if (this.errors[name]) {
            this.errors = { ...this.errors, [name]: null };
        }
    }

    handleSave(event) {
        event.preventDefault();

        // Validate form
        const validationResult = this.validateForm();

        if (validationResult.isValid) {
            // Format the form data for the event
            const formData = {
                id: 'ast' + Date.now(), // Generate a unique ID
                name: this.form.assessmentName,
                area: this.form.assessmentArea,
                recordType: this.form.recordType,
                status: this.form.status,
                statusClass: this.getStatusClass(this.form.status),
                createdBy: 'Current User',
                lastModifiedBy: 'Current User',
                createdDate: new Date().toISOString(),
                lastModifiedDate: new Date().toISOString()
            };

            // Dispatch save event with form data
            this.dispatchEvent(
                new CustomEvent('save', {
                    detail: formData
                })
            );

            // Close the modal
            this.dispatchEvent(new CustomEvent('close'));
        } else {
            // Update errors
            this.errors = validationResult.errors;
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Active':
                return 'status-active';
            case 'Inactive':
                return 'status-inactive';
            case 'Draft':
                return 'status-draft';
            case 'Archived':
                return 'status-archived';
            default:
                return '';
        }
    }

    validateForm() {
        const errors = {};
        let isValid = true;

        // Validate assessment name
        if (
            !this.form.assessmentName ||
            this.form.assessmentName.trim() === ''
        ) {
            errors.assessmentName = 'Assessment type name is required';
            isValid = false;
        }

        // Validate assessment area
        if (
            !this.form.assessmentArea ||
            this.form.assessmentArea.trim() === ''
        ) {
            errors.assessmentArea = 'Assessment area is required';
            isValid = false;
        }

        // Validate record type
        if (!this.form.recordType) {
            errors.recordType = 'Record type is required';
            isValid = false;
        }

        // Validate status
        if (!this.form.status) {
            errors.status = 'Status is required';
            isValid = false;
        }

        return {
            isValid,
            errors
        };
    }

    handleCancel() {
        // Dispatch close event
        this.dispatchEvent(new CustomEvent('close'));
    }

    // Computed classes for form fields
    get assessmentNameClass() {
        return this.errors.assessmentName
            ? 'form-element form-element--error'
            : 'form-element';
    }

    get assessmentAreaClass() {
        return this.errors.assessmentArea
            ? 'form-element form-element--error'
            : 'form-element';
    }

    get recordTypeClass() {
        return this.errors.recordType
            ? 'form-element form-element--error'
            : 'form-element';
    }

    get statusClass() {
        return this.errors.status
            ? 'form-element form-element--error'
            : 'form-element';
    }

    get modalTitle() {
        return this.recordType
            ? `New ${this.recordType.label}`
            : 'New Assessment Type';
    }

    get isAssessmentNameInvalid() {
        return !!this.errors.assessmentName;
    }

    get isAssessmentAreaInvalid() {
        return !!this.errors.assessmentArea;
    }

    get isRecordTypeInvalid() {
        return !!this.errors.recordType;
    }

    get isStatusInvalid() {
        return !!this.errors.status;
    }
}
