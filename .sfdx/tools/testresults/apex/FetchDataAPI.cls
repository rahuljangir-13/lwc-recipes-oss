@RestResource(urlMapping='/fetchData/')
global with sharing class FetchDataAPI {

    @HttpGet
    global static void getData() {
        RestResponse res = RestContext.response;
        RestRequest req = RestContext.request;

        try {
            // Query Rhythm__Assessment__Template__c records
            List<Rhythm__Assessment_Template__c> templateList = [
                SELECT Name FROM Rhythm__Assessment_Template__c
            ];

            // Query Account records with specific RecordTypeId
            List<Account> accountList = [
                SELECT Name FROM Account WHERE RecordTypeId = '0127z000009w9nLAAQ'
            ];

            // Build response map
            Map<String, Object> responseMap = new Map<String, Object>();
            responseMap.put('templates', templateList);
            responseMap.put('accounts', accountList);

            // Serialize response
            res.responseBody = Blob.valueOf(JSON.serialize(responseMap));
            res.statusCode = 200;

        } catch (Exception e) {
            res.statusCode = 500;
            res.responseBody = Blob.valueOf(
                JSON.serialize(
                    new Map<String, Object>{
                        'error' => e.getMessage()
                    }
                )
            );
        }
    }
}