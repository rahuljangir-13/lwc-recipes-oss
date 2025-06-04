/**
 * REST API for Contact operations supporting the LWC OSS application.
 * 
 * URL Mapping: /Rhythm/lwcosscontacts/*
 * Supports GET for retrieving contacts and POST for creating contacts.
 */
@RestResource(urlMapping='/lwcosscontacts/*')
global with sharing class LwcOssContactsRestService {
    
    // Wrapper class for Contact data
    global class ContactWrapper {
        global String id;
        global String firstName;
        global String lastName;
        global String title;
        global String email;
        global String phone;
        global String mobilePhone;
        global String department;
        global String accountId;
        global String accountName;
        global String employeeType;
        global Datetime createdDate;
        global Datetime lastModifiedDate;
    }
    
    // Response wrapper for POST operations
    global class ResponseWrapper {
        global Boolean success;
        global String message;
        global ContactWrapper contact;
    }
    
    /**
     * HTTP GET method to retrieve contacts
     */
    @HttpGet
    global static String doGet() {
        try {
            List<ContactWrapper> contactWrappers = new List<ContactWrapper>();
            
            // Query contacts with their related account information
            List<Contact> contacts = [
                SELECT Id, FirstName, LastName, Title, Email, Phone, MobilePhone,
                       Department, AccountId, Account.Name,
                       CreatedDate, LastModifiedDate
                FROM Contact
                ORDER BY LastName, FirstName
                LIMIT 100
            ];
            
            // Convert to the format expected by the LWC OSS app
            for (Contact c : contacts) {
                ContactWrapper wrapper = new ContactWrapper();
                wrapper.id = c.Id;
                wrapper.firstName = c.FirstName;
                wrapper.lastName = c.LastName;
                wrapper.title = c.Title;
                wrapper.email = c.Email;
                wrapper.phone = c.Phone;
                wrapper.mobilePhone = c.MobilePhone;
                wrapper.department = c.Department;
                wrapper.accountId = c.AccountId;
                wrapper.accountName = c.Account?.Name;
                wrapper.employeeType = 'Full Time'; // Hardcoded
                wrapper.createdDate = c.CreatedDate;
                wrapper.lastModifiedDate = c.LastModifiedDate;
                
                contactWrappers.add(wrapper);
            }
            
            // Return as JSON string
            return JSON.serialize(contactWrappers);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error in doGet: ' + e.getMessage() + '\n' + e.getStackTraceString());
            RestContext.response.statusCode = 500;
            return JSON.serialize(new Map<String, Object>{
                'success' => false,
                'message' => 'Error retrieving contacts: ' + e.getMessage()
            });
        }
    }
    
    /**
     * HTTP POST method to create a new contact
     */
    @HttpPost
    global static String doPost() {
        RestRequest req = RestContext.request;
        String requestBody = req.requestBody.toString();
        
        System.debug(LoggingLevel.INFO, 'Request body received: ' + requestBody);
        
        try {
            // Deserialize the incoming JSON to a Map
            Map<String, Object> contactData = (Map<String, Object>)JSON.deserializeUntyped(requestBody);
            System.debug(LoggingLevel.INFO, 'Deserialized contact data: ' + contactData);
            
            // Validate required fields
            if (!contactData.containsKey('lastName') || String.isBlank((String)contactData.get('lastName'))) {
                System.debug(LoggingLevel.ERROR, 'LastName is required but not provided');
                RestContext.response.statusCode = 400;
                ResponseWrapper errorResponse = new ResponseWrapper();
                errorResponse.success = false;
                errorResponse.message = 'LastName is required';
                return JSON.serialize(errorResponse);
            }
            
            // Create the contact record
            Contact newContact = new Contact();
            
            // Set lastName (required)
            newContact.LastName = (String)contactData.get('lastName');
            System.debug('Setting LastName: ' + newContact.LastName);
            
            // Set optional fields - note that these are preferred but not required
            if (contactData.containsKey('firstName')) {
                newContact.FirstName = (String)contactData.get('firstName');
                System.debug('Setting FirstName: ' + newContact.FirstName);
            }
            
            if (contactData.containsKey('title')) {
                newContact.Title = (String)contactData.get('title');
                System.debug('Setting Title: ' + newContact.Title);
            }
            
            if (contactData.containsKey('email')) {
                newContact.Email = (String)contactData.get('email');
                System.debug('Setting Email: ' + newContact.Email);
            }
            
            if (contactData.containsKey('phone')) {
                newContact.Phone = (String)contactData.get('phone');
                System.debug('Setting Phone: ' + newContact.Phone);
            }
            
            if (contactData.containsKey('mobilePhone')) {
                newContact.MobilePhone = (String)contactData.get('mobilePhone');
                System.debug('Setting MobilePhone: ' + newContact.MobilePhone);
            }
            
            if (contactData.containsKey('department')) {
                newContact.Department = (String)contactData.get('department');
                System.debug('Setting Department: ' + newContact.Department);
            }
            
            if (contactData.containsKey('accountId') && contactData.get('accountId') != null) {
                String accId = (String)contactData.get('accountId');
                if (String.isNotBlank(accId)) {
                    newContact.AccountId = accId;
                    System.debug('Setting AccountId: ' + newContact.AccountId);
                }
            }
            
            try {
                // Set employeeType to 'Full Time' (hardcoded as required)
                // Uncomment the line below if you have an EmployeeType__c custom field
                // newContact.EmployeeType__c = 'Full Time';
                System.debug('Setting EmployeeType to Full Time (hardcoded)');
                
                // Insert the new contact
                insert newContact;
                System.debug(LoggingLevel.INFO, 'Contact inserted with ID: ' + newContact.Id);
                
                // Query the newly created contact to get all fields
                Contact createdContact = [
                    SELECT Id, FirstName, LastName, Title, Email, Phone, MobilePhone,
                           Department, AccountId, Account.Name,
                           CreatedDate, LastModifiedDate
                    FROM Contact 
                    WHERE Id = :newContact.Id
                ];
                
                // Return the created contact
                ContactWrapper wrapper = new ContactWrapper();
                wrapper.id = createdContact.Id;
                wrapper.firstName = createdContact.FirstName;
                wrapper.lastName = createdContact.LastName;
                wrapper.title = createdContact.Title;
                wrapper.email = createdContact.Email;
                wrapper.phone = createdContact.Phone;
                wrapper.mobilePhone = createdContact.MobilePhone;
                wrapper.department = createdContact.Department;
                wrapper.accountId = createdContact.AccountId;
                wrapper.accountName = createdContact.Account?.Name;
                wrapper.employeeType = 'Full Time'; // Hardcoded
                wrapper.createdDate = createdContact.CreatedDate;
                wrapper.lastModifiedDate = createdContact.LastModifiedDate;
                
                ResponseWrapper response = new ResponseWrapper();
                response.success = true;
                response.contact = wrapper;
                
                return JSON.serialize(response);
                
            } catch (DmlException dmlEx) {
                System.debug(LoggingLevel.ERROR, 'DML Error: ' + dmlEx.getMessage() + '\n' + dmlEx.getStackTraceString());
                RestContext.response.statusCode = 500;
                ResponseWrapper errorResponse = new ResponseWrapper();
                errorResponse.success = false;
                errorResponse.message = 'Error creating contact: ' + dmlEx.getMessage();
                return JSON.serialize(errorResponse);
            }
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error in doPost: ' + e.getMessage() + '\n' + e.getStackTraceString());
            RestContext.response.statusCode = 500;
            ResponseWrapper errorResponse = new ResponseWrapper();
            errorResponse.success = false;
            errorResponse.message = 'Error creating contact: ' + e.getMessage();
            return JSON.serialize(errorResponse);
        }
    }
}