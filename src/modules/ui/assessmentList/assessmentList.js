import { LightningElement, track } from 'lwc';

export default class AssessmentList extends LightningElement {
    @track assessments = [];
    @track isLoading = true;
    @track error = null;
    @track selectedAssessments = new Set();
    @track searchTerm = '';
    @track currentPage = 1;
    @track pageSize = 20;
    @track totalRecords = 0;
    @track showCreateModal = false;
    @track newAssessment = {
        assessmentName: '',
        checklistName: '',
        checklistId: '',
        associatedCustomer: '',
        associatedCustomerId: '',
        category: '',
        startDate: '',
        endDate: '',
        frequency: '',
        status: 'Not Started',
        description: ''
    };
    @track checklistTemplateOptions = [];
    @track associatedCustomerOptions = [];
    @track isLoadingPicklists = false;
    @track picklistError = null;
    @track toastInfo = {
        title: '',
        message: '',
        variant: 'info',
        visible: false
    };
    @track toastTimeout; // Define valid category options (matching Salesforce picklist API names)
    categoryOptions = [
        { label: 'Business Continuity', value: 'Business Continuity' },
        { label: 'ESG', value: 'ESG' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Health & Safety', value: 'Health & Safety' },
        { label: 'Information Technology', value: 'Information Technology' },
        { label: 'Legal', value: 'Legal' },
        { label: 'Operations', value: 'Operations' },
        { label: 'Product Compliance', value: 'Product Compliance' },
        { label: 'Quality', value: 'Quality' },
        { label: 'Supplier Assessment', value: 'Supplier Assessment' },
        { label: 'Supplier Capabilities', value: 'Supplier Capabilities' }
    ];

    // Define valid frequency options (matching Salesforce picklist API names)
    frequencyOptions = [
        { label: 'One Time', value: 'One Time' },
        { label: 'Daily', value: 'Daily' },
        { label: 'Weekly', value: 'Weekly' },
        { label: 'Monthly', value: 'Monthly' },
        { label: 'Annually', value: 'Annually' }
    ];

    connectedCallback() {
        this.getCountsData();
    }

    getCountsData() {
        console.log('Fetching counts data from Salesforce...');
        const sessionId =
            '00D7z00000P3CKp!AQEAQJCFx4pttAqtA0yYYLVni.Q.HytoxiCgxHcU4Q4FmKEXusshlZhPKHJyD4OTk0dKC21ZdJLM5iNVhmfaR85skprakHjP';
        const APEX_REST_ENDPOINT_URL_3 =
            'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/lwcossassessments/?operation=getAllAssessments';

        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };

        fetch(APEX_REST_ENDPOINT_URL_3, {
            method: 'GET',
            mode: 'cors',
            headers: headers
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        console.error(
                            `❌ HTTP error! status: ${response.status}, message: ${text}`
                        );
                        throw new Error(
                            `HTTP error! status: ${response.status}, message: ${text}`
                        );
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log('Fetched Assesment:', data.assessments);
                if (data.success) {
                    this.assessments = this.mapAssessmentData(data.assessments);
                    console.log(
                        'Assessments loaded successfully:',
                        this.assessments.length
                    );
                    this.isLoading = false;
                    this.error = null;
                } else {
                    throw new Error(
                        data.message || 'Failed to fetch assessments'
                    );
                }
            });
    }

    mapAssessmentData(salesforceAssessments) {
        return salesforceAssessments.map((assessment) => ({
            id: assessment.Id,
            assessmentName: assessment.Name,
            checklistName:
                assessment.Rhythm__Template__r?.Name ||
                assessment.Rhythm__Template__c ||
                '',
            associatedCustomer:
                assessment.Rhythm__Customer__r?.Name ||
                assessment.Rhythm__Customer__c ||
                '',
            startDate: assessment.Rhythm__Start_Date__c,
            endDate: assessment.Rhythm__End_Date__c,
            status: this.mapStatusFromSalesforce(
                assessment.Rhythm__StatusFormula__c
            ), // Use mapStatusFromSalesforce here
            category: assessment.Rhythm__Category__c,
            frequency: assessment.Rhythm__Frequency__c,
            description: assessment.Rhythm__Description__c,
            createdDate: assessment.CreatedDate,
            lastModifiedDate: assessment.LastModifiedDate,
            createdBy: assessment.CreatedBy ? assessment.CreatedBy.Name : '',
            lastModifiedBy: assessment.LastModifiedBy
                ? assessment.LastModifiedBy.Name
                : ''
        }));
    }

