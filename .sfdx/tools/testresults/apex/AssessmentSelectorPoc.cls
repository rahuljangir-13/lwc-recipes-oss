public class AssessmentSelectorPoc {
    
    private static AssessmentSelectorPoc selectorInstance = null; //private static instance of the class
    
    public static AssessmentSelectorPoc getInstance(){
        if(selectorInstance == null){
            selectorInstance = new AssessmentSelectorPoc();
        }
        return selectorInstance;
    }
    
    public List<AccountAssessmentRelation__c> getSupplierAssessmentList(String assessmentId){
        try{
            assessmentId = String.escapeSingleQuotes(assessmentId);
            List<AccountAssessmentRelation__c> acctAssessmntList =  [SELECT Id,Assessment__r.Name,Assessment__r.Template__c,PdfConvertor__c,
                                                                    Assessment__r.Header__c,countAttributes__c,Score__c,maxPossibleScore__c,
                                                                    Assessment__r.Disclosure__c,Status__c,Account__r.Name
                                                                    FROM AccountAssessmentRelation__c
                                                                    WHERE Id=:assessmentId
                                                                    WITH SECURITY_ENFORCED
                                                                    LIMIT 1];
            return acctAssessmntList;
        }catch(exception e){
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public List<Question__c> getQuestionsList(String templateId){
        try{
            templateId = String.escapeSingleQuotes(templateId);
            List<Question__c> questionList = [SELECT Id,Name,Section__c,Question_Type__c,
                                            Required__c,Default_Value__c,Conditional_Response__c,
                                            OptionValueSet__c,Question_Sequence_Number__c,Question__c,Requires_File_Upload__c,
                                            Parent_Question__c,HelpText__c,Section__r.Section_Sequence_Number__c,
                                            Section__r.Name,Section__r.Id,Assessment_Template__c, Section__r.Internal_Use_Only__c
                                            FROM Question__c
                                            WHERE Assessment_Template__c =:templateId
                                            WITH SECURITY_ENFORCED
                                            ORDER BY Section__r.Section_Sequence_Number__c,Question_Sequence_Number__c];
            return questionList;
        }catch(exception e){
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public List<Response__c> getSupplierResponseList(String assessmentId){
        try{
            assessmentId = String.escapeSingleQuotes(assessmentId);
            List<Response__c> responseList = [SELECT Id,Question__c,Assessment__c,Question__r.Question_Type__c,
                                            Assessment__r.Name,Files__c,Response__c,Reject__c,preferred_Non_preferred__c,
                                            CreatedDate,Flag__c,Conversation_History__c,LastModifiedDate,LastModifiedById,Emails__c
                                            FROM Response__c
                                            WHERE AccountAssessmentRelation__c= :assessmentId
                                            AND Is_Latest_Response__c= true
                                            WITH SECURITY_ENFORCED];
            return responseList;
        }catch(exception e){
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public List<Response__c> createSupplierResponse(List<Response__c> suppResponseList, String paramMap) {
        try {
            Map<String, Object> params = (Map<String, Object>)JSON.deserializeUntyped(paramMap);
            if(suppResponseList != null && !suppResponseList.isEmpty()) {
                upsert suppResponseList;
                return suppResponseList;
            }
            return null;
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public List<AccountAssessmentRelation__c> updateAccountAssessmentStatus(String paramMap) {
        try {
            Map<String, Object> params = (Map<String, Object>)JSON.deserializeUntyped(paramMap);
            String assessmentId = (String)params.get('assessmentId');
            String status = (String)params.get('status');
            
            List<AccountAssessmentRelation__c> accountAssessments = [
                SELECT Id, Status__c 
                FROM AccountAssessmentRelation__c 
                WHERE Id = :assessmentId 
                WITH SECURITY_ENFORCED
            ];
            
            if(!accountAssessments.isEmpty()) {
                accountAssessments[0].Status__c = status;
                update accountAssessments;
            }
            
            return accountAssessments;
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public void updatePdfContent(String paramMap) {
        try {
            Map<String, Object> params = (Map<String, Object>)JSON.deserializeUntyped(paramMap);
            String assessmentId = (String)params.get('assessmentId');
            String pdfContent = (String)params.get('pdfContent');
            
            List<AccountAssessmentRelation__c> accountAssessments = [
                SELECT Id, PdfConvertor__c 
                FROM AccountAssessmentRelation__c 
                WHERE Id = :assessmentId 
                WITH SECURITY_ENFORCED
            ];
            
            if(!accountAssessments.isEmpty()) {
                accountAssessments[0].PdfConvertor__c = pdfContent;
                update accountAssessments;
            }
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public List<AccountAssessmentRelation__c> getAccountAssessmentRecordData(String assrecordId) {
        try {
            assrecordId = String.escapeSingleQuotes(assrecordId);
            return [SELECT Id, IsDeleted, Name, Account__c, Assessment__c, Assessment__r.Name, PdfConvertor__c,
                   Assessment__r.Status__c, Assessment__r.Customer_Review__c, CreatedDate, Account__r.Name,
                   Assessment__r.Number_of_Questions__c, Start_Date__c, End_Date__c, Status__c,
                   Assessment__r.Additional_Requests__c, Number_of_Questions__c, Assessment__r.CreatedDate,
                   Assessment__r.Template__c, Number_of_Responses__c, Assessment__r.CreatedBy.Name,
                   Assessment__r.CreatedUser__c, CreatedBy.Name, Score__c, maxPossibleScore__c, countAttributes__c
                   FROM AccountAssessmentRelation__c
                   WHERE Id = :assrecordId
                   WITH SECURITY_ENFORCED];
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public List<CountResult> getCounts(String sectionId, String accountAssRelId, String type) {
          if (String.isBlank(type) || (type != 'findings' && type != 'comments' && type != 'tasks')) {
        throw new AuraHandledException('Invalid type passed: ' + type + '. Expected "findings" or "comments" or "tasks".');
    }
        List<CountResult> results = new List<CountResult>();

        if (type == 'findings') {
            // Fetch action items count
            AggregateResult[] findingItemsResults = [
                SELECT Rhythm__Assessment_Question__r.Rhythm__Section__c sectionId, COUNT(Id) findingsItemsCountQ
                FROM Rhythm__Assessment_Finding__c
                WHERE Rhythm__AccountAssessmentRelation__r.Id = :accountAssRelId
                AND Rhythm__Assessment_Question__r.Rhythm__Section__c = :sectionId
                WITH SECURITY_ENFORCED
                GROUP BY Rhythm__Assessment_Question__r.Rhythm__Section__c
            ];
            for (AggregateResult result : findingItemsResults) {
                CountResult countResult = new CountResult();
                countResult.sectionId = (String) result.get('sectionId');
                countResult.type = type;
                countResult.count = (Integer) result.get('findingsItemsCountQ');
                results.add(countResult);
            }
            System.debug('log in line 826' + results);
        } else if (type == 'comments') {
            // Fetch comments count
            List<Rhythm__Response__c> responses = [
                SELECT Rhythm__Conversation_History__c 
                FROM Rhythm__Response__c 
                WHERE Rhythm__AccountAssessmentRelation__r.Id = :accountAssRelId
                AND Rhythm__Question__r.Rhythm__Section__r.Id = :sectionId 
                WITH SECURITY_ENFORCED
            ];
            Integer conversationLength = 0;
            for (Rhythm__Response__c response : responses) {
                if (String.isNotBlank(response.Rhythm__Conversation_History__c)) {
                    List<Object> conversations = (List<Object>) JSON.deserializeUntyped(response.Rhythm__Conversation_History__c);
                    conversationLength = conversationLength + conversations.size();
                }
                CountResult countResult = new CountResult();
                countResult.sectionId = sectionId;
                countResult.type = type;
                countResult.count = conversationLength;
                results.add(countResult);
            }
        }
        else if(type == 'tasks'){
            AggregateResult[] taskCountData = [
                SELECT COUNT(Id) taskCount, WhatId
                FROM Task 
                WHERE WhatId IN (
                    SELECT Id 
                    FROM Rhythm__Assessment_Finding__c 
                    WHERE Rhythm__Assessment_Question__r.Rhythm__Section__c = :sectionId 
                    AND Rhythm__AccountAssessmentRelation__r.Id = :accountAssRelId
                )
                WITH SECURITY_ENFORCED
                GROUP BY WhatId         
        ];
        CountResult countResult = new CountResult();
        countResult.sectionId = sectionId;
        countResult.type = type;
        countResult.count = taskCountData.size();
        results.add(countResult);
        }
        return results;
    }
    
    public void insertRejectFlag(List<Response__c> insertRejectFlagList, List<AccountAssessmentRelation__c> accountAssessment) {
        try {
            if(insertRejectFlagList != null && !insertRejectFlagList.isEmpty()) {
                insert insertRejectFlagList;
                if(accountAssessment != null && !accountAssessment.isEmpty()) {
                    update accountAssessment;
                }
            }
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public void updateRejectFlag(List<Response__c> updateRejectFlagList, List<AccountAssessmentRelation__c> accountAssessment) {
        try {
            if(updateRejectFlagList != null && !updateRejectFlagList.isEmpty()) {
                update updateRejectFlagList;
                if(accountAssessment != null && !accountAssessment.isEmpty()) {
                    update accountAssessment;
                }
            }
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public List<Response__c> getResponseList(String paramMap) {
        try {
            Map<String, Object> params = (Map<String, Object>)JSON.deserializeUntyped(paramMap);
            String questionId = (String)params.get('questionId');
            String accountAssessmentId = (String)params.get('accountAssessmentId');
            
            return [SELECT Id, Question__c, Response__c, Flag__c, Reject__c, 
                   preferred_Non_preferred__c, Files__c, Conversation_History__c
                   FROM Response__c 
                   WHERE Question__c = :questionId 
                   AND AccountAssessmentRelation__c = :accountAssessmentId
                   AND Is_Latest_Response__c = true
                   WITH SECURITY_ENFORCED];
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }

    public List<Response__c> deleteResponse(Map<String, Object> paramMap) {
        try {
            String questionId = (String)paramMap.get('responsequestionId');
            String accountAssessmentId = (String)paramMap.get('accountassessmentId');
            
            List<Response__c> responsesToDelete = [
                SELECT Id FROM Response__c 
                WHERE Question__c = :questionId 
                AND AccountAssessmentRelation__c = :accountAssessmentId
                WITH SECURITY_ENFORCED
            ];
            
            if(!responsesToDelete.isEmpty()) {
                delete responsesToDelete;
            }
            return responsesToDelete;
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }

    public Map<String, Boolean> getEditResponses(String accountAssessmentId, List<String> types) {
        try {
            Map<String, Boolean> editPermissions = new Map<String, Boolean>();
            
            if(String.isNotBlank(accountAssessmentId) && types != null) {
                AccountAssessmentRelation__c accAssessment = [
                    SELECT Id, Status__c 
                    FROM AccountAssessmentRelation__c 
                    WHERE Id = :accountAssessmentId
                    WITH SECURITY_ENFORCED
                    LIMIT 1
                ];
                
                for(String type : types) {
                    Boolean canEdit = false;
                    if(accAssessment != null) {
                        // Add logic based on assessment status and type
                        canEdit = accAssessment.Status__c != 'Submitted' 
                            && accAssessment.Status__c != 'Closed';
                    }
                    editPermissions.put(type, canEdit);
                }
            }
            System.debug(editPermissions);
            return editPermissions;
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }

    public Map<String, String> getSupplierName(String accountAssessmentId) {
        try {
            Map<String, String> result = new Map<String, String>();
            
            if(String.isNotBlank(accountAssessmentId)) {
                AccountAssessmentRelation__c accAssessment = [
                    SELECT Id, Account__r.Name, Assessment__r.Name
                    FROM AccountAssessmentRelation__c 
                    WHERE Id = :accountAssessmentId
                    WITH SECURITY_ENFORCED
                    LIMIT 1
                ];
                
                if(accAssessment != null) {
                    result.put('accountName', accAssessment.Account__r.Name);
                    result.put('assessmentName', accAssessment.Assessment__r.Name);
                }
            }
            return result;
        } catch(Exception e) {
            throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
        }
    }
    
    public class CountResult {
        @AuraEnabled public String sectionId { get; set; }
        @AuraEnabled public String type { get; set; }
        @AuraEnabled public Integer count { get; set; }
    }
}