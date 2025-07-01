@RestResource(urlMapping='/assessmenttype/*')
global with sharing class AssessmentTypeController {
 
    global class TemplateDTO {
        public String id;
        public String name;
        public String recordType;
        public String assessmentArea;
        public String status;
    }
 
    @HttpGet
    global static List<TemplateDTO> getTemplatesForChecklist() {
        List<Rhythm__Assessment_Type__c> templates = [
            SELECT Id,Name,RecordType.Name,Rhythm__Status__c,Rhythm__Assessment_Area__c from Rhythm__Assessment_Type__c
        ];
 
        List<TemplateDTO> result = new List<TemplateDTO>();
 
        for (Rhythm__Assessment_Type__c t : templates) {
            TemplateDTO dto = new TemplateDTO();
            dto.id = t.Id;
            dto.name = t.Name;
            dto.recordType = t.RecordType != null ? t.RecordType.Name : null;
            dto.status = t.Rhythm__Status__c;
            dto.assessmentArea = t.Rhythm__Assessment_Area__c;
            result.add(dto);
        }
        return result;
    }
}