    mapStatusFromSalesforce(statusFormula) {
        if (!statusFormula) return 'Not Started';

        const lowerStatus = statusFormula.toLowerCase();
        // Add more comprehensive checks if Salesforce returns complex HTML/image tags
        if (
            lowerStatus.includes('completed') ||
            lowerStatus.includes('complete')
        ) {
            return 'Completed';
        }
        if (
            lowerStatus.includes('in progress') ||
            lowerStatus.includes('in-progress') ||
            lowerStatus.includes('active')
        ) {
            return 'In Progress';
        }
        if (lowerStatus.includes('pending') || lowerStatus.includes('draft')) {
            return 'Pending';
        }
        if (
            lowerStatus.includes('not started') ||
            lowerStatus.includes('new')
        ) {
            return 'Not Started';
        }
        // Default if no specific keyword is found, or if it's an unrecognized formula
        return 'Pending'; // Or 'Not Started' or a generic status
    }

    loadSampleData() {
        this.assessments = [
            {
                id: '1',
                assessmentName: 'Security Assessment Q1 2024',
                checklistName: 'Security Compliance Checklist',
                associatedCustomer: 'Acme Corporation',
                startDate: '2024-01-15',
                endDate: '2024-02-15',
                status: 'Completed'
            },
            {
                id: '2',
                assessmentName: 'Infrastructure Audit',
                checklistName: 'IT Infrastructure Checklist',
                associatedCustomer: 'TechCorp Solutions',
                startDate: '2024-02-01',
                endDate: '2024-03-01',
                status: 'In Progress'
            },
            {
                id: '3',
                assessmentName: 'Compliance Review 2024',
                checklistName: 'Regulatory Compliance Checklist',
                associatedCustomer: 'Global Industries Ltd',
                startDate: '2024-01-20',
                endDate: '2024-02-20',
                status: 'Pending'
            }
        ];
    }

    get formattedAssessments() {
        let filteredAssessments = this.assessments;

        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            filteredAssessments = this.assessments.filter(
                (assessment) =>
                    assessment.assessmentName
                        .toLowerCase()
                        .includes(searchLower) ||
                    assessment.checklistName
                        .toLowerCase()
                        .includes(searchLower) ||
                    assessment.associatedCustomer
                        .toLowerCase()
                        .includes(searchLower) ||
                    assessment.status.toLowerCase().includes(searchLower)
            );
        }

        this.totalRecords = filteredAssessments.length;

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const paginatedAssessments = filteredAssessments.slice(
            startIndex,
            endIndex
        );

