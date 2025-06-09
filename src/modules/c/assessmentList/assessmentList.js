import { LightningElement } from 'lwc';

export default class AssessmentList extends LightningElement {
    assessments = [
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
        },
        {
            id: '4',
            assessmentName: 'Risk Assessment Annual',
            checklistName: 'Risk Management Checklist',
            associatedCustomer: 'Finance Pro Inc',
            startDate: '2024-03-01',
            endDate: '2024-04-01',
            status: 'Not Started'
        },
        {
            id: '5',
            assessmentName: 'Quality Assurance Review',
            checklistName: 'QA Standards Checklist',
            associatedCustomer: 'Manufacturing Co',
            startDate: '2024-02-15',
            endDate: '2024-03-15',
            status: 'Completed'
        },
        {
            id: '6',
            assessmentName: 'Data Privacy Assessment',
            checklistName: 'GDPR Compliance Checklist',
            associatedCustomer: 'DataTech Services',
            startDate: '2024-01-10',
            endDate: '2024-02-10',
            status: 'In Progress'
        }
    ];

    get formattedAssessments() {
        return this.assessments.map((assessment) => ({
            ...assessment,
            statusClass: this.getStatusClass(assessment.status),
            formattedStartDate: this.formatDate(assessment.startDate),
            formattedEndDate: this.formatDate(assessment.endDate)
        }));
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}
