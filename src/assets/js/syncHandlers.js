/* eslint-disable no-await-in-loop */
// import { getAll, deleteItem, STORE_NAMES } from 'c/utils';
import { readFileFromDevice } from 'c/fileService';

import { deleteItem, deleteOperation, STORE_NAMES } from 'c/utils';

export async function syncUPLOAD_FILE(fileRecord) {
    console.log('📦 Running syncUPLOAD_FILE', fileRecord);
    try {
        console.log('🔄 Syncing file:', fileRecord.name);

        // 1. Read file from device
        const base64Data = await readFileFromDevice(fileRecord.filePath);
        if (!base64Data) {
            throw new Error(
                `Failed to read file from path: ${fileRecord.filePath}`
            );
        }

        // 2. Get presigned URL
        const presignResponse = await fetch(
            'https://presign-rhythm.s3.amazonaws.com/getPresignedUrl',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: fileRecord.name,
                    contentType: fileRecord.type,
                    folderPath: `Rahul`
                })
            }
        );

        if (!presignResponse.ok) {
            throw new Error(
                `Failed to get presigned URL: ${presignResponse.statusText}`
            );
        }

        const { url } = await presignResponse.json();
        console.log('🪪 Presigned URL received:', url);

        // 3. Convert to Blob
        const binary = atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: fileRecord.type });

        // 4. Upload to S3
        const uploadResponse = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': fileRecord.type },
            body: blob
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        console.log(`✅ Successfully uploaded file to S3: ${fileRecord.name}`);

        // 5. Remove from IndexedDB
        await deleteItem(STORE_NAMES.FILE_UPLOADS, fileRecord.id);
        await deleteOperation(fileRecord.operationId || fileRecord.id); // support both

        console.log(
            `🧹 Removed uploaded file from IndexedDB & PendingOperations`
        );

        return { success: true };
    } catch (error) {
        console.error('❌ syncUPLOAD_FILE error:', error);
        return { success: false, error };
    }
}

// // Helper function to convert Blob to base64
// function blobToBase64(blob) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = () => resolve(reader.result);
//         reader.onerror = reject;
//         reader.readAsDataURL(blob);
//     });
// }

export async function syncCREATE_CHECKLIST(data) {
    console.log('🔄 Syncing checklist to server:', data.checklistName);
    return Promise.resolve();
}

export async function syncCREATE_ASSESSMENT(data) {
    console.log('📌 Entered syncCREATE_ASSESSMENT with data:', data);

    // ✅ Client-side validation before calling API
    if (
        !data.Name ||
        !data.Rhythm__Template__c ||
        !data.Rhythm__Customer__c ||
        !data.Rhythm__Start_Date__c ||
        !data.Rhythm__End_Date__c
    ) {
        console.warn('❌ Missing required fields:', data);
        throw new Error('❌ Missing required fields in assessment data');
    }

    if (
        new Date(data.Rhythm__Start_Date__c) >
        new Date(data.Rhythm__End_Date__c)
    ) {
        throw new Error('❌ Start date must be before end date');
    }

    const sessionId =
        '00D7z00000P3CKp!AQEAQAirVCQsXFCBCaXGEzFHZx62B7QCU2xUsoUvzfmtFZ6qc0OnG3108ABMZcG5pJfqO0zThniJ25nxSNpPULahCNd.Ibfb';
    const APEX_REST_ENDPOINT_URL =
        'https://nosoftware-ability-6323-dev-ed.scratch.my.salesforce.com/services/apexrest/Rhythm/lwcossassessments/';

    const headers = {
        Authorization: `Bearer ${sessionId}`,
        'Content-Type': 'application/json'
    };

    const assessmentPayload = {
        Name: data.Name,
        Rhythm__Template__c: data.Rhythm__Template__c,
        Rhythm__Customer__c: data.Rhythm__Customer__c,
        Rhythm__Start_Date__c: data.Rhythm__Start_Date__c,
        Rhythm__End_Date__c: data.Rhythm__End_Date__c,
        Rhythm__Category__c: data.Rhythm__Category__c || '',
        Rhythm__Frequency__c: data.Rhythm__Frequency__c || '',
        Rhythm__Description__c: data.Rhythm__Description__c || ''
    };

    const requestBody = {
        operation: 'create',
        data: assessmentPayload
    };

    try {
        const response = await fetch(APEX_REST_ENDPOINT_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log(`✅ Synced assessment "${assessmentPayload.Name}"`);
            return result;
        }
    } catch (error) {
        console.error(
            `❌ Failed syncing assessment "${assessmentPayload.Name}":`,
            error.message || error
        );
        throw error;
    }
    return Promise.resolve();
}

export async function syncCREATE_FINDING(data) {
    console.log('🔄 Syncing finding:', data.description);
    return Promise.resolve();
}

export async function syncCREATE_TASK(data) {
    console.log('🔄 Syncing task:', data.title);
    return Promise.resolve();
}

export async function syncCREATE_RESPONSE(data) {
    console.log('🔄 Syncing response:', data.answer);
    return Promise.resolve();
}
window.syncHandlers = {
    syncCREATE_ASSESSMENT,
    syncCREATE_FINDING,
    syncCREATE_TASK,
    syncCREATE_RESPONSE,
    syncCREATE_CHECKLIST,
    syncUPLOAD_FILE
};
