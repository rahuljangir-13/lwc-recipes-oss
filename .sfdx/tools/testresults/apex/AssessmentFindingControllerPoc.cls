@RestResource(urlMapping='/findings/*')
global class AssessmentFindingControllerPoc {
    
    static AssessmentFindingSelectorPoc findingSelector = AssessmentFindingSelectorPoc.getInstance();
  static AssessmentFindingServicePoc service = AssessmentFindingServicePoc.getInstance();
    
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
    
    @HttpGet
    global static String getFindings() {
        RestResponse response;
        try {
            String operation = RestContext.request.params.get('operation');
            String accountAssessmentId = RestContext.request.params.get('accountAssessmentId');
            
            if(String.isBlank(operation)) {
                throw new AuraHandledException('Operation parameter is required');
            }
            
            switch on operation {
                when 'getFindingsrecord' {
                    if(String.isBlank(accountAssessmentId)) {
                        throw new AuraHandledException('Account Assessment ID is required');
                    }
                    List<Rhythm__Assessment_Finding__c> findings = findingSelector.getFindingsRecords(accountAssessmentId);
                    response = new RestResponse(findings, 'Success', true);
                }
                when 'getfindings'{
                   String accountAssessmentRelation=RestContext.request.params.get('accountAssessmentRelation');
                    String questionId=RestContext.request.params.get('questionId');
                    System.debug('line46'+accountAssessmentRelation+questionId);
                   
                    Rhythm__Assessment_Finding__c questionfinding= findingSelector.getFindings(accountAssessmentRelation, 'hii',questionId);
                    response = new RestResponse(questionfinding, 'Success', true);
                    
                    System.debug('line 49'+questionfinding);
                    
                }
                
                when 'getAllUsers'{
                    List<User> users=findingSelector.getAllUsers();
                     response = new RestResponse(users, 'Success', true);
                }
                when 'getTaskRelatedToFindings'{
                    String recordId=RestContext.request.params.get('recordId');
                    Task taskfindings=findingSelector.getTaskRelatedToFindings(recordId);  
                    response = new RestResponse(taskfindings, 'Success', true);
                }
                when 'getAllAssessmentType'{
                    List<sObject> type=findingSelector.getAllAssessmentType();
                    response = new RestResponse(type, 'Success', true);
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
    
    @AuraEnabled
    public static List<Rhythm__Assessment_Finding__c> getFindingsRecords(String accountAssessment) {
        try {
            return findingSelector.getFindingsRecords(accountAssessment);
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    
     public static Rhythm__Assessment_Finding__c getFindings(String accountAssessmentRelation, String responseId, String questionId) {
        try {
            accountAssessmentRelation = String.escapeSingleQuotes(accountAssessmentRelation);
            responseId = String.escapeSingleQuotes(responseId);
            questionId = String.escapeSingleQuotes(questionId);
            return findingSelector.getFindings(accountAssessmentRelation, responseId, questionId);
        } catch (Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    
    
       @AuraEnabled(cacheable=true)
    public static List<User> getAllUsers(){
        try{
          return findingSelector.getAllUsers();
        }
        catch(Exception e){
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    
     @AuraEnabled(cacheable=true)
    public static List<sObject> getAllAssessmentType(){
        try{
          return findingSelector.getAllAssessmentType();
        }
        catch(Exception e){
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    
    
     @AuraEnabled
    public static Id createTaskRelatedAssessment(List<Task> taskData, Boolean isSubmit){
        try{
        return service.createTaskRelatedAssessment(taskData, isSubmit);
        }
        catch(Exception e){
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    
    
     @AuraEnabled
    public static Task getTaskRelatedToFindings(Id recordId){
        try{
            recordId = String.escapeSingleQuotes(recordId);
            return findingSelector.getTaskRelatedToFindings(recordId);
        }
        catch (Exception e) {
            throw new AuraHandledException('No task response found.' + UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    
    
    
    
    
    
     
     @HttpPost
    global static String handleTaskOperation() {
        RestRequest req = RestContext.request;
       // RestResponse res = RestContext.response;
        String jsonResponse = '';
        Savepoint sp = Database.setSavepoint();
       // SecurityCheck safe = new SecurityCheck();
        
        try {
            // Parse the request body
            String requestBody = req.requestBody.toString();
            Map<String, Object> requestMap = (Map<String, Object>) JSON.deserializeUntyped(requestBody);
            
            // Extract operation type and isSubmit flag
            String operation = (String) requestMap.get('operation');
            Boolean isSubmit = (Boolean) requestMap.get('isSubmit');
            System.debug(isSubmit);
            
            
            if (operation == 'createTask') {
                // Get the task data array
                List<Object> taskDataList = (List<Object>) requestMap.get('taskData');
               
                List<Task> tasksToCreate = new List<Task>();
                
                // Convert JSON task data to Task sObjects
                for (Object taskObj : taskDataList) {
                    Map<String, Object> taskMap = (Map<String, Object>) taskObj;
                    Task newTask = new Task(
                        Subject = (String) taskMap.get('Subject'),
                        Description = (String) taskMap.get('Description'),
                        ActivityDate = Date.valueOf((String) taskMap.get('ActivityDate')),
                        Priority = (String) taskMap.get('Priority'),
                        Status = (String) taskMap.get('Status'),
                        OwnerId = (Id) taskMap.get('OwnerId'),
                        WhatId = (Id) taskMap.get('WhatId')
                    );
                    tasksToCreate.add(newTask);
                }
                
                // Call your existing method to create/update tasks
                 System.debug(tasksToCreate);
                Id taskId = createTaskRelatedAssessment(tasksToCreate, isSubmit);
                
                // Prepare success response
                Map<String, Object> responseMap = new Map<String, Object>{
                    'success' => true,
                    'message' => 'Task created successfully',
                    'taskId' => taskId
                };
                jsonResponse = JSON.serialize(responseMap);
            } else {
                throw new AuraHandledException('Invalid operation type');
            }
            
        } catch (Exception e) {
            // Handle errors
            Map<String, Object> errorMap = new Map<String, Object>{
                'success' => false,
                'message' => e.getMessage()
            };
            jsonResponse = JSON.serialize(errorMap);
            //res.statusCode = 400;
        }
        system.debug(jsonResponse);
        return jsonResponse;
    }
}