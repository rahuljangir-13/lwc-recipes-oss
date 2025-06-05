import { LightningElement, track } from 'lwc';

export default class AssessmentTypeDemo extends LightningElement {
    @track assessmentItems = [
        {
            id: 'ast1',
            name: 'Site Safety Assessment',
            area: 'Safety',
            recordType: 'Assessment Type',
            status: 'Active',
            statusClass: 'status-active',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast2',
            name: 'Quality Control Audit',
            area: 'Quality',
            recordType: 'Assessment Type',
            status: 'Draft',
            statusClass: 'status-draft',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 14 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast3',
            name: 'Environmental Compliance',
            area: 'Compliance',
            recordType: 'Assessment Type',
            status: 'Inactive',
            statusClass: 'status-inactive',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 21 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast4',
            name: 'Assessment Type',
            area: 'a',
            recordType: 'Assessment Area',
            status: 'Active',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast5',
            name: 'Assessment Type',
            area: 'Area',
            recordType: 'Assessment Area',
            status: 'Inactive',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 45 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast6',
            name: 'Assessment Type',
            area: 'Akansha',
            recordType: 'Assessment Area',
            status: 'Draft',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 60 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast7',
            name: 'Assessment Type',
            area: 'Ak1',
            recordType: 'Assessment Area',
            status: 'Active',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 75 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast8',
            name: 'Assessment Type',
            area: 'trial',
            recordType: 'Assessment Area',
            status: 'Archived',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 90 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast9',
            name: 'Assessment Type',
            area: 'Test',
            recordType: 'Assessment Area',
            status: 'Active',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 105 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast10',
            name: 'New',
            area: null,
            recordType: 'Assessment Type',
            status: 'Active',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 120 * 24 * 60 * 60 * 1000
            ).toISOString()
        },
        {
            id: 'ast11',
            name: 'New',
            area: 'Trial1',
            recordType: 'Assessment Area',
            status: 'Active',
            createdBy: 'John Doe',
            lastModifiedBy: 'Jane Smith',
            lastModifiedDate: new Date().toISOString(),
            createdDate: new Date(
                Date.now() - 135 * 24 * 60 * 60 * 1000
            ).toISOString()
        }
    ];

    @track showRecordTypeModal = false;
    @track showAssessmentModal = false;
    @track showAssessmentAreaModal = false;
    @track selectedRecordType = null;
    @track editingAssessment = null;
    @track selectedAssessment = null;

    // Handle New button click - show record type selection modal
    handleNewClick() {
        this.showRecordTypeModal = true;
    }

    // Handle record type modal close
    handleCloseRecordTypeModal() {
        this.showRecordTypeModal = false;
        this.selectedRecordType = null;
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
    handleCloseAssessmentModal() {
        this.showAssessmentModal = false;
        this.editingAssessment = null;
        this.selectedRecordType = null;
    }

    // Handle assessment area modal close
    handleCloseAssessmentAreaModal() {
        this.showAssessmentAreaModal = false;
        this.editingAssessment = null;
        this.selectedRecordType = null;
    }

    // Handle view assessment
    handleViewItem(event) {
        const selectedItem = event.detail;
        this.selectedAssessment = selectedItem;
        console.log('Assessment selected:', selectedItem);

        // In a real application, you would navigate to the detail view
        // or show a detail modal for the selected item
    }

    // Handle edit assessment
    handleEditItem(event) {
        const selectedItem = event.detail;
        console.log('Edit assessment:', selectedItem);
        this.editingAssessment = selectedItem;

        // Open the appropriate modal based on record type
        if (selectedItem.recordType === 'Assessment Area') {
            this.showAssessmentAreaModal = true;
        } else {
            this.showAssessmentModal = true;
        }
    }

    // Handle delete assessment
    handleDeleteItem(event) {
        const itemId = event.detail.id;
        console.log('Delete assessment:', itemId);

        // Filter out the deleted item
        this.assessmentItems = this.assessmentItems.filter(
            (item) => item.id !== itemId
        );
    }

    // Handle save assessment
    handleSaveAssessment(event) {
        const newAssessment = event.detail;
        console.log('Save assessment:', newAssessment);

        if (this.editingAssessment) {
            // Update existing assessment
            const updatedItems = [];

            for (let i = 0; i < this.assessmentItems.length; i++) {
                const item = this.assessmentItems[i];
                if (item.id === this.editingAssessment.id) {
                    updatedItems.push({ ...newAssessment, id: item.id });
                } else {
                    updatedItems.push(item);
                }
            }

            this.assessmentItems = updatedItems;
        } else {
            // Add new assessment
            this.assessmentItems = [newAssessment, ...this.assessmentItems];
        }

        // Reset state
        this.showAssessmentModal = false;
        this.showAssessmentAreaModal = false;
        this.editingAssessment = null;
        this.selectedRecordType = null;
    }
}
