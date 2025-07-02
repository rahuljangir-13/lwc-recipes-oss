/* eslint-disable no-await-in-loop */
// import { getAll, deleteItem, STORE_NAMES } from 'c/utils';
// import { Filesystem } from '@capacitor/filesystem';

// import { deleteItem, deleteOperation, STORE_NAMES } from 'c/utils';

// import { readFileFromDevice } from 'c/fileService';

import { Http } from '@capacitor-community/http';
// import { readFileFromDevice } from './fileService';

export async function syncUPLOAD_FILE(fileRecord) {
    console.log('📦 Running syncUPLOAD_FILE', fileRecord);
    try {
        if (!fileRecord?.filePath) {
            throw new Error('❌ No filePath present in fileRecord');
        }

        const payload = {
            fileName: fileRecord.name,
            contentType: fileRecord.type,
            folderPath: 'Rahul',
            filePath: fileRecord.filePath // Only sending real device path
        };

        if (window.Capacitor && window.Capacitor.isNativePlatform?.()) {
            await Http.post({
                url: 'https://webhook.site/a37336e7-6cc6-4cdc-b8c4-e436852fa270',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: payload
            });
            console.log('✅ File metadata sent using Capacitor Http');
        } else {
            const res = await fetch(
                'https://webhook.site/a37336e7-6cc6-4cdc-b8c4-e436852fa270',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!res.ok) {
                throw new Error(`Fetch failed: ${res.statusText}`);
            }

            console.log('✅ File metadata sent using fetch');
        }

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
        '00D7z00000P3CKp!AQEAQMjoYdZsIS2gpTLQHsHGPmxQi._SclNYRgU7UpY1Wa22XjX3oOatvxrxUGRJiCB2G7FAo7dOxHaV06Yl6QXnrv1LmNZH';
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
