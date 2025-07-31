import { LightningElement, track, api } from 'lwc';
import { isOnline } from 'c/utils';

export default class SafetyEventForm extends LightningElement {
    @api objectApiName = '';
    @api isVisible = false;

    @track sections = [];
    @track formData = {};
    @track isLoading = false;
    @track error = null;
    @track showSpinner = false;
    @track lookupOptionsMap = {};
    @track devNameToApi = {};
    @track allFieldsMap = {};
    @track controllingFieldsMap = {};
    @track objectSchema = {};
    @track picklistValues = {};

    // Form configuration
    @track formTitle = '';
    @track acceptedFormats = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.txt';

    connectedCallback() {
        console.log(
            'SafetyEventForm connected with objectApiName:',
            this.objectApiName
        );
    }

    // Watch for changes to isVisible and objectApiName
    renderedCallback() {
        console.log('🔄 RenderedCallback called');
        console.log('🔄 isVisible:', this.isVisible);
        console.log('🔄 objectApiName:', this.objectApiName);
        console.log('🔄 sections.length:', this.sections.length);

        if (
            this.isVisible &&
            this.objectApiName &&
            this.sections.length === 0
        ) {
            console.log('🔄 Conditions met, initializing form...');
            this.initializeForm();
        } else {
            console.log('🔄 Conditions not met for form initialization');
        }
    }

    // Prevent modal from closing when clicking inside the modal
    handleModalClick(event) {
        event.stopPropagation();
    }

    async initializeForm() {
        console.log('🚀 Initializing form for object:', this.objectApiName);

        // Set form title based on object type
        const titleMap = {
            Rhythm__Hazard__c: 'Report a Hazard',
            Rhythm__Incident__c: 'Report an Incident'
        };
        this.formTitle = titleMap[this.objectApiName] || 'Submit a Report';
        console.log('🚀 Form title set to:', this.formTitle);

        // Load metadata and configure form
        console.log('🚀 Loading metadata configuration...');
        await this.loadMetadataConfiguration();
        console.log('🚀 Form initialization complete');
    }

    async loadMetadataConfiguration() {
        if (!isOnline()) {
            this.error =
                'Please connect to internet to load form configuration';
            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const jsforce = window.jsforce;
            if (!jsforce) {
                throw new Error('JSForce library not loaded');
            }

            const accessToken = sessionStorage.getItem('sf_access_token');
            const instanceUrl = sessionStorage.getItem('sf_instance_url');

            if (!accessToken || !instanceUrl) {
                throw new Error('Not authenticated. Please login first.');
            }

            const conn = new jsforce.Connection({
                accessToken: accessToken,
                instanceUrl: instanceUrl
            });

            // Query field metadata - using correct field names
            const metadataQuery = `
                SELECT Id, MasterLabel, DeveloperName, 
                       Rhythm__Object_Api_Name__c, Rhythm__Field_Api_Name__c,
                       Rhythm__Required__c, Rhythm__IsActive__c,
                       Rhythm__Section_Name__c, Rhythm__Order__c,
                       Rhythm__Lookup_Filter_Label__c
                FROM Rhythm__Fields_Level_Configuration__mdt 
                WHERE Rhythm__Object_API_Name__c = '${this.objectApiName}'
                ORDER BY Rhythm__Section_Name__c, Rhythm__Order__c
            `;

            console.log('🔍 Executing metadata query:', metadataQuery);
            const metadataResult = await conn.query(metadataQuery);
            console.log('📊 Metadata query result:', metadataResult);
            console.log(
                '📊 Metadata records found:',
                metadataResult.records.length
            );

            // Query controlling fields metadata - using correct field names
            const controllingQuery = `
                SELECT MasterLabel, DeveloperName,
                       Label, Rhythm__Fields_Level_Configuration__c, Rhythm__Value__c
                FROM Rhythm__Controlling_Field__mdt
            `;

            console.log(
                '🔍 Executing controlling fields query:',
                controllingQuery
            );
            const controllingResult = await conn.query(controllingQuery);
            console.log(
                '📊 Controlling fields query result:',
                controllingResult
            );
            console.log(
                '📊 Controlling fields records found:',
                controllingResult.records.length
            );

            // Query object schema for field types and picklist values
            console.log('🔍 Querying object schema for field types...');
            await this.loadObjectSchema(conn);

            // Process metadata
            this.processMetadata(
                metadataResult.records,
                controllingResult.records
            );
        } catch (error) {
            console.error('❌ Error loading metadata:', error);
            this.error = `Failed to load form configuration: ${error.message}`;
        } finally {
            this.isLoading = false;
        }
    }

