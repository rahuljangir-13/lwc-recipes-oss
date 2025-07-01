@RestResource(urlMapping='/assessmenttemplates/*')
global with sharing class AssessmentTemplateRestController {

    global class TemplateDTO {
        public String id;
        public String name;
        public Decimal numberOfAssessment;
        public String createdFor;
        public String description;
        public String status;
        public String assessmentType;
        public String category;
        public String createdDate;
        public String lastModifiedDate;
        
    }

    @HttpGet
    global static List<TemplateDTO> getTemplatesForChecklist() {
        List<Assessment_Template__c> templates = [
            SELECT Id, Name, Status__c, CreatedDate, Last_Modified_Date__c,Rhythm__Number_of_Assessments__c,Rhythm__Created_For__r.Name,Rhythm__Template_Description__c,Rhythm__Assessment_Type__r.Name,Rhythm__Template_Category__c
            FROM Assessment_Template__c
        ];

        List<TemplateDTO> result = new List<TemplateDTO>();

        for (Assessment_Template__c t : templates) {
            TemplateDTO dto = new TemplateDTO();
            dto.id = t.Id;
            dto.name = t.Name;
            dto.status = t.Status__c;
            dto.assessmentType = t.Rhythm__Assessment_Type__r.Name;
            dto.numberOfAssessment = t.Rhythm__Number_of_Assessments__c;
            dto.createdFor = t.Rhythm__Created_For__r.Name;
            dto.category = t.Rhythm__Template_Category__c;
            dto.description = t.Rhythm__Template_Description__c;
            dto.createdDate = String.valueOf(t.CreatedDate);
            dto.lastModifiedDate = String.valueOf(t.Last_Modified_Date__c);
            result.add(dto);
        }

        return result;
    }
}