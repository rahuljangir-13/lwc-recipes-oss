import { LightningElement, api, track } from 'lwc';

export default class AssessmentType extends LightningElement {
    @api recordId;
    @track items = [];
    @track visibleItemCount = 5;
    @track openDropdown = null;
    @track showRecordTypeModal = false;
    @track showAssessmentModal = false;
    @track showAssessmentAreaModal = false;
    @track selectedRecordType = null;

    connectedCallback() {
        // Initialize mock data
        this.loadMockData();

        // Add click event listener to document to close dropdowns
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    disconnectedCallback() {
        // Remove click event listener when component is destroyed
        document.removeEventListener(
            'click',
            this.handleDocumentClick.bind(this)
        );
    }

    // Getters for rendering
    get hasItems() {
        return this.items.length > 0;
    }

    get noData() {
        return this.items.length === 0;
    }

    get visibleItems() {
        return this.items.slice(0, this.visibleItemCount);
    }

    /**
     * Returns true if we should show the View More button
     */
    get showViewMoreButton() {
        return this.items.length > this.visibleItemCount;
    }

    // Event handlers
    handleAssessmentClick(event) {
        const id = event.currentTarget.dataset.id;
        const selectedItem = this.items.find((item) => item.id === id);

        // Dispatch view event with the selected item
        this.dispatchEvent(
            new CustomEvent('view', {
                detail: selectedItem
            })
        );
    }

    handleToggleMenu(event) {
        const id = event.currentTarget.dataset.id;

        // Close any open dropdown
        const dropdowns = this.template.querySelectorAll('.dropdown-content');
        dropdowns.forEach((dropdown) => {
            if (dropdown.dataset.id !== id) {
                dropdown.classList.remove('show');
            }
        });

        // Toggle the clicked dropdown
        const clickedDropdown = this.template.querySelector(
            `.dropdown-content[data-id="${id}"]`
        );
        if (clickedDropdown) {
            clickedDropdown.classList.toggle('show');
        }

        // Stop event propagation
        event.stopPropagation();
    }

    // Handle New button click - show record type selection modal
    handleNewClick() {
        this.showRecordTypeModal = true;
    }

    // Handle record type modal close
    handleRecordTypeModalClose() {
        this.showRecordTypeModal = false;
    }

    // Handle record type selection
    handleRecordTypeSelect(event) {
        this.selectedRecordType = event.detail;
        this.showRecordTypeModal = false;

        // Open the appropriate modal based on record type
        if (this.selectedRecordType.value === 'assessmentArea') {
            this.showAssessmentAreaModal = true;
        } else {
            this.showAssessmentModal = true;
        }
    }

    // Handle assessment modal close
    handleAssessmentModalClose() {
        this.showAssessmentModal = false;
        this.selectedRecordType = null;
    }

    // Handle assessment area modal close
    handleAssessmentAreaModalClose() {
        this.showAssessmentAreaModal = false;
        this.selectedRecordType = null;
    }

    // Handle save from assessment modal
    handleSaveAssessment(event) {
        const newAssessment = event.detail;

        // Add the new assessment to the items array
        this.items = [newAssessment, ...this.items];

        // Close the modal
        this.showAssessmentModal = false;
        this.showAssessmentAreaModal = false;
        this.selectedRecordType = null;
    }

    handleEdit(event) {
        const id = event.currentTarget.dataset.id;
        const selectedItem = this.items.find((item) => item.id === id);

        // Dispatch edit event with the selected item
        this.dispatchEvent(
            new CustomEvent('edit', {
                detail: selectedItem
            })
        );

        // Close the dropdown
        this.closeAllDropdowns();
    }

    handleDelete(event) {
        const id = event.currentTarget.dataset.id;

        // Remove the item from the array
        this.items = this.items.filter((item) => item.id !== id);

        // Close the dropdown
        this.closeAllDropdowns();
    }

    handleViewMore() {
        // Increase the visible item count
        this.visibleItemCount += 5;
    }

    closeAllDropdowns() {
        const dropdowns = this.template.querySelectorAll('.dropdown-content');
        dropdowns.forEach((dropdown) => {
            dropdown.classList.remove('show');
        });
    }

    handleDocumentClick() {
        this.closeAllDropdowns();
    }

    loadMockData() {
        // Mock data for demo purposes
        this.items = [
            {
                id: 'ast1',
                name: 'Site Safety Assessment',
                area: 'Safety',
                recordType: 'Assessment Type',
                status: 'Active',
                statusClass: 'status-active',
                createdBy: 'John Doe',
                lastModifiedBy: 'Jane Smith',
                createdDate: '2023-05-15',
                lastModifiedDate: '2023-06-01'
            },
            {
                id: 'ast2',
                name: 'Quality Control Audit',
                area: 'Quality',
                recordType: 'Assessment Type',
                status: 'Draft',
                statusClass: 'status-draft',
                createdBy: 'Jane Smith',
                lastModifiedBy: 'Jane Smith',
                createdDate: '2023-06-10',
                lastModifiedDate: '2023-06-10'
            },
            {
                id: 'ast3',
                name: 'Environmental Compliance',
                area: 'Compliance',
                recordType: 'Assessment Type',
                status: 'Inactive',
                statusClass: 'status-inactive',
                createdBy: 'John Doe',
                lastModifiedBy: 'John Doe',
                createdDate: '2023-04-22',
                lastModifiedDate: '2023-05-10'
            }
        ];
    }
}