    processMetadata(fieldMetadata, controllingMetadata) {
        console.log('🏗️ Starting metadata processing...');
        console.log('🏗️ Field metadata records:', fieldMetadata);
        console.log('🏗️ Controlling metadata records:', controllingMetadata);

        // Build controlling fields map using the corrected logic
        this.controllingFieldsMap = {};
        controllingMetadata.forEach((ctrl) => {
            console.log('🔗 Processing controlling field:', ctrl);
            // Key format: {dependent_field_dev_name}_{expected_value}
            const key = `${ctrl.Rhythm__Fields_Level_Configuration__c}_${ctrl.Rhythm__Value__c}`;
            this.controllingFieldsMap[key] = {
                label: ctrl.Label, // This is the controlling field's developer name
                dependentField: ctrl.Rhythm__Fields_Level_Configuration__c,
                expectedValue: ctrl.Rhythm__Value__c,
                masterLabel: ctrl.MasterLabel
            };
            console.log(
                '🔗 Added controlling field mapping:',
                key,
                this.controllingFieldsMap[key]
            );
        });
        console.log(
            '🔗 Complete controlling fields map:',
            this.controllingFieldsMap
        );

        // Group fields by section
        const sectionMap = {};
        this.devNameToApi = {};
        this.allFieldsMap = {};

        console.log('📋 Processing field metadata...');
        fieldMetadata.forEach((field, index) => {
            console.log(`📋 Processing field ${index + 1}:`, field);

            // Skip inactive fields
            if (!field.Rhythm__IsActive__c) {
                console.log(
                    `⏭️ Skipping inactive field: ${field.DeveloperName}`
                );
                return;
            }

            const sectionName =
                field.Rhythm__Section_Name__c || 'General Information';
            console.log(`📋 Field section: ${sectionName}`);

            if (!sectionMap[sectionName]) {
                sectionMap[sectionName] = [];
                console.log(`📂 Created new section: ${sectionName}`);
            }

            // Get field schema from object describe
            const fieldApiName = field.Rhythm__Field_Api_Name__c;
            const fieldSchema = this.objectSchema[fieldApiName];

            console.log(`📋 Field schema for ${fieldApiName}:`, fieldSchema);

            // Create field configuration with schema information
            const fieldConfig = {
                fieldApi: fieldApiName,
                label: fieldSchema?.label || field.MasterLabel, // Prefer schema label
                fieldType:
                    fieldSchema?.type || this.inferFieldType(fieldApiName), // Use schema type or fallback
                required:
                    field.Rhythm__Required__c || fieldSchema?.required || false,
                defaultValue: fieldSchema?.defaultValue || null,
                fieldOrder: field.Rhythm__Order__c || 0,
                developerName: field.DeveloperName,
                lookupFilterLabel: field.Rhythm__Lookup_Filter_Label__c,
                section: sectionName,
                isActive: field.Rhythm__IsActive__c,
                // Additional schema properties
                length: fieldSchema?.length,
                precision: fieldSchema?.precision,
                scale: fieldSchema?.scale,
                picklistValues: this.picklistValues[fieldApiName] || [],
                referenceTo: fieldSchema?.referenceTo || [],
                relationshipName: fieldSchema?.relationshipName
            };

            console.log(`📋 Created field config:`, fieldConfig);

            sectionMap[sectionName].push(fieldConfig);
            this.allFieldsMap[field.Rhythm__Field_Api_Name__c] = fieldConfig;

            if (field.DeveloperName) {
                this.devNameToApi[field.DeveloperName] =
                    field.Rhythm__Field_Api_Name__c;
                console.log(
                    `🔗 Dev name mapping: ${field.DeveloperName} -> ${field.Rhythm__Field_Api_Name__c}`
                );
            }

            // Initialize form data with default values
            if (fieldConfig.defaultValue) {
                this.formData[field.Rhythm__Field_Api_Name__c] =
                    fieldConfig.fieldType === 'BOOLEAN'
                        ? fieldConfig.defaultValue === 'true' ||
                          fieldConfig.defaultValue === true
                        : fieldConfig.defaultValue;
                console.log(
                    `📝 Set default value for ${field.Rhythm__Field_Api_Name__c}:`,
                    this.formData[field.Rhythm__Field_Api_Name__c]
                );
            }
        });

        console.log('📂 Section map created:', sectionMap);
        console.log('🔗 Dev name to API mapping:', this.devNameToApi);

        // Convert to sections array and sort
        this.sections = Object.keys(sectionMap)
            .map((sectionName) => ({
                name: sectionName,
                label: sectionName.replace(/_/g, ' '),
                fields: sectionMap[sectionName].sort(
                    (a, b) => a.fieldOrder - b.fieldOrder
                )
            }))
            .sort((a, b) => {
                const aOrder = a.fields[0]?.fieldOrder || 0;
                const bOrder = b.fields[0]?.fieldOrder || 0;
                return aOrder - bOrder;
            });

        console.log('✅ Final processed sections:', this.sections);
    }

    async loadObjectSchema(conn) {
        try {
            console.log('🔍 Describing object:', this.objectApiName);

            // Use JSForce to describe the object and get field metadata
            const describe = await conn.sobject(this.objectApiName).describe();
            console.log('📋 Object describe result:', describe);

            // Process field definitions
            this.objectSchema = {};
            this.picklistValues = {};

            describe.fields.forEach((field) => {
                console.log(`📋 Processing field schema: ${field.name}`, field);

                this.objectSchema[field.name] = {
                    name: field.name,
                    label: field.label,
                    type: field.type,
                    length: field.length,
                    precision: field.precision,
                    scale: field.scale,
                    nillable: field.nillable,
                    defaultValue: field.defaultValue,
                    picklistValues: field.picklistValues || [],
                    referenceTo: field.referenceTo || [],
                    relationshipName: field.relationshipName,
                    required: !field.nillable && !field.defaultedOnCreate,
                    createable: field.createable,
                    updateable: field.updateable
                };

                // Store picklist values separately for easier access
                if (
                    field.type === 'picklist' ||
                    field.type === 'multipicklist'
                ) {
                    this.picklistValues[field.name] = field.picklistValues.map(
                        (pv) => ({
                            label: pv.label,
                            value: pv.value,
                            active: pv.active,
                            defaultValue: pv.defaultValue
                        })
                    );
                    console.log(
                        `📋 Picklist values for ${field.name}:`,
                        this.picklistValues[field.name]
                    );
                }
            });

            console.log('✅ Object schema loaded:', this.objectSchema);
            console.log('✅ Picklist values loaded:', this.picklistValues);
        } catch (error) {
            console.error('❌ Error loading object schema:', error);
            // Continue without schema - will fall back to inferred types
        }
        console.log('✅ Total sections created:', this.sections.length);
        this.sections.forEach((section, index) => {
            console.log(
                `✅ Section ${index + 1}: ${section.label} (${section.fields.length} fields)`
            );
            section.fields.forEach((field, fieldIndex) => {
                console.log(
                    `   Field ${fieldIndex + 1}: ${field.label} (${field.fieldApi})`
                );
            });
        });
    }

    // Helper method to infer field type from API name
    inferFieldType(fieldApiName) {
        const lowerFieldName = fieldApiName.toLowerCase();

        if (
            lowerFieldName.includes('date') ||
            lowerFieldName.includes('time')
        ) {
            return 'DATE';
        }
        if (lowerFieldName.includes('email')) {
            return 'EMAIL';
        }
        if (lowerFieldName.includes('phone')) {
            return 'PHONE';
        }
        if (lowerFieldName.includes('url')) {
            return 'URL';
        }
        if (
            lowerFieldName.includes('number') ||
            lowerFieldName.includes('amount')
        ) {
            return 'NUMBER';
        }
        if (
            lowerFieldName.includes('description') ||
            lowerFieldName.includes('comment')
        ) {
            return 'TEXTAREA';
        }
        if (
            lowerFieldName.includes('checkbox') ||
            lowerFieldName.includes('flag') ||
            lowerFieldName.includes('is_')
        ) {
            return 'BOOLEAN';
        }
        return 'TEXT'; // Default to text
    }

