public with sharing class AssessmentFindingSelectorPoc {
    private static AssessmentFindingSelectorPoc selectorInstance = null;
    
    public static AssessmentFindingSelectorPoc getInstance(){
        if(selectorInstance == null){
            selectorInstance = new AssessmentFindingSelectorPoc();
        }
        return selectorInstance;
    }
    
      public List<Rhythm__Assessment_Finding__c> getFindingsRecords(string accountAssessment){
        return [SELECT Rhythm__Assessment_Question__c 
                FROM Rhythm__Assessment_Finding__c 
                WHERE Rhythm__AccountAssessmentRelation__c=:accountAssessment 
                WITH SECURITY_ENFORCED];
    }

     public Rhythm__Assessment_Finding__c getFindings(String accountAssessmentRelation, String responseId, String questionId) {
        accountAssessmentRelation = String.escapeSingleQuotes(accountAssessmentRelation);
        responseId = String.escapeSingleQuotes(responseId);
        questionId = String.escapeSingleQuotes(questionId);
        List<Rhythm__Assessment_Finding__c> findings = [
            SELECT Id, Name, Rhythm__Finding_Type__c, Rhythm__Finding_Description__c, Rhythm__Root_Cause__c, Rhythm__Status__c,
                   Rhythm__Repeat_Finding__c, Rhythm__Resolution_Time_Frame__c, Rhythm__Assessment_Area__c
            FROM Rhythm__Assessment_Finding__c
            WHERE Rhythm__AccountAssessmentRelation__c = :accountAssessmentRelation
            //AND Rhythm__Supplier_Response__c = :responseId
            AND Rhythm__Assessment_Question__c = :questionId
            WITH SECURITY_ENFORCED
            LIMIT 1 
        ];
        return (!findings.isEmpty()) ? findings[0] : null;
    }



       public List<User> getAllUsers(){
        return [SELECT Id, Name 
            FROM User WITH SECURITY_ENFORCED LIMIT 5000];
    }
    public List<sObject> getAllAssessmentType() {
    return [
        SELECT Id, Name 
        FROM Rhythm__Assessment_Type__c 
        WITH SECURITY_ENFORCED 
        LIMIT 5000
    ];
}
    
     public Task getTaskRelatedToFindings(Id recordId){
        recordId = String.escapeSingleQuotes(recordId);
        List<Task> taskData = [SELECT Id, Subject, Description, ActivityDate, Priority, Status, OwnerId FROM Task WHERE WhatId = :recordId WITH SECURITY_ENFORCED LIMIT 1];
        return (!taskData.isEmpty()) ? taskData[0] : null;
    }


}