import { LightningElement, api, track } from 'lwc';
import {
    generateId,
    saveItem,
    addPendingOperation,
    STORE_NAMES,
    isOnline
} from 'c/utils';
import { saveFileToDevice } from 'c/fileService';

export default class FileUploader extends LightningElement {
    @api recordId;
    @api formType = 'general';
    @api acceptedFileTypes = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
    @api maxFileSize = 5 * 1024 * 1024;
    @api multiple = false;

    @track selectedFiles = [];
    @track uploadedFiles = [];
    @track isUploading = false;
    @track errorMessage = '';

    handleSelectFiles() {
        const fileInput = this.template.querySelector('.file-input');
        if (fileInput) fileInput.click();
    }

    async handleFileChange(event) {
        const files = Array.from(event.target.files);
        this.errorMessage = '';
        const validFiles = [];

        for (const file of files) {
            if (file.size > this.maxFileSize) {
                this.errorMessage = `File ${file.name} is too large (max ${this.formatFileSize(this.maxFileSize)})`;
                continue;
            }

            validFiles.push({
                rawFile: file,
                name: file.name,
                size: file.size,
                type: file.type,
                readableSize: this.formatFileSize(file.size)
            });
        }

        this.selectedFiles = validFiles;

        for (const file of validFiles) {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Data = reader.result.split(',')[1];
                const uniqueFileName = `${Date.now()}_${file.name}`;

                const { success, filePath, error } = await saveFileToDevice({
                    fileName: uniqueFileName,
                    data: base64Data,
                    type: file.type
                });

                if (success) {
                    const fileRecord = {
                        id: generateId(),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        readableSize: file.readableSize,
                        filePath,
                        recordId: this.recordId,
                        formType: this.formType,
                        uploaded: false,
                        createdDate: new Date().toISOString(),
                        lastModifiedDate: new Date().toISOString(),
                        description: `File uploaded from ${this.formType}`
                    };

                    await saveItem(STORE_NAMES.FILE_UPLOADS, fileRecord);
                    if (isOnline() && window.offlineSync) {
                        console.log('🌐 Online - syncing immediately');
                        await window.offlineSync.syncUPLOAD_FILE(fileRecord);
                    } else {
                        console.log('📴 Offline - queuing for sync');
                        await addPendingOperation({
                            id: fileRecord.id, // reuse same id for cleanup
                            type: 'UPLOAD_FILE',
                            timestamp: Date.now(),
                            data: fileRecord
                        });
                    }

                    this.uploadedFiles.push(fileRecord);

                    if (isOnline() && window.offlineSync) {
                        window.offlineSync.triggerSync();
                    }
                } else {
                    console.error(
                        `❌ Failed to save file: ${file.name}`,
                        error
                    );
                    this.errorMessage = `Failed to save file: ${file.name}`;
                }
            };

            reader.readAsDataURL(file.rawFile);
        }

        this.updateFileList();
    }

    updateFileList() {
        const fileInput = this.template.querySelector('.file-input');
        if (fileInput) fileInput.value = '';
    }

    handleClearAll() {
        this.selectedFiles = [];
        this.errorMessage = '';
        this.updateFileList();
    }

    get hasSelectedFiles() {
        return this.selectedFiles.length > 0;
    }

    get hasUploadedFiles() {
        return this.uploadedFiles.length > 0;
    }

    get isOnlineStatus() {
        return isOnline();
    }

    get statusMessage() {
        if (this.isUploading) return 'Storing files...';
        if (this.uploadedFiles.length > 0) {
            return `${this.uploadedFiles.length} file(s) stored ${this.isOnlineStatus ? '(syncing...)' : '(will sync when online)'}`;
        }
        return 'No files selected';
    }

    get maxFileSizeLabel() {
        return this.formatFileSize(this.maxFileSize);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