    get renderedSections() {
        console.log('🎨 Rendering sections...');
        console.log('🎨 Available sections:', this.sections);

        const renderedSections = this.sections
            .map((section) => {
                console.log(`🎨 Processing section: ${section.label}`);
                console.log(`🎨 Section fields:`, section.fields);

                const visibleFields = section.fields
                    .filter((field) => {
                        const isVisible = this.isFieldVisible(field);
                        console.log(
                            `👁️ Field ${field.label} (${field.fieldApi}) visible: ${isVisible}`
                        );
                        return isVisible;
                    })
                    .map((field) => {
                        const enhanced = this.enhanceFieldForRendering(field);
                        console.log(`✨ Enhanced field:`, enhanced);
                        return enhanced;
                    });

                console.log(
                    `🎨 Section ${section.label} visible fields:`,
                    visibleFields
                );

                return {
                    ...section,
                    fields: visibleFields
                };
            })
            .filter((section) => {
                const hasFields = section.fields.length > 0;
                console.log(
                    `📊 Section ${section.label} has fields: ${hasFields}`
                );
                return hasFields;
            });

        console.log('🎨 Final rendered sections:', renderedSections);
        return renderedSections;
    }

    isFieldVisible(field) {
        console.log(
            `👁️ Checking visibility for field: ${field.label} (${field.developerName})`
        );

        // Check if this field has any controlling dependencies
        const controllingKeys = Object.keys(this.controllingFieldsMap).filter(
            (key) => key.startsWith(`${field.developerName}_`)
        );

        console.log(
            `👁️ Found controlling keys for ${field.developerName}:`,
            controllingKeys
        );

        // If no controlling fields, field is always visible
        if (controllingKeys.length === 0) {
            console.log(
                `👁️ No controlling fields found for ${field.developerName}, field is visible`
            );
            return true;
        }

        // Check if any controlling condition is met
        const isVisible = controllingKeys.some((key) => {
            const [, expectedValue] = key.split('_');
            const controlConfig = this.controllingFieldsMap[key];
            console.log(`👁️ Checking controlling config:`, controlConfig);

            // Get the controlling field's API name from its developer name
            const controllingFieldApi = this.devNameToApi[controlConfig.label];
            console.log(`👁️ Controlling field API: ${controllingFieldApi}`);

            const actualValue = this.formData[controllingFieldApi];
            console.log(
                `👁️ Actual value: ${actualValue}, Expected value: ${expectedValue}`
            );

            const matches =
                String(actualValue || '').toLowerCase() ===
                String(expectedValue || '').toLowerCase();
            console.log(`👁️ Values match: ${matches}`);

            return matches;
        });

        console.log(
            `👁️ Final visibility for ${field.developerName}: ${isVisible}`
        );
        return isVisible;
    }

    enhanceFieldForRendering(field) {
        console.log(
            `✨ Enhancing field for rendering: ${field.label} (${field.fieldType})`
        );

        const value = this.formData[field.fieldApi] || field.defaultValue || '';
        const fieldType = field.fieldType?.toLowerCase();

        // Determine field rendering type based on Salesforce field types
        const isCheckbox = fieldType === 'boolean';
        const isSelect =
            fieldType === 'picklist' || fieldType === 'multipicklist';
        const isLookup = fieldType === 'reference';
        const isTextarea =
            fieldType === 'textarea' || fieldType === 'longtextarea';
        const isDate = fieldType === 'date';
        const isDateTime = fieldType === 'datetime';
        const isEmail = fieldType === 'email';
        const isPhone = fieldType === 'phone';
        const isUrl = fieldType === 'url';
        const isNumber =
            fieldType === 'double' ||
            fieldType === 'integer' ||
            fieldType === 'currency' ||
            fieldType === 'percent';
        const isText =
            !isCheckbox &&
            !isSelect &&
            !isLookup &&
            !isTextarea &&
            !isDate &&
            !isDateTime &&
            !isEmail &&
            !isPhone &&
            !isUrl &&
            !isNumber;

        // Set default value if available
        if (field.defaultValue && !this.formData[field.fieldApi]) {
            this.formData = {
                ...this.formData,
                [field.fieldApi]: isCheckbox
                    ? field.defaultValue === true ||
                      field.defaultValue === 'true'
                    : field.defaultValue
            };
        }

        const enhanced = {
            ...field,
            value,
            isCheckbox,
            isSelect,
            isLookup,
            isTextarea,
            isDate,
            isDateTime,
            isEmail,
            isPhone,
            isUrl,
            isNumber,
            isText,
            inputType: this.getInputType(field.fieldType),
            checkedValue: isCheckbox
                ? value === true || value === 'true'
                : false,
            options: isSelect ? this.getPicklistOptions(field) : []
        };

        console.log(`✨ Enhanced field result:`, enhanced);
        return enhanced;
    }

