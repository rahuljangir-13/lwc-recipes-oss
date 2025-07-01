import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Save a file to the device using Capacitor Filesystem plugin.
 * @param {Object} param0
 * @param {String} param0.fileName - file name with extension (e.g., image.png)
 * @param {String} param0.data - base64 encoded string
 * @param {String} param0.type - optional, file type like 'image/png'
 */
export async function saveFileToDevice({ fileName, data }) {
    try {
        const result = await Filesystem.writeFile({
            path: fileName,
            data: data,
            directory: Directory.Data
        });

        const filePath = result.uri;
        console.log('📁 File saved to:', filePath);
        return { success: true, filePath };
    } catch (error) {
        console.error('❌ Error saving file:', error);
        return { success: false, error };
    }
}

/**
 * Read file contents from device using saved file path
 * @param {String} filePath - path returned by saveFileToDevice
 * @returns {String|null} base64 string of file content or null if error
 */
export async function readFileFromDevice(filePath) {
    try {
        const contents = await Filesystem.readFile({
            path: filePath,
            directory: Directory.Data
        });

        const base64Data = contents.data;
        console.log('📥 Read file content from:', filePath);
        return base64Data;
    } catch (error) {
        console.error('❌ Error reading file:', error);
        return null;
    }
}
