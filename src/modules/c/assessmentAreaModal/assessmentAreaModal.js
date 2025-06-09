import { LightningElement, track } from 'lwc';

export default class AssessmentAreaModal extends LightningElement {
    @track form = {
        assessmentArea: '',
        status: 'Active'
    };

    @track errors = {};

    statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Draft', value: 'Draft' }
    ];

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
                id: 'area' + Date.now(), // Generate a unique ID
                name: this.form.assessmentArea, // Use assessment area as the name
                area: this.form.assessmentArea,
                recordType: 'Assessment Area', // Hardcoded for this modal
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
            default:
                return '';
        }
    }

    validateForm() {
        const errors = {};
        let isValid = true;

        // Validate assessment area
        if (
            !this.form.assessmentArea ||
            this.form.assessmentArea.trim() === ''
        ) {
            errors.assessmentArea = 'Assessment area is required';
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
    get assessmentAreaClass() {
        return this.errors.assessmentArea
            ? 'form-element form-element--error'
            : 'form-element';
    }

    get statusClass() {
        return this.errors.status
            ? 'form-element form-element--error'
            : 'form-element';
    }

    get isAssessmentAreaInvalid() {
        return !!this.errors.assessmentArea;
    }

    get isStatusInvalid() {
        return !!this.errors.status;
    }
}
