import { LightningElement, track } from 'lwc';

export default class RecordTypeModal extends LightningElement {
    @track recordTypes = [
        {
            label: 'Assessment Type',
            value: 'assessmentType',
            description:
                'Create an assessment type for categorizing assessments',
            isAssessmentType: true,
            isAssessmentArea: false
        },
        {
            label: 'Assessment Area',
            value: 'assessmentArea',
            description:
                'Create a site assessment for evaluating physical locations',
            isAssessmentType: false,
            isAssessmentArea: true
        }
    ];

    handleCancel() {
        // Dispatch close event
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleRecordTypeSelect(event) {
        const recordTypeValue = event.currentTarget.dataset.value;
        const selectedRecordType = this.recordTypes.find(
            (rt) => rt.value === recordTypeValue
        );

        if (selectedRecordType) {
            // Dispatch select event with selected record type
            this.dispatchEvent(
                new CustomEvent('select', {
                    detail: selectedRecordType
                })
            );
        }
    }
}
