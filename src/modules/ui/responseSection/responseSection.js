import { LightningElement, api, track } from 'lwc';

export default class ResponseSection extends LightningElement {
    @api recordId;

    @track responses = [
        {
            id: '1',
            supplier: 'ABC Manufacturing',
            completedPercent: 100,
            score: 85,
            status: 'Completed',
            submissionDate: '5/15/2025',
            followUps: 2,
            isCompleted: true,
            isInProgress: false
        },
        {
            id: '2',
            supplier: 'XYZ Components',
            completedPercent: 100,
            score: 92,
            status: 'Completed',
            submissionDate: '5/16/2025',
            followUps: 0,
            isCompleted: true,
            isInProgress: false
        },
        {
            id: '3',
            supplier: 'Precision Parts Inc',
            completedPercent: 75,
            score: 0,
            status: 'In Progress',
            submissionDate: '--',
            followUps: 1,
            isCompleted: false,
            isInProgress: true
        },
        {
            id: '4',
            supplier: 'Global Supplies Ltd',
            completedPercent: 100,
            score: 78,
            status: 'Completed',
            submissionDate: '5/20/2025',
            followUps: 3,
            isCompleted: true,
            isInProgress: false
        },
        {
            id: '5',
            supplier: 'Tech Solutions Corp',
            completedPercent: 50,
            score: 0,
            status: 'In Progress',
            submissionDate: '--',
            followUps: 0,
            isCompleted: false,
            isInProgress: true
        }
    ];

    @track sortBy = 'supplier';
    @track sortDirection = 'asc';

    get totalResponses() {
        return this.responses.length;
    }

    get lastUpdated() {
        return new Date().toLocaleString();
    }

    handleSort(event) {
        const fieldName = event.currentTarget.dataset.fieldName;
        const sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';

        this.sortBy = fieldName;
        this.sortDirection = sortDirection;

        // Clone the data
        let cloneData = [...this.responses];

        // Sort the data
        cloneData.sort((a, b) => {
            const sortAsc = sortDirection === 'asc';
            const val1 = a[this.sortBy];
            const val2 = b[this.sortBy];

            // Special handling for numbers and strings
            if (typeof val1 === 'number' && typeof val2 === 'number') {
                return sortAsc ? val1 - val2 : val2 - val1;
            }
            const val1Str = String(val1).toLowerCase();
            const val2Str = String(val2).toLowerCase();
            return sortAsc
                ? val1Str.localeCompare(val2Str)
                : val2Str.localeCompare(val1Str);
        });

        this.responses = cloneData;
    }

    handleRefresh() {
        // In a real app, this would fetch fresh data from the backend
        console.log('Refreshing data...');
    }

    handleSendEmail() {
        // In a real app, this would open a modal to compose an email
        console.log('Opening email composer...');
    }

    handleSettings() {
        // In a real app, this would open settings
        console.log('Opening settings...');
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        // Handle the action based on name
        if (actionName === 'view') {
            // Handle view action
            console.log('Viewing response:', row);
        }
    }
}