    getPicklistOptions(field) {
        const options = field.picklistValues || [];
        console.log(
            `📋 Getting picklist options for ${field.fieldApi}:`,
            options
        );

        return options
            .filter((option) => option.active !== false) // Only show active options
            .map((option) => ({
                label: option.label,
                value: option.value,
                selected: option.defaultValue || false
            }));
    }

    getInputType(fieldType) {
        const type = fieldType?.toLowerCase();
        const typeMap = {
            email: 'email',
            phone: 'tel',
            url: 'url',
            double: 'number',
            integer: 'number',
            currency: 'number',
            percent: 'number',
            date: 'date',
            datetime: 'datetime-local',
            time: 'time'
        };
        return typeMap[type] || 'text';
    }

    // Event Handlers
    handleFieldChange(event) {
        const fieldName = event.target.dataset.field;
        const value = event.target.value;

        this.formData = {
            ...this.formData,
            [fieldName]: value
        };

        console.log('Field changed:', fieldName, value);
    }

    handleCheckboxChange(event) {
        const fieldName = event.target.dataset.field;
        const checked = event.target.checked;

        this.formData = {
            ...this.formData,
            [fieldName]: checked
        };

        console.log('Checkbox changed:', fieldName, checked);
    }

    // File upload is now handled by the c-file-uploader component

    async handleSubmit(event) {
        if (event) {
            event.preventDefault();
        }

        if (!this.validateForm()) {
            return;
        }

        this.showSpinner = true;
        this.error = null;

        try {
            // Create record using JSForce
            const recordId = await this.createRecord();

            console.log('✅ Record created with ID:', recordId);

            // Show success message and close form
            this.showSuccessMessage('Record created successfully!');
            this.resetForm();
        } catch (error) {
            console.error('❌ Error saving record:', error);
            this.error = `Failed to save: ${error.message}`;
        } finally {
            this.showSpinner = false;
        }
    }

    async createRecord() {
        const jsforce = window.jsforce;
        const conn = new jsforce.Connection({
            accessToken: sessionStorage.getItem('sf_access_token'),
            instanceUrl: sessionStorage.getItem('sf_instance_url')
        });

        // Prepare record data
        const recordData = { ...this.formData };

        console.log('Creating record:', recordData);

        const result = await conn
            .sobject(this.objectApiName)
            .create(recordData);

        if (!result.success) {
            throw new Error('Failed to create record');
        }

        console.log('✅ Record created:', result.id);
        return result.id;
    }

    // File upload is handled by the c-file-uploader component

    validateForm() {
        const requiredFields = [];

        this.renderedSections.forEach((section) => {
            section.fields.forEach((field) => {
                if (field.required && !this.formData[field.fieldApi]) {
                    requiredFields.push(field.label);
                }
            });
        });

        if (requiredFields.length > 0) {
            this.error = `Please fill required fields: ${requiredFields.join(', ')}`;
            return false;
        }

        return true;
    }

    handleCancel() {
        this.resetForm();

        // Dispatch cancel event to parent to handle visibility
        this.dispatchEvent(new CustomEvent('cancel'));
    }

    resetForm() {
        // Reset form data
        this.formData = {};
        this.error = null;
        this.showSpinner = false;
    }

    showSuccessMessage(message) {
        // Dispatch success event to parent
        this.dispatchEvent(
            new CustomEvent('success', {
                detail: { message }
            })
        );
    }
}
