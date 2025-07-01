public class AssessmentFindingServicePoc {
    
    private static SecurityCheckController safe = new SecurityCheckController();
	private static Savepoint sp;

	private static AssessmentFindingServicePoc service = null;


	public static AssessmentFindingServicePoc getInstance() {
        if (service == null) {
            service = new AssessmentFindingServicePoc();
        }
        return service;
    }
    
    
    
    
    
    public Id createTaskRelatedAssessment(List<Task> taskData, Boolean isSubmit){
		try{
			if(isSubmit){
				Database.SaveResult[] results = safe.doInsert(taskData);
				List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);

				if (errorsList.size() > 0) {
					Database.rollback(sp);
					throw new SecurityControllerException(String.join(errorsList, ', '));
				}
				return results[0].getId();
			}
			else{
				Database.SaveResult[] results = safe.doUpdate(taskData);
				List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);

				if (errorsList.size() > 0) {
					Database.rollback(sp);
					throw new SecurityControllerException(String.join(errorsList, ', '));
				}
				return results[0].getId();
			}
		}
		catch(Exception e){
			throw new AuraHandledException(UtilityConstants.ERROR_MSG_OCCURED);
		}
    }

	public class SecurityControllerException extends Exception{
    }

}