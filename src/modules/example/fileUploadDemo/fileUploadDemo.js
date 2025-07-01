import { LightningElement, track } from 'lwc';
import { generateId } from 'c/utils';

export default class FileUploadDemo extends LightningElement {
    @track recordId = generateId(); // Simulate a record ID
    @track formType = 'assessment';
    @track uploadMessage = '';

    // Handle files added event from FileUploader
    handleFilesAdded(event) {
        const { count, files } = event.detail;
        this.uploadMessage = `✅ ${count} file(s) stored successfully: ${files.map((f) => f.name).join(', ')}`;

        console.log('📁 Files added to record:', {
            recordId: this.recordId,
            formType: this.formType,
            files: files
        });

        // Here you could dispatch events to parent components
        // or perform additional actions after files are stored
    }

    // Simulate changing the record ID
    handleNewRecord() {
        this.recordId = generateId();
        this.uploadMessage = `🆔 New record ID: ${this.recordId}`;
    }

    // Change form type
    handleFormTypeChange(event) {
        this.formType = event.target.value;
    }

    get formTypeOptions() {
        return [
            { label: 'Assessment', value: 'assessment' },
            { label: 'Finding', value: 'finding' },
            { label: 'Task', value: 'task' },
            { label: 'General', value: 'general' }
        ];
    }
}
