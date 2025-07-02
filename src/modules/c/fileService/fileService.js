// import { Filesystem, Directory } from '@capacitor/filesystem';
// import { Capacitor } from '@capacitor/core';

/**
 * Save a file to the device using Capacitor Filesystem plugin.
 * @param {Object} param0
 * @param {String} param0.fileName - file name with extension (e.g., image.png)
 * @param {String} param0.data - base64 encoded string
 * @param {String} param0.type - optional, file type like 'image/png'
 */
// export async function saveFileToDevice({ fileName, data }) {
//     try {
//         const result = await Filesystem.writeFile({
//             path: fileName,
//             data: data,
//             directory: Directory.Data
//         });

//         const filePath = Capacitor.convertFileSrc(result.uri);
//         console.log('📁 File saved to:', filePath);
//         return { success: true, filePath };
//     } catch (error) {
//         console.error('❌ Error saving file:', error);
//         return { success: false, error };
//     }
// }

/**
 * Read file contents from device using saved file path
 * @param {String} filePath - path returned by saveFileToDevice
 * @returns {String|null} base64 string of file content or null if error
 */
// export async function readFileFromDevice(filePath) {
//     try {
//         // Extract only the internal relative path from the Capacitor URI
//         const prefix = '_capacitor_file_/';
//         const index = filePath.indexOf(prefix);

//         if (index === -1) {
//             throw new Error(`Invalid file path format: ${filePath}`);
//         }

//         const internalPath = filePath.substring(index + prefix.length);

//         const contents = await Filesystem.readFile({
//             path: internalPath,
//             directory: Directory.Data
//         });

//         // `contents.data` is base64 encoded string
//         return contents.data;
//     } catch (error) {
//         console.error('❌ Error reading file:', error);
//         throw new Error(`Failed to read file from path: ${filePath}`);
//     }
// }
