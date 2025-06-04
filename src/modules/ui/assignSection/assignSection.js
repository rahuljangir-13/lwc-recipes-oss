import { LightningElement, api, track } from 'lwc';

export default class AssignSection extends LightningElement {
    @api recordId;
    @track assignmentScope = 'All Suppliers';

    // Initialize the dropdown when component is connected
    renderedCallback() {
        const selectElement = this.template.querySelector('#scope-select');
        if (selectElement) {
            // Set the selected value based on assignmentScope
            selectElement.value = this.assignmentScope;
        }
    }

    @track suppliers = [
        {
            id: '1',
            name: 'ABC Manufacturing',
            address: '123 Industrial Pkwy, Detroit, MI 48127',
            dateAdded: '5/1/2025'
        },
        {
            id: '2',
            name: 'XYZ Components',
            address: '456 Production Ave, Chicago, IL 60007',
            dateAdded: '5/1/2025'
        },
        {
            id: '3',
            name: 'Precision Parts Inc',
            address: '789 Assembly Rd, Cleveland, OH 44101',
            dateAdded: '5/2/2025'
        },
        {
            id: '4',
            name: 'Global Supplies Ltd',
            address: '321 Export Plaza, Atlanta, GA 30301',
            dateAdded: '5/3/2025'
        },
        {
            id: '5',
            name: 'Tech Solutions Corp',
            address: '555 Innovation Dr, San Jose, CA 95110',
            dateAdded: '5/3/2025'
        }
    ];

    scopeOptions = [
        { label: 'All Suppliers', value: 'All Suppliers' },
        { label: 'North America Suppliers', value: 'North America Suppliers' },
        { label: 'Europe Suppliers', value: 'Europe Suppliers' },
        { label: 'Asia Suppliers', value: 'Asia Suppliers' }
    ];

    handleScopeChange(event) {
        this.assignmentScope = event.detail.value;
    }

    handleRowSelection(event) {
        // Handle row selection
        const selectedRows = event.detail.selectedRows;
        console.log('Selected rows:', selectedRows);
    }
}
