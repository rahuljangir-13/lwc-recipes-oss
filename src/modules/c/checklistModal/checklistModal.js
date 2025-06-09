//checklistModal.js
import { LightningElement, track } from 'lwc';
import { isOnline } from 'c/utils';

// Endpoints for getting users and assessment types
const USERS_ENDPOINT =
    'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/findings/?operation=getAllUsers';
const ASSESSMENT_TYPES_ENDPOINT =
    'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/findings/?operation=getAllAssessmentType';

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
    @track isLoading = false;
    @track error = null;

    // Dropdown options
    @track userOptions = [];
    @track assessmentTypeOptions = [];

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
            this.errors.createdFor = 'Select a user.';
            valid = false;
        }
        if (!this.form.checklistCategory) {
            this.errors.checklistCategory = 'Select a category.';
            valid = false;
        }
        if (!this.form.assessmentType) {
            this.errors.assessmentType = 'Select an assessment type.';
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
        console.log('ChecklistModal connectedCallback: modal is rendered');
        // Fetch users and assessment types when component is connected
        this.fetchUsers();
        this.fetchAssessmentTypes();
    }

    fetchUsers() {
        this.isLoading = true;

        if (!isOnline()) {
            this.error = 'You are currently offline. Cannot fetch users.';
            this.isLoading = false;
            this.loadSampleUsers();
            return;
        }

        // In a real app, you would have a proper OAuth flow
        const sessionId =
            '00D7z00000P3CKp!AQEAQFKwmwBkDRjyqOFqec8P6JFs.lSfwBSthHyGfPUCPpJN2vUXUz6QE4UUMIAViND2smQ0Pwb2JY0vWTGLNsSW_sx8W1.Z';
        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };

        fetch(USERS_ENDPOINT, {
            method: 'GET',
            headers: headers,
            credentials: 'same-origin'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Fetched users data:', data);
                this.processUsersData(data);
            })
            .catch((error) => {
                console.error('Error fetching users:', error);
                this.error = `Failed to fetch users: ${error.message}`;
                this.loadSampleUsers();
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    fetchAssessmentTypes() {
        this.isLoading = true;

        if (!isOnline()) {
            this.error =
                'You are currently offline. Cannot fetch assessment types.';
            this.isLoading = false;
            this.loadSampleAssessmentTypes();
            return;
        }

        // In a real app, you would have a proper OAuth flow
        const sessionId =
            '00D7z00000P3CKp!AQEAQFKwmwBkDRjyqOFqec8P6JFs.lSfwBSthHyGfPUCPpJN2vUXUz6QE4UUMIAViND2smQ0Pwb2JY0vWTGLNsSW_sx8W1.Z';
        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };

        fetch(ASSESSMENT_TYPES_ENDPOINT, {
            method: 'GET',
            headers: headers,
            credentials: 'same-origin'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Fetched assessment types data:', data);
                this.processAssessmentTypesData(data);
            })
            .catch((error) => {
                console.error('Error fetching assessment types:', error);
                this.error = `Failed to fetch assessment types: ${error.message}`;
                this.loadSampleAssessmentTypes();
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    processUsersData(data) {
        try {
            // Parse the data if it's a string
            const parsedData =
                typeof data === 'string' ? JSON.parse(data) : data;

            // Check if data has the expected format
            const userData = parsedData.data || parsedData;
            console.log('line 261', userData);
            if (Array.isArray(userData)) {
                this.userOptions = userData.map((user) => ({
                    label: user.Name || 'Unknown User',
                    value: user.Id || user.userId || ''
                }));
            } else {
                throw new Error('Invalid user data format');
            }
        } catch (error) {
            console.error('Error processing user data:', error);
            this.loadSampleUsers();
        }
    }

    processAssessmentTypesData(data) {
        try {
            // Parse the data if it's a string
            const parsedData =
                typeof data === 'string' ? JSON.parse(data) : data;

            // Check if data has the expected format
            const assessmentTypeData = parsedData.data || parsedData;

            if (Array.isArray(assessmentTypeData)) {
                this.assessmentTypeOptions = assessmentTypeData.map((type) => ({
                    label: type.Name || 'Unknown Type',
                    value: type.Id || type.typeId || ''
                }));
            } else {
                throw new Error('Invalid assessment type data format');
            }
        } catch (error) {
            console.error('Error processing assessment type data:', error);
            this.loadSampleAssessmentTypes();
        }
    }

    loadSampleUsers() {
        this.userOptions = [
            { label: 'John Doe', value: 'user1' },
            { label: 'Jane Smith', value: 'user2' },
            { label: 'Robert Johnson', value: 'user3' }
        ];
    }

    loadSampleAssessmentTypes() {
        this.assessmentTypeOptions = [
            { label: 'Safety Assessment', value: 'type1' },
            { label: 'Quality Control', value: 'type2' },
            { label: 'Environmental Compliance', value: 'type3' }
        ];
    }
}
