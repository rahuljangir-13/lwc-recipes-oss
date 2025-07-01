/**
 * REST API for File Upload operations supporting the LWC OSS application.
 * 
 * URL Mapping: /Rhythm/lwcossfileupload/*
 * Supports POST for uploading files as ContentVersion records.
 */
@RestResource(urlMapping='/lwcossfileupload/*')
global with sharing class LwcOssFileUploadService {
    
    // Request wrapper for file upload data
    global class FileUploadRequest {
        global String operation;
        global FileUploadData data;
    }
    
    global class FileUploadData {
        global String fileName;
        global String contentType;
        global String base64Content;
        global String parentId;
        global String description;
    }
    
    // Response wrapper for file upload operations
    global class FileUploadResponse {
        global Boolean success;
        global String message;
        global String contentVersionId;
        global String contentDocumentId;
    }
    
    /**
     * HTTP POST method to upload files
     */
    @HttpPost
    global static String doPost() {
        RestRequest req = RestContext.request;
        String requestBody = req.requestBody.toString();
        
        System.debug(LoggingLevel.INFO, 'File upload request received: ' + requestBody);
        
        try {
            // Deserialize the incoming JSON
            FileUploadRequest uploadRequest = (FileUploadRequest)JSON.deserialize(requestBody, FileUploadRequest.class);
            System.debug(LoggingLevel.INFO, 'Deserialized upload request: ' + uploadRequest);
            
            // Validate the request
            if (uploadRequest.operation != 'uploadFile') {
                return createErrorResponse('Invalid operation. Expected "uploadFile".');
            }
            
            if (uploadRequest.data == null) {
                return createErrorResponse('File data is required.');
            }
            
            FileUploadData fileData = uploadRequest.data;
            
            // Validate required fields
            if (String.isBlank(fileData.fileName)) {
                return createErrorResponse('File name is required.');
            }
            
            if (String.isBlank(fileData.base64Content)) {
                return createErrorResponse('File content is required.');
            }
            
            if (String.isBlank(fileData.contentType)) {
                fileData.contentType = 'application/octet-stream'; // Default content type
            }
            
            // Create ContentVersion record
            ContentVersion contentVersion = new ContentVersion();
            contentVersion.Title = fileData.fileName;
            contentVersion.PathOnClient = fileData.fileName;
            contentVersion.ContentType = fileData.contentType;
            contentVersion.VersionData = EncodingUtil.base64Decode(fileData.base64Content);
            contentVersion.Description = fileData.description;
            contentVersion.IsMajorVersion = true;
            
            // Insert the ContentVersion
            insert contentVersion;
            System.debug(LoggingLevel.INFO, 'ContentVersion created with ID: ' + contentVersion.Id);
            
            // Query to get the ContentDocumentId
            ContentVersion insertedCV = [
                SELECT Id, ContentDocumentId, Title, ContentSize 
                FROM ContentVersion 
                WHERE Id = :contentVersion.Id
            ];
            
            // If parentId is provided, create ContentDocumentLink
            if (String.isNotBlank(fileData.parentId)) {
                try {
                    ContentDocumentLink cdl = new ContentDocumentLink();
                    cdl.ContentDocumentId = insertedCV.ContentDocumentId;
                    cdl.LinkedEntityId = fileData.parentId;
                    cdl.ShareType = 'V'; // Viewer permission
                    cdl.Visibility = 'AllUsers';
                    
                    insert cdl;
                    System.debug(LoggingLevel.INFO, 'ContentDocumentLink created for parent: ' + fileData.parentId);
                } catch (Exception linkException) {
                    System.debug(LoggingLevel.WARN, 'Could not create ContentDocumentLink: ' + linkException.getMessage());
                    // Continue without linking - file is still uploaded
                }
            }
            
            // Return success response
            FileUploadResponse response = new FileUploadResponse();
            response.success = true;
            response.message = 'File uploaded successfully';
            response.contentVersionId = insertedCV.Id;
            response.contentDocumentId = insertedCV.ContentDocumentId;
            
            System.debug(LoggingLevel.INFO, 'File upload completed successfully: ' + fileData.fileName);
            return JSON.serialize(response);
            
        } catch (DmlException dmlEx) {
            System.debug(LoggingLevel.ERROR, 'DML Error during file upload: ' + dmlEx.getMessage() + '\n' + dmlEx.getStackTraceString());
            RestContext.response.statusCode = 500;
            return createErrorResponse('Error saving file: ' + dmlEx.getMessage());
            
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error during file upload: ' + e.getMessage() + '\n' + e.getStackTraceString());
            RestContext.response.statusCode = 500;
            return createErrorResponse('Error processing file upload: ' + e.getMessage());
        }
    }
    
    /**
     * Helper method to create error responses
     */
    private static String createErrorResponse(String errorMessage) {
        FileUploadResponse errorResponse = new FileUploadResponse();
        errorResponse.success = false;
        errorResponse.message = errorMessage;
        return JSON.serialize(errorResponse);
    }
} 