import { LightningElement, track } from 'lwc';

const STATUS_OPTIONS = [
    { label: 'Draft', value: 'Draft' },
    { label: 'Final', value: 'Final' },
    { label: 'Archived', value: 'Archived' }
];

const CATEGORY_OPTIONS = [
    { label: 'General', value: 'general' },
    { label: 'Safety', value: 'safety' },
    { label: 'Compliance', value: 'compliance' }
];

export default class ChecklistModal extends LightningElement {
    @track form = {
        checklistName: '',
        status: 'Draft',
        createdFor: '',
        checklistCategory: '',
        assessmentType: '',
        description: '',
        numberOfAssessments: 0
    };

    @track errors = {};

    // Field class getters
    get checklistNameClass() {
        return this.errors.checklistName
            ? 'form-group has-error'
            : 'form-group';
    }
    get statusClass() {
        return this.errors.status ? 'form-group has-error' : 'form-group';
    }
    get createdForClass() {
        return this.errors.createdFor ? 'form-group has-error' : 'form-group';
    }
    get checklistCategoryClass() {
        return this.errors.checklistCategory
            ? 'form-group has-error'
            : 'form-group';
    }
    get assessmentTypeClass() {
        return this.errors.assessmentType
            ? 'form-group has-error'
            : 'form-group';
    }

    // aria-invalid getters
    get isChecklistNameInvalid() {
        return this.errors.checklistName ? 'true' : 'false';
    }
    get isStatusInvalid() {
        return this.errors.status ? 'true' : 'false';
    }
    get isCreatedForInvalid() {
        return this.errors.createdFor ? 'true' : 'false';
    }
    get isChecklistCategoryInvalid() {
        return this.errors.checklistCategory ? 'true' : 'false';
    }
    get isAssessmentTypeInvalid() {
        return this.errors.assessmentType ? 'true' : 'false';
    }

    get statusOptions() {
        return STATUS_OPTIONS;
    }
    get categoryOptions() {
        return CATEGORY_OPTIONS;
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.form[name] = value;
        this.errors[name] = '';
    }

    validate() {
        let valid = true;
        this.errors = {};
        if (!this.form.checklistName) {
            this.errors.checklistName = 'Complete this field.';
            valid = false;
        }
        if (!this.form.status) {
            this.errors.status = 'Select a status.';
            valid = false;
        }
        if (!this.form.createdFor) {
            this.errors.createdFor = 'Complete this field.';
            valid = false;
        }
        if (!this.form.checklistCategory) {
            this.errors.checklistCategory = 'Select a category.';
            valid = false;
        }
        if (!this.form.assessmentType) {
            this.errors.assessmentType = 'Complete this field.';
            valid = false;
        }
        return valid;
    }

    handleSave(event) {
        event.preventDefault();
        if (this.validate()) {
            // TODO: Save logic
            this.closeModal();
        }
    }

    handleSaveAndNew(event) {
        event.preventDefault();
        if (this.validate()) {
            // TODO: Save logic
            this.resetForm();
        }
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    closeModal() {
        this.dispatchEvent(new CustomEvent('close'));
        this.resetForm();
    }

    resetForm() {
        this.form = {
            checklistName: '',
            status: 'Draft',
            createdFor: '',
            checklistCategory: '',
            assessmentType: '',
            description: '',
            numberOfAssessments: 0
        };
        this.errors = {};
    }

    connectedCallback() {
        // Step 5: Log lifecycle
        // eslint-disable-next-line no-console
        console.log('ChecklistModal connectedCallback: modal is rendered');
    }
}
