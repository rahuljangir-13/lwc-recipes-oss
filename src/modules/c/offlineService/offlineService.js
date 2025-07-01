import {
    generateId,
    saveItem,
    addPendingOperation,
    updateItem,
    getAll
} from 'c/utils';

/**
 * Save data locally and queue for syncing
 */
export async function saveOfflineAndQueue(storeName, operationType, data) {
    const record = {
        id:
            data && typeof data.id === 'string' && data.id.trim()
                ? data.id
                : generateId(),
        ...data,

        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString()
    };

    await saveItem(storeName, record);
    await addPendingOperation({
        id: generateId(),
        type: operationType,
        timestamp: Date.now(),
        data: record
    });

    console.log(`✅ Queued ${operationType} to sync`);
    return record;
}
export async function updateFileRecordId(formTempId, newRecordId) {
    const allFiles = await getAll('fileUploads');
    const matchedFiles = allFiles.filter((f) => f.formTempId === formTempId);

    for (const file of matchedFiles) {
        const updatedFile = {
            ...file,
            recordId: newRecordId,
            folderPath: `${file.formType}/${newRecordId}` // update path
        };
        // eslint-disable-next-line no-await-in-loop
        await updateItem('fileUploads', updatedFile);
        console.log(`📁 Updated file record with new recordId: ${newRecordId}`);
    }
}