        return paginatedAssessments.map((assessment) => ({
            ...assessment,
            statusClass: this.getStatusClass(assessment.status),
            formattedStartDate: this.formatDate(assessment.startDate),
            formattedEndDate: this.formatDate(assessment.endDate)
        }));
    }

    get totalPages() {
        return Math.ceil(this.totalRecords / this.pageSize);
    }

    get hasMultiplePages() {
        return this.totalPages > 1;
    }

    get hasPreviousPage() {
        return this.currentPage > 1;
    }

    get hasNextPage() {
        return this.currentPage < this.totalPages;
    }

    get paginationInfo() {
        const startRecord = (this.currentPage - 1) * this.pageSize + 1;
        const endRecord = Math.min(
            this.currentPage * this.pageSize,
            this.totalRecords
        );
        return `Showing ${startRecord}-${endRecord} of ${this.totalRecords} items`;
    }

    get pageNumbers() {
        const pages = [];
        const totalPages = this.totalPages;
        const currentPage = this.currentPage;

        let startPage = Math.max(1, currentPage - 3);
        let endPage = Math.min(totalPages, startPage + 6);

        if (endPage - startPage < 6) {
            startPage = Math.max(1, endPage - 6);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push({
                number: i,
                isActive: i === currentPage,
                class: i === currentPage ? 'page-btn active' : 'page-btn'
            });
        }

        return pages;
    }

    getStatusClass(status) {
        switch (status) {
            case 'Completed':
                return 'status-completed';
            case 'In Progress':
                return 'status-in-progress';
            case 'Pending':
                return 'status-pending';
            case 'Not Started':
                return 'status-not-started';
            default:
                return 'status-default';
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.currentPage = 1;
    }

    handlePreviousPage() {
        if (this.hasPreviousPage) {
            this.currentPage--;
        }
    }

    handleNextPage() {
        if (this.hasNextPage) {
            this.currentPage++;
        }
    }

    handleFirstPage() {
        this.currentPage = 1;
    }

    handleLastPage() {
        this.currentPage = this.totalPages;
    }

    handlePageClick(event) {
        const pageNumber = parseInt(event.target.dataset.page, 10);
        if (pageNumber && pageNumber !== this.currentPage) {
            this.currentPage = pageNumber;
        }
    }

    handlePageSizeChange(event) {
        this.pageSize = parseInt(event.target.value, 10);
        this.currentPage = 1;
    }

    handleFilter() {
        console.log('Filter functionality triggered');
    }

    handleGroupBy() {
        console.log('Group by functionality triggered');
    }

    handleBulkActions() {
        console.log('Bulk actions functionality triggered');
    }

    handleCustomizeTable() {
        console.log('Customize table functionality triggered');
    }

    handleListView() {
        console.log('List view selected');
        const listBtn = this.template.querySelector('.list-view');
        const cardBtn = this.template.querySelector('.card-view');
        listBtn.classList.add('active');
        cardBtn.classList.remove('active');
    }

    handleCardView() {
        console.log('Card view selected');
        const listBtn = this.template.querySelector('.list-view');
        const cardBtn = this.template.querySelector('.card-view');
        cardBtn.classList.add('active');
        listBtn.classList.remove('active');
    }

    handleExport() {
        console.log('Export functionality triggered');
    }

    handleCreateAssessment() {
        console.log('Opening create assessment modal');
        this.showCreateModal = true;
        this.newAssessment = {
            assessmentName: '',
            checklistName: '',
            associatedCustomer: '',
            category: '',
            startDate: '',
            endDate: '',
            frequency: '',
            status: 'Not Started',
            description: ''
        };
        this.fetchPicklistData();
    }

    handleCloseModal() {
        this.showCreateModal = false;
    }
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;

        // Handle special cases for checklist and customer to store both ID and display value
        if (field === 'checklistName') {
            const selectedOption = this.checklistTemplateOptions.find(
                (option) => option.value === value
            );
            if (selectedOption) {
                this.newAssessment = {
                    ...this.newAssessment,
                    checklistId: value, // Store the ID
                    checklistName: selectedOption.displayValue // Store the display name
                };
            }
        } else if (field === 'associatedCustomer') {
            const selectedOption = this.associatedCustomerOptions.find(
                (option) => option.value === value
            );
            if (selectedOption) {
                this.newAssessment = {
                    ...this.newAssessment,
                    associatedCustomerId: value, // Store the ID
                    associatedCustomer: selectedOption.displayValue // Store the display name
                };
            }
        } else {
            // Handle regular fields
            this.newAssessment = {
                ...this.newAssessment,
                [field]: value
            };
        }
    }
    handleSaveAssessment() {
        if (
            !this.newAssessment.assessmentName ||
            !this.newAssessment.checklistName ||
            !this.newAssessment.associatedCustomer ||
            !this.newAssessment.startDate ||
            !this.newAssessment.endDate ||
            !this.newAssessment.category ||
            !this.newAssessment.frequency
        ) {
            this.showToast(
                'Error',
                'Please fill in all required fields.',
                'error'
            );
            return;
        }

        if (
            new Date(this.newAssessment.startDate) >
            new Date(this.newAssessment.endDate)
        ) {
            this.showToast(
                'Error',
                'End date must be after start date.',
                'error'
            );
            return;
        }

        this.isLoading = true;
        const assessmentData = {
            Name: this.newAssessment.assessmentName,
            Rhythm__Template__c: this.newAssessment.checklistId, // Use the ID for Salesforce
            Rhythm__Customer__c: this.newAssessment.associatedCustomerId, // Use the ID for Salesforce
            Rhythm__Start_Date__c: this.newAssessment.startDate,
            Rhythm__End_Date__c: this.newAssessment.endDate,
            Rhythm__Category__c: this.newAssessment.category || '',
            Rhythm__Frequency__c: this.newAssessment.frequency || '',
            Rhythm__Description__c: this.newAssessment.description || ''
        };

        const sessionId =
            '00D7z00000P3CKp!AQEAQJCFx4pttAqtA0yYYLVni.Q.HytoxiCgxHcU4Q4FmKEXusshlZhPKHJyD4OTk0dKC21ZdJLM5iNVhmfaR85skprakHjP'; // NEVER expose sessionId in client-side code in production
        const APEX_REST_ENDPOINT_URL =
            'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/lwcossassessments/';

        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };

        const requestBody = {
            operation: 'create',
            data: assessmentData
        };
        console.log('Request body:', requestBody);

        fetch(APEX_REST_ENDPOINT_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        throw new Error(
                            `HTTP error! status: ${response.status}, message: ${text}`
                        );
                    });
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    // Find the display names for checklist and customer
                    const checklistOption = this.checklistTemplateOptions.find(
                        (opt) => opt.value === this.newAssessment.checklistId
                    );
                    const customerOption = this.associatedCustomerOptions.find(
                        (opt) =>
                            opt.value ===
                            this.newAssessment.associatedCustomerId
                    );
                    const newAssessmentRecord = {
                        id: data.createdAssessment.Id,
                        assessmentName: data.createdAssessment.Name,
                        checklistName: checklistOption
                            ? checklistOption.label
                            : this.newAssessment.checklistName,
                        associatedCustomer: customerOption
                            ? customerOption.label
                            : this.newAssessment.associatedCustomer,
                        startDate: data.createdAssessment.Rhythm__Start_Date__c,
                        endDate: data.createdAssessment.Rhythm__End_Date__c,
                        category: data.createdAssessment.Rhythm__Category__c,
                        frequency: data.createdAssessment.Rhythm__Frequency__c,
                        description:
                            data.createdAssessment.Rhythm__Description__c,
                        status: 'Not Started',
                        createdDate: new Date().toISOString(),
                        lastModifiedDate: new Date().toISOString(),
                        createdBy: 'Current User',
                        lastModifiedBy: 'Current User'
                    };

                    this.assessments = [
                        ...this.assessments,
                        newAssessmentRecord
                    ];
                    this.showCreateModal = false;
                    this.isLoading = false;
                    this.showToast(
                        'Success',
                        'Assessment created successfully',
                        'success'
                    );
                } else {
                    throw new Error(
                        data.message || 'Failed to create assessment'
                    );
                }
            })
            .catch((error) => {
                this.isLoading = false;
                this.error = error.message || 'Error creating assessment';
                this.showToast('Error', this.error, 'error');
                console.error('Error creating assessment:', error);
            });
    }

    handleMoreActions() {
        console.log('More actions menu triggered');
    }

    handleSelectAll(event) {
        const isChecked = event.target.checked;
        const checkboxes = this.template.querySelectorAll('.row-checkbox');

        checkboxes.forEach((checkbox) => {
            checkbox.checked = isChecked;
        });

        if (isChecked) {
            this.assessments.forEach((assessment) => {
                this.selectedAssessments.add(assessment.id);
            });
        } else {
            this.selectedAssessments.clear();
        }
    }

    handleRowSelect(event) {
        const assessmentId = event.target.dataset.id;
        const isChecked = event.target.checked;

        if (isChecked) {
            this.selectedAssessments.add(assessmentId);
        } else {
            this.selectedAssessments.delete(assessmentId);
        }

        const selectAllCheckbox = this.template.querySelector(
            '.select-all-checkbox'
        );
        const allCheckboxes = this.template.querySelectorAll('.row-checkbox');
        const checkedCheckboxes = this.template.querySelectorAll(
            '.row-checkbox:checked'
        );

        selectAllCheckbox.checked =
            allCheckboxes.length === checkedCheckboxes.length;
        selectAllCheckbox.indeterminate =
            checkedCheckboxes.length > 0 &&
            checkedCheckboxes.length < allCheckboxes.length;
    }

    handleModalContentClick(event) {
        event.stopPropagation();
    }
    get isFormInvalid() {
        return (
            !this.newAssessment.assessmentName ||
            !this.newAssessment.checklistName ||
            !this.newAssessment.associatedCustomer ||
            !this.newAssessment.startDate ||
            !this.newAssessment.endDate ||
            !this.newAssessment.category ||
            !this.newAssessment.frequency
        );
    }

    fetchPicklistData() {
        this.isLoadingPicklists = true;
        this.picklistError = null;

        const sessionId =
            '00D7z00000P3CKp!AQEAQJCFx4pttAqtA0yYYLVni.Q.HytoxiCgxHcU4Q4FmKEXusshlZhPKHJyD4OTk0dKC21ZdJLM5iNVhmfaR85skprakHjP';
        const APEX_REST_ENDPOINT_URL_3 =
            'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/fetchData/';

        const headers = {
            Authorization: `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
        };

        fetch(APEX_REST_ENDPOINT_URL_3, {
            method: 'GET',
            headers: headers
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Fetched picklist data:', data);
                if (data.templates && Array.isArray(data.templates)) {
                    this.checklistTemplateOptions = data.templates.map(
                        (template) => ({
                            label: template.Name,
                            value: template.Id, // Store the ID as the value
                            displayValue: template.Name, // Store the name for display
                            icon: this.getTemplateIcon(template.Name)
                        })
                    );
                }

                if (data.accounts && Array.isArray(data.accounts)) {
                    this.associatedCustomerOptions = data.accounts.map(
                        (account) => ({
                            label: account.Name,
                            value: account.Id, // Store the ID as the value
                            displayValue: account.Name // Store the name for display
                        })
                    );
                }

                this.isLoadingPicklists = false;
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                this.picklistError =
                    'Failed to load dropdown options. Please try again.';
                this.isLoadingPicklists = false;
            });
    }

    getTemplateIcon(templateName) {
        const name = templateName.toLowerCase();
        if (name.includes('security')) return '🛡️';
        if (name.includes('infrastructure') || name.includes('it')) return '💻';
        if (name.includes('regulatory') || name.includes('compliance'))
            return '📊';
        if (name.includes('privacy') || name.includes('data')) return '🔒';
        if (name.includes('quality') || name.includes('assurance')) return '✅';
        if (name.includes('risk')) return '⚠️';
        return '📝';
    }

    // iPad/Tablet View switching functionality
    showListView() {
        this.isListView = true;
        this.isCardView = false;
    }

    showCardView() {
        this.isListView = false;
        this.isCardView = true;
    }

    // Prevent event propagation for nested elements
    stopPropagation(event) {
        event.stopPropagation();
    }

    // View Assessment details
    handleViewAssessment(event) {
        const assessmentId = event.target.dataset.id;
        console.log('View assessment clicked for ID:', assessmentId);
        // This would normally navigate to the assessment page
    }
    // Show toast/notification messages
    showToast(title, message, variant) {
        // Create a custom event to display toast notification
        const event = new CustomEvent('toast', {
            detail: {
                title: title,
                message: message,
                variant: variant // success, error, warning, info
            }
        });
        this.dispatchEvent(event);

        // Also log to console for debugging
        console.log(`${variant.toUpperCase()}: ${title} - ${message}`);

        // Set a property to show toast in the UI
        this.toastInfo = {
            title,
            message,
            variant,
            visible: true
        };

        // Use a promise to clear the toast after a delay (LWC compliant)
        Promise.resolve().then(() => {
            window.clearTimeout(this.toastTimeout);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this.toastTimeout = setTimeout(() => {
                this.toastInfo = { ...this.toastInfo, visible: false };
            }, 3000);
        });
    }

    // Hide toast notification
    hideToast() {
        this.toastInfo.visible = false;
        window.clearTimeout(this.toastTimeout);
    }

    // Compute toast class based on variant
    get toastClass() {
        return `toast-notification toast-${this.toastInfo.variant}`;
    }
}
