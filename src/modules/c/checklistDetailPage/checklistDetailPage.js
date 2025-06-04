import { LightningElement, api, track } from 'lwc';

export default class ChecklistDetailPage extends LightningElement {
    @api recordId;
    @api
    get detail() {
        return this._detail;
    }
    set detail(value) {
        this._detail = value;
        this.isLoading = false;
    }

    @track _detail = null;
    isLoading = true;

    // Tab state
    activeTab = 'details'; // details, questions, files, or preview

    // Section expansion state
    isInformationExpanded = true;
    isAdditionalExpanded = true;

    // Checkbox state
    isRecurringAssessment = false;

    connectedCallback() {
        // Initialize loading state
        this.isLoading = true;

        // If detail is not passed in, we would typically fetch it
        if (!this._detail && this.recordId) {
            // Fetch details immediately instead of using setTimeout
            this.fetchDetail();
        } else {
            // If detail is passed in, just use it
            this.isLoading = false;
        }
    }

    // Tab-related getters
    get isDetailsTabActive() {
        return this.activeTab === 'details';
    }

    get isQuestionsTabActive() {
        return this.activeTab === 'questions';
    }

    get isFilesTabActive() {
        return this.activeTab === 'files';
    }

    get isPreviewTabActive() {
        return this.activeTab === 'preview';
    }

    get detailsTabClass() {
        return this.activeTab === 'details'
            ? 'tab-item tab-active'
            : 'tab-item tab-inactive';
    }

    get questionsTabClass() {
        return this.activeTab === 'questions'
            ? 'tab-item tab-active'
            : 'tab-item tab-inactive';
    }

    get filesTabClass() {
        return this.activeTab === 'files'
            ? 'tab-item tab-active'
            : 'tab-item tab-inactive';
    }

    get previewTabClass() {
        return this.activeTab === 'preview'
            ? 'tab-item tab-active'
            : 'tab-item tab-inactive';
    }

    // Sidebar-related getters
    get detailsStepClass() {
        return this.activeTab === 'details' ? 'step active completed' : 'step';
    }

    get questionsStepClass() {
        return this.activeTab === 'questions' ? 'step active' : 'step';
    }

    get filesStepClass() {
        return this.activeTab === 'files' ? 'step active' : 'step';
    }

    get previewStepClass() {
        return this.activeTab === 'preview' ? 'step active' : 'step';
    }

    // Section expansion getters
    get informationContentClass() {
        return this.isInformationExpanded
            ? 'section-content'
            : 'section-content section-content-hidden';
    }

    get additionalContentClass() {
        return this.isAdditionalExpanded
            ? 'section-content'
            : 'section-content section-content-hidden';
    }

    // Tab handlers
    handleDetailsTab() {
        this.activeTab = 'details';
    }

    handleQuestionsTab() {
        this.activeTab = 'questions';
    }

    handleFilesTab() {
        this.activeTab = 'files';
    }

    handlePreviewTab() {
        this.activeTab = 'preview';
    }

    // Section toggle handlers
    toggleInformationSection() {
        this.isInformationExpanded = !this.isInformationExpanded;
    }

    toggleAdditionalSection() {
        this.isAdditionalExpanded = !this.isAdditionalExpanded;
    }

    // Checkbox handler
    handleRecurringCheckboxChange(event) {
        this.isRecurringAssessment = event.target.checked;
    }

    // Navigate to customer record
    handleCustomerClick() {
        // This would typically navigate to the customer record
        console.log('Navigate to customer record:', this._detail?.customer);
    }

    fetchDetail() {
        // In a real application, this would be an API call
        // For demo purposes, we'll create a mock detail
        const mockDetail = {
            id: this.recordId,
            name: 'Assessment 16-05',
            status: 'Closed',
            category: 'Health & Safety',
            checklist: 'SIF Alert',
            occurrence: 'One Time',
            startDate: '5/1/2025',
            endDate: '5/31/2025',
            customer: 'Alpha Corporation',
            description: 'description',
            orgComponent: 'Spare Parts Room',
            createdBy: 'John Smith',
            lastModifiedBy: 'Jane Doe',
            createdDate: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(), // 7 days ago
            lastModifiedDate: new Date().toISOString()
        };

        // Format dates
        mockDetail.formattedCreatedDate = this.formatDate(
            mockDetail.createdDate
        );
        mockDetail.formattedLastModifiedDate = this.formatDate(
            mockDetail.lastModifiedDate
        );

        this._detail = mockDetail;
        this.isLoading = false;
    }

    formatDate(dateString) {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return '';
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }

    get hasDetail() {
        return this._detail !== null;
    }

    get statusClass() {
        if (!this._detail || !this._detail.status) return 'status-default';

        const normalizedStatus = this._detail.status.toLowerCase();

        switch (normalizedStatus) {
            case 'completed':
            case 'done':
            case 'finished':
            case 'closed':
                return 'status-completed';

            case 'in progress':
            case 'ongoing':
            case 'started':
                return 'status-in-progress';

            case 'pending':
            case 'not started':
            case 'todo':
                return 'status-pending';

            case 'blocked':
            case 'stopped':
            case 'halted':
                return 'status-blocked';

            default:
                return 'status-default';
        }
    }

    handleBack() {
        // Dispatch an event to notify parent component to go back to the list view
        this.dispatchEvent(new CustomEvent('back'));
    }

    handleEdit() {
        // Dispatch an event to notify parent component to open edit mode
        this.dispatchEvent(
            new CustomEvent('edit', {
                detail: {
                    recordId: this.recordId,
                    record: this._detail
                }
            })
        );
    }

    handleDelete() {
        // Dispatch an event to notify parent component to delete this record
        this.dispatchEvent(
            new CustomEvent('delete', {
                detail: {
                    recordId: this.recordId
                }
            })
        );
    }
}
