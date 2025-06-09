import { LightningElement, track } from 'lwc';
import * as utils from 'c/utils';
import { isOnline } from 'c/utils';

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

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

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

    // Form UI classes
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

    // Aria invalid flags
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

    // Picklist options
    get statusOptions() {
        return STATUS_OPTIONS;
    }
    get categoryOptions() {
        return CATEGORY_OPTIONS;
    }

    // Field change handler
    handleInputChange(event) {
        const { name, value } = event.target;
        this.form[name] = value;
        this.errors[name] = '';
    }

    // Basic validation
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

    // Offline-first create
    async createChecklistOffline() {
        const newChecklist = {
            ...this.form,
            id: generateId(),
            createdDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString()
        };

        console.log('📴 Creating checklist offline:', newChecklist);

        try {
            await utils.saveItem(utils.STORE_NAMES.CHECKLISTS, newChecklist);
            console.log('💾 Checklist saved to IndexedDB');

            await utils.addPendingOperation({
                type: 'CREATE_CHECKLIST',
                timestamp: Date.now(),
                data: newChecklist
            });

            console.log('📝 Checklist queued for sync');
            return newChecklist;
        } catch (error) {
            console.error('❌ Failed to save checklist offline:', error);
            throw error;
        }
    }

    // Save handler
    async handleSave(event) {
        event.preventDefault();
        if (this.validate()) {
            if (isOnline()) {
                console.log(
                    '🌐 Online mode: checklist save not implemented yet'
                );
                // Future: call API here
            } else {
                await this.createChecklistOffline();
            }
            this.closeModal();
        }
    }

    // Save and reset form
    async handleSaveAndNew(event) {
        event.preventDefault();
        if (this.validate()) {
            if (isOnline()) {
                console.log(
                    '🌐 Online mode: checklist save not implemented yet'
                );
                // Future: call API here
            } else {
                await this.createChecklistOffline();
            }
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
        console.log('ChecklistModal connectedCallback: modal is rendered');
    }
}
