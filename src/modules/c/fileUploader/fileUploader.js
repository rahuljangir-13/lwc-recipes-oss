/* eslint-disable no-await-in-loop */
import { LightningElement, api, track } from 'lwc';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import {
    generateId,
    saveItem,
    addPendingOperation,
    STORE_NAMES,
    isOnline
} from 'c/utils';

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
        const input = this.template.querySelector('.file-input');
        if (input) input.click();
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
                readableSize: this.formatFileSize(file.size),
                filePath: file.path || '' // File picker on native may include path
            });
        }

        this.selectedFiles = validFiles;

        for (const file of validFiles) {
            // Do NOT save the file — just reference path or name
            const fileRecord = {
                id: generateId(),
                name: file.name,
                type: file.type,
                size: file.size,
                readableSize: file.readableSize,
                filePath: file.filePath || '', // May be empty for picker files
                recordId: this.recordId,
                formType: this.formType,
                uploaded: false,
                createdDate: new Date().toISOString(),
                lastModifiedDate: new Date().toISOString(),
                description: `File uploaded from ${this.formType}`
            };

            await saveItem(STORE_NAMES.FILE_UPLOADS, fileRecord);
            await addPendingOperation({
                id: fileRecord.id,
                type: 'UPLOAD_FILE',
                timestamp: Date.now(),
                data: fileRecord
            });

            this.uploadedFiles.push(fileRecord);

            if (isOnline() && window.offlineSync) {
                window.offlineSync.triggerSync();
            }
        }

        this.updateFileList();
    }

    updateFileList() {
        const input = this.template.querySelector('.file-input');
        if (input) input.value = '';
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
        if (this.isUploading) return 'Uploading files...';
        if (this.uploadedFiles.length > 0) {
            return `${this.uploadedFiles.length} file(s) stored ${this.isOnlineStatus ? '(syncing...)' : '(queued)'}`;
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

    async capturePhoto() {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
                saveToGallery: true
            });

            if (!image?.path) {
                this.errorMessage = 'Camera failed to return path';
                return;
            }

            const fileName = image.path.split('/').pop();
            const filePath = image.path;

            const fileRecord = {
                id: generateId(),
                name: fileName,
                type: 'image/jpeg',
                size: 0,
                filePath,
                recordId: this.recordId,
                formType: this.formType,
                uploaded: false,
                createdDate: new Date().toISOString(),
                lastModifiedDate: new Date().toISOString(),
                description: 'Captured via camera'
            };

            await saveItem(STORE_NAMES.FILE_UPLOADS, fileRecord);
            await addPendingOperation({
                id: fileRecord.id,
                type: 'UPLOAD_FILE',
                timestamp: Date.now(),
                data: fileRecord
            });

            this.uploadedFiles.push(fileRecord);
            if (isOnline() && window.offlineSync) {
                window.offlineSync.triggerSync();
            }

            console.log('📸 Captured photo saved to queue:', fileRecord);
        } catch (err) {
            console.error('❌ Error capturing photo:', err);
            this.errorMessage = 'Photo capture failed.';
        }
    }
}
