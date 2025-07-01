@RestResource(urlMapping='/lwcossassessments/*')
global with sharing class AssessmentDataService {    
    @HttpGet
    global static AssessmentResponse getAllAssessments() {
        AssessmentResponse response = new AssessmentResponse();
        RestRequest req = RestContext.request;
        
        try {
            // Debug: Log the incoming request URI
            String requestURI = req.requestURI;
            System.debug('Incoming Request URI: ' + requestURI);
            
            // Get operation and recordId from URL parameters
            String operation = req.params.get('operation');
            String recordId = req.params.get('recordId');
            
            // Also try to extract recordId from URL path for backward compatibility
            if (String.isBlank(recordId) && requestURI.contains('/rhythm/lwcossassessments/')) {
                String[] uriParts = requestURI.split('/rhythm/lwcossassessments/');
                if (uriParts.size() > 1 && String.isNotBlank(uriParts[1])) {
                    recordId = uriParts[1].trim();
                    System.debug('Extracted Record ID from path: ' + recordId);
                }
            }
            
            System.debug('Operation: ' + operation);
            System.debug('Record ID: ' + recordId);
            
            // Switch case based on operation
            if (String.isNotBlank(operation)) {
                switch on operation.toLowerCase() {
                    when 'getassessment' {
                        if (String.isNotBlank(recordId)) {
                            return getAssessment(recordId);
                        } else {
                            response.success = false;
                            response.message = 'Record ID is required for getAssessment operation';
                            return response;
                        }
                    }
                    when 'getallassessments' {
                        // Continue to default behavior below
                    }
                    when else {
                        response.success = false;
                        response.message = 'Invalid operation: ' + operation;
                        return response;
                    }
                }
            }
            
            // Default behavior - get all assessments or single assessment if recordId in path
            if (String.isNotBlank(recordId) && (recordId.length() == 15 || recordId.length() == 18)) {
                return getAssessment(recordId);
            } else {
                System.debug('No valid record ID provided, fetching all assessments');
                  // Get all assessments
                response.assessments = [
                    SELECT Id, Name, Rhythm__Template__c, Rhythm__Template__r.Name,
                       Rhythm__Start_Date__c, Rhythm__Customer__c, Rhythm__Customer__r.Name,
                       Rhythm__Category__c, Rhythm__Frequency__c, Rhythm__End_Date__c, 
                       Rhythm__Description__c, Rhythm__StatusFormula__c,
                       Rhythm__Administrators__c, Rhythm__Initiators__c, Rhythm__Reviewers__c,
                       Rhythm__Approvers__c, Rhythm__Respondents__c, Rhythm__Viewers__c,
                       Rhythm__Scoring_Ranges__c, CreatedDate, LastModifiedDate,
                       CreatedBy.Name, LastModifiedBy.Name
                FROM Rhythm__Assessment__c  
                    ORDER BY LastModifiedDate DESC
                    LIMIT 100
                ];
                
                response.success = true;
                response.message = 'Assessments retrieved successfully';
            }
            
        } catch (Exception e) {
            response.success = false;
            response.message = 'Error retrieving assessments: ' + e.getMessage();
            response.error = e.getStackTraceString();
        }
        
        return response;
    }
    
    // Private helper method to get a single assessment by ID
    private static AssessmentResponse getAssessment(String recordId) {
        AssessmentResponse response = new AssessmentResponse();
        
        try {
            System.debug('Fetching single assessment with ID: ' + recordId);
              // Get single assessment by ID
            response.assessments = [
                SELECT Id, Name, Rhythm__Template__c, Rhythm__Template__r.Name,
                       Rhythm__Start_Date__c, Rhythm__Customer__c, Rhythm__Customer__r.Name,
                       Rhythm__Category__c, Rhythm__Frequency__c, Rhythm__End_Date__c, 
                       Rhythm__Description__c, Rhythm__StatusFormula__c,
                       Rhythm__Administrators__c, Rhythm__Initiators__c, Rhythm__Reviewers__c,
                       Rhythm__Approvers__c, Rhythm__Respondents__c, Rhythm__Viewers__c,
                       Rhythm__Scoring_Ranges__c, CreatedDate, LastModifiedDate,
                       CreatedBy.Name, LastModifiedBy.Name
                FROM Rhythm__Assessment__c 
                WHERE Id = :recordId
                LIMIT 1
            ];
            
            if (response.assessments.isEmpty()) {
                response.success = false;
                response.message = 'Assessment not found with ID: ' + recordId;
                System.debug('No assessment found with ID: ' + recordId);
                return response;
            }
            
            response.success = true;
            response.message = 'Assessment retrieved successfully';
            System.debug('Successfully retrieved assessment: ' + response.assessments[0].Name);
            
        } catch (Exception e) {
            response.success = false;
            response.message = 'Error retrieving assessment: ' + e.getMessage();
            response.error = e.getStackTraceString();
        }
        
        return response;
    }
    
    @HttpPost
    global static AssessmentResponse createOrUpdateAssessment() {
        AssessmentResponse response = new AssessmentResponse();
        RestRequest req = RestContext.request;
        
        try {
            String requestBody = req.requestBody.toString();
            Map<String, Object> requestData = (Map<String, Object>) JSON.deserializeUntyped(requestBody);
            
            String operation = (String) requestData.get('operation');
            Map<String, Object> assessmentData = (Map<String, Object>) requestData.get('data');
            
            if (operation == 'create' || operation == 'update') {
                Rhythm__Assessment__c assessment;
                
                if (operation == 'update' && assessmentData.containsKey('Id')) {
                    // Update existing assessment
                    String assessmentId = (String) assessmentData.get('Id');
                    assessment = [SELECT Id FROM Rhythm__Assessment__c WHERE Id = :assessmentId LIMIT 1];
                } else {
                    // Create new assessment
                    assessment = new Rhythm__Assessment__c();
                }
                
                // Map fields from request data
                if (assessmentData.containsKey('Name')) 
                    assessment.Name = (String) assessmentData.get('Name');
                if (assessmentData.containsKey('Rhythm__Template__c')) 
                    assessment.Rhythm__Template__c = (String) assessmentData.get('Rhythm__Template__c');
                if (assessmentData.containsKey('Rhythm__Start_Date__c')) 
                    assessment.Rhythm__Start_Date__c = Date.valueOf((String) assessmentData.get('Rhythm__Start_Date__c'));
                if (assessmentData.containsKey('Rhythm__End_Date__c')) 
                    assessment.Rhythm__End_Date__c = Date.valueOf((String) assessmentData.get('Rhythm__End_Date__c'));
                if (assessmentData.containsKey('Rhythm__Customer__c')) 
                    assessment.Rhythm__Customer__c = (String) assessmentData.get('Rhythm__Customer__c');
                if (assessmentData.containsKey('Rhythm__Category__c')) 
                    assessment.Rhythm__Category__c = (String) assessmentData.get('Rhythm__Category__c');
                if (assessmentData.containsKey('Rhythm__Frequency__c')) 
                    assessment.Rhythm__Frequency__c = (String) assessmentData.get('Rhythm__Frequency__c');
                if (assessmentData.containsKey('Rhythm__Description__c')) 
                    assessment.Rhythm__Description__c = (String) assessmentData.get('Rhythm__Description__c');
                if (assessmentData.containsKey('Rhythm__Administrators__c')) 
                    assessment.Rhythm__Administrators__c = (String) assessmentData.get('Rhythm__Administrators__c');
                if (assessmentData.containsKey('Rhythm__Initiators__c')) 
                    assessment.Rhythm__Initiators__c = (String) assessmentData.get('Rhythm__Initiators__c');
                if (assessmentData.containsKey('Rhythm__Reviewers__c')) 
                    assessment.Rhythm__Reviewers__c = (String) assessmentData.get('Rhythm__Reviewers__c');
                if (assessmentData.containsKey('Rhythm__Approvers__c')) 
                    assessment.Rhythm__Approvers__c = (String) assessmentData.get('Rhythm__Approvers__c');
                if (assessmentData.containsKey('Rhythm__Respondents__c')) 
                    assessment.Rhythm__Respondents__c = (String) assessmentData.get('Rhythm__Respondents__c');
                if (assessmentData.containsKey('Rhythm__Viewers__c')) 
                    assessment.Rhythm__Viewers__c = (String) assessmentData.get('Rhythm__Viewers__c');
                if (assessmentData.containsKey('Rhythm__Scoring_Ranges__c')) 
                    assessment.Rhythm__Scoring_Ranges__c = (String) assessmentData.get('Rhythm__Scoring_Ranges__c');
                
                if (operation == 'create') {
                    insert assessment;
                } else {
                    update assessment;
                }
                
                response.success = true;
                response.message = 'Assessment ' + operation + 'd successfully';
                response.createdAssessment = assessment;
                
            } else if (operation == 'clone') {
                String recordId = (String) assessmentData.get('recordId');
                String newName = (String) assessmentData.get('newName');
                
                // Clone the assessment using the existing logic
                Rhythm__Assessment__c original = [
                    SELECT Name, Rhythm__Template__c, Rhythm__Start_Date__c, Rhythm__Customer__c, 
                           Rhythm__Category__c, Rhythm__Frequency__c, Rhythm__End_Date__c, 
                           Rhythm__Description__c, Rhythm__StatusFormula__c, Rhythm__Administrators__c, 
                           Rhythm__Initiators__c, Rhythm__Reviewers__c, Rhythm__Approvers__c, 
                           Rhythm__Respondents__c, Rhythm__Viewers__c, Rhythm__Scoring_Ranges__c  
                    FROM Rhythm__Assessment__c 
                    WHERE Id = :recordId 
                    LIMIT 1
                ];
                
                Rhythm__Assessment__c clone = original.clone(false, true, false, false);
                clone.Name = newName;
                insert clone;
                  response.success = true;
                response.message = 'Assessment cloned successfully';
                response.createdAssessment = clone;
            } else {
                response.success = false;
                response.message = 'Invalid operation: ' + operation;
            }
            
        } catch (Exception e) {
            response.success = false;
            response.message = 'Error processing assessment: ' + e.getMessage();
            response.error = e.getStackTraceString();
        }
        
        return response;
    }
      global class AssessmentResponse {
        public Boolean success { get; set; }
        public String message { get; set; }
        public String error { get; set; }
        public List<Rhythm__Assessment__c> assessments { get; set; }
        public Rhythm__Assessment__c createdAssessment { get; set; }
        
        public AssessmentResponse() {
            this.assessments = new List<Rhythm__Assessment__c>();
        }
    }
    
    // Test method to verify the service works
    @TestVisible
    private static String testRecordExtraction(String testURI) {
        String recordId = null;
        if (testURI.contains('/lwcossassessments/')) {
            String[] uriParts = testURI.split('/lwcossassessments/');
            if (uriParts.size() > 1 && String.isNotBlank(uriParts[1])) {
                recordId = uriParts[1].trim();
            }
        }
        return recordId;
    }
}