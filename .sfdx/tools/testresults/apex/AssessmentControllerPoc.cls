@RestResource(urlMapping='/lwcossaccounts/*')
global class AssessmentControllerPoc {
    
    static AssessmentSelectorPoc accAssSelector = AssessmentSelectorPoc.getInstance();
    static AssessmentServicePoc accAssService = AssessmentServicePoc.getInstance();
    
    // Wrapper class for REST response
    global class RestResponse {
        @AuraEnabled
        global Object data { get; set; }
        @AuraEnabled
        global String message { get; set; }
        @AuraEnabled
        global Boolean success { get; set; }
        
        global RestResponse(Object data, String message, Boolean success) {
            this.data = data;
            this.message = message;
            this.success = success;
        }
    }

    // Reference to CountResult from selector
    global class CountResult {
        @AuraEnabled public String sectionId { get; set; }
        @AuraEnabled public String type { get; set; }
        @AuraEnabled public Integer count { get; set; }
        
        // Constructor to create from selector's CountResult
        public CountResult(AssessmentSelectorPoc.CountResult selectorResult) {
            this.sectionId = selectorResult.sectionId;
            this.type = selectorResult.type;
            this.count = selectorResult.count;
        }
        
        // Default constructor
        public CountResult() {}
    }
    
    @HttpGet
    global static String getAccounts() {
        RestResponse response;
        try {
            String endpoint = RestContext.request.requestURI;
            String operation = RestContext.request.params.get('operation');
            String recordId = RestContext.request.params.get('recordId');
            List<String> types = RestContext.request.params.get('types')?.split(',');
            
            if(String.isBlank(operation)) {
                throw new AuraHandledException('Operation parameter is required');
            }
            
            switch on operation {
                when 'getQuestions' {
                    response = new RestResponse(getQuestionsList(recordId), 'Success', true);
                }
                when 'getResponses' {
                    response = new RestResponse(getSupplierResponseList(recordId), 'Success', true);
                }
                when 'getAssessment' {
                    response = new RestResponse(getSupplierAssessmentList(recordId), 'Success', true);
                }
                when 'getAccountAssessment' {
                    response = new RestResponse(getAccountAssessmentRecordData(recordId), 'Success', true);
                }
                when 'getCounts' {
                    String sectionId = RestContext.request.params.get('sectionId');
                    String accountAssRelId = RestContext.request.params.get('accountAssRelId');
                    String type = RestContext.request.params.get('type');
                    List<AssessmentSelectorPoc.CountResult> counts = accAssSelector.getCounts(sectionId, accountAssRelId, type);
                    response = new RestResponse(counts, 'Success', true);
                }
                when 'getEditPermissions' {
                    response = new RestResponse(accAssSelector.getEditResponses(recordId, types), 'Success', true);
                }
                when 'getSupplierInfo' {
                    response = new RestResponse(accAssSelector.getSupplierName(recordId), 'Success', true);
                }
                when else {
                    throw new AuraHandledException('Invalid operation specified');
                }
            }
        } catch(Exception e) {
            response = new RestResponse(null, e.getMessage(), false);
        }
        return JSON.serialize(response);
    }

    @HttpPost
    global static String handlePost() {
        RestResponse response;
        try {
            String jsonBody = RestContext.request.requestBody.toString();
            Map<String,Object> requestData = (Map<String,Object>)JSON.deserializeUntyped(jsonBody);
            String operation = (String)requestData.get('operation');
            
            switch on operation {
                when 'createResponse' {
                    List<Response__c> responses = (List<Response__c>)JSON.deserialize(JSON.serialize(requestData.get('responses')), List<Response__c>.class);
                    String paramMap = JSON.serialize(requestData.get('paramMap'));
                    List<Response__c> createdResponses = accAssSelector.createSupplierResponse(responses, paramMap);
                    response = new RestResponse(createdResponses, 'Success', true);
                }
                when 'updateAssessmentStatus' {
                    String paramMap = JSON.serialize(requestData.get('paramMap'));
                    List<AccountAssessmentRelation__c> updatedAssessments = accAssSelector.updateAccountAssessmentStatus(paramMap);
                    response = new RestResponse(updatedAssessments, 'Assessment status updated successfully', true);
                }
                when 'updatePdfContent' {
                    String paramMap = JSON.serialize(requestData.get('paramMap'));
                    accAssSelector.updatePdfContent(paramMap);
                    response = new RestResponse(null, 'PDF content updated successfully', true);
                }
                when 'insertRejectFlag' {
                    List<Response__c> rejectFlags = (List<Response__c>)JSON.deserialize(JSON.serialize(requestData.get('rejectFlags')), List<Response__c>.class);
                    List<AccountAssessmentRelation__c> assessments = (List<AccountAssessmentRelation__c>)JSON.deserialize(JSON.serialize(requestData.get('assessments')), List<AccountAssessmentRelation__c>.class);
                    accAssSelector.insertRejectFlag(rejectFlags, assessments);
                    response = new RestResponse(null, 'Reject flags inserted successfully', true);
                }
                when 'updateRejectFlag' {
                    List<Response__c> rejectFlags = (List<Response__c>)JSON.deserialize(JSON.serialize(requestData.get('rejectFlags')), List<Response__c>.class);
                    List<AccountAssessmentRelation__c> assessments = (List<AccountAssessmentRelation__c>)JSON.deserialize(JSON.serialize(requestData.get('assessments')), List<AccountAssessmentRelation__c>.class);
                    accAssSelector.updateRejectFlag(rejectFlags, assessments);
                    response = new RestResponse(null, 'Reject flags updated successfully', true);
                }
                when 'deleteResponse' {
                    Map<String, Object> paramMap = (Map<String, Object>)requestData.get('paramMap');
                    List<Response__c> deletedResponses = accAssSelector.deleteResponse(paramMap);
                    response = new RestResponse(null, 'Responses deleted successfully', true);
                }
                when else {
                    response = new RestResponse(null, 'Invalid operation specified', false);
                }
            }
        } catch(Exception e) {
            response = new RestResponse(null, e.getMessage(), false);
        }
        return JSON.serialize(response);
    }

    // LWC @AuraEnabled methods
    @AuraEnabled
    public static List<Question__c> getQuestionsList(String templateId){
        try{
            templateId = String.escapeSingleQuotes(templateId);
            return accAssSelector.getQuestionsList(templateId);
        }catch(exception e){
            String errorMsg = UtilityConstants.ERROR_MSG_OCCURED;
            throw new AuraHandledException(errorMsg);
        }
    }
    
    @AuraEnabled
    public static List<Response__c> getSupplierResponseList(String assessmentId){
        try{
            assessmentId = String.escapeSingleQuotes(assessmentId);
            return accAssSelector.getSupplierResponseList(assessmentId);
        }catch(exception e){
            String errorMsg = UtilityConstants.ERROR_MSG_OCCURED;
            throw new AuraHandledException(errorMsg);
        }
    }
    
    @AuraEnabled
    public static List<AccountAssessmentRelation__c> getSupplierAssessmentList(String assessmentId){
        try{
            assessmentId = String.escapeSingleQuotes(assessmentId);
            return accAssSelector.getSupplierAssessmentList(assessmentId);
        }catch(exception e){
            String errorMsg = UtilityConstants.ERROR_MSG_OCCURED;
            throw new AuraHandledException(errorMsg);
        }
    }

    @AuraEnabled
    public static List<AccountAssessmentRelation__c> getAccountAssessmentRecordData(String assrecordId){
        try{
            assrecordId = String.escapeSingleQuotes(assrecordId);
            return accAssSelector.getAccountAssessmentRecordData(assrecordId);
        }catch(exception e){
            String errorMsg = UtilityConstants.ERROR_MSG_OCCURED;
            throw new AuraHandledException(errorMsg);
        }
    }

    @AuraEnabled
    public static List<AssessmentSelectorPoc.CountResult> getCounts(String sectionId, String accountAssRelId, String type){
        try{
            return accAssSelector.getCounts(sectionId, accountAssRelId, type);
        }catch(exception e){
            String errorMsg = UtilityConstants.ERROR_MSG_OCCURED;
            throw new AuraHandledException(errorMsg);
        }
    }

    @AuraEnabled
    public static Map<String, Boolean> getEditResponses(String accountAssessmentId, List<String> types){
        try{
            return accAssSelector.getEditResponses(accountAssessmentId, types);
        }catch(exception e){
            String errorMsg = UtilityConstants.ERROR_MSG_OCCURED;
            throw new AuraHandledException(errorMsg);
        }
    }

    @AuraEnabled
    public static Map<String, String> getSupplierName(String accountAssessmentId){
        try{
            return accAssSelector.getSupplierName(accountAssessmentId);
        }catch(exception e){
            String errorMsg = UtilityConstants.ERROR_MSG_OCCURED;
            throw new AuraHandledException(errorMsg);
        }
    }
}