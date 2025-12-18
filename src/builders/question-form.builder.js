const { v4: uuidv4 } = require('uuid');

/**
 * Build a new form field with defaults
 * @param {Object} fieldData - Field data
 * @returns {Object} Complete field object
 */
const buildFormField = (fieldData) => {
  return {
    fieldId: fieldData.fieldId || `field_${uuidv4().slice(0, 8)}`,
    type: fieldData.type,
    label: fieldData.label,
    placeholder: fieldData.placeholder || '',
    helpText: fieldData.helpText || '',
    defaultValue: fieldData.defaultValue || null,
    options: fieldData.options || [],
    validation: {
      required: fieldData.validation?.required || false,
      minLength: fieldData.validation?.minLength || null,
      maxLength: fieldData.validation?.maxLength || null,
      min: fieldData.validation?.min || null,
      max: fieldData.validation?.max || null,
      pattern: fieldData.validation?.pattern || null,
      customMessage: fieldData.validation?.customMessage || null,
    },
    order: fieldData.order || 0,
    isVisible: fieldData.isVisible !== undefined ? fieldData.isVisible : true,
    conditionalLogic: {
      enabled: fieldData.conditionalLogic?.enabled || false,
      rules: fieldData.conditionalLogic?.rules || [],
      action: fieldData.conditionalLogic?.action || 'show',
    },
    gridColumn: fieldData.gridColumn || 'full',
  };
};

/**
 * Build a new form step with defaults
 * @param {Object} stepData - Step data
 * @returns {Object} Complete step object
 */
const buildFormStep = (stepData) => {
  return {
    stepNumber: stepData.stepNumber,
    title: stepData.title,
    description: stepData.description || '',
    fields: (stepData.fields || []).map((field) => buildFormField(field)),
    order: stepData.order || stepData.stepNumber - 1,
    isOptional: stepData.isOptional || false,
  };
};

/**
 * Build a content section with defaults
 * @param {Object} sectionData - Section data
 * @returns {Object} Complete content section object
 */
const buildContentSection = (sectionData) => {
  return {
    type: sectionData.type,
    content: sectionData.content || '',
    heading: sectionData.heading || '',
    subHeading: sectionData.subHeading || '',
    listItems: sectionData.listItems || [],
    mediaUrl: sectionData.mediaUrl || null,
    order: sectionData.order || 0,
    style: {
      backgroundColor: sectionData.style?.backgroundColor || null,
      textColor: sectionData.style?.textColor || null,
      borderColor: sectionData.style?.borderColor || null,
      icon: sectionData.style?.icon || null,
    },
  };
};

/**
 * Build form config with defaults
 * @param {Object} configData - Config data
 * @returns {Object} Complete form config object
 */
const buildFormConfig = (configData = {}) => {
  return {
    isMultiStep: configData.isMultiStep || false,
    showProgressBar: configData.showProgressBar !== undefined ? configData.showProgressBar : true,
    allowSaveDraft: configData.allowSaveDraft || false,
    submitButtonText: configData.submitButtonText || 'Submit',
    successMessage: configData.successMessage || 'Your response has been submitted successfully!',
    redirectUrl: configData.redirectUrl || null,
  };
};

/**
 * Build complete question form payload
 * @param {Object} payload - Raw payload
 * @returns {Object} Processed payload
 */
const buildQuestionFormPayload = (payload) => {
  const result = {
    title: payload.title,
    description: payload.description || '',
    category: payload.category,
    formConfig: buildFormConfig(payload.formConfig),
    order: payload.order || 0,
    status: payload.status || 'ACTIVE',
    visibility: payload.visibility || 'public',
    metaTitle: payload.metaTitle || '',
    metaDescription: payload.metaDescription || '',
  };

  // Build content sections
  if (payload.contentSections && payload.contentSections.length > 0) {
    result.contentSections = payload.contentSections.map((section, index) =>
      buildContentSection({ ...section, order: section.order !== undefined ? section.order : index })
    );
  }

  // Build steps for multi-step forms
  if (payload.formConfig?.isMultiStep && payload.steps && payload.steps.length > 0) {
    result.steps = payload.steps.map((step, index) =>
      buildFormStep({ ...step, stepNumber: step.stepNumber || index + 1 })
    );
    result.fields = []; // Clear direct fields for multi-step forms
  } else {
    // Build direct fields for single-step forms
    if (payload.fields && payload.fields.length > 0) {
      result.fields = payload.fields.map((field, index) =>
        buildFormField({ ...field, order: field.order !== undefined ? field.order : index })
      );
    }
    result.steps = []; // Clear steps for single-step forms
  }

  return result;
};

/**
 * Build submission response
 * @param {Object} responseData - Response data
 * @returns {Object} Formatted response
 */
const buildFieldResponse = (responseData) => {
  return {
    fieldId: responseData.fieldId,
    fieldLabel: responseData.fieldLabel,
    fieldType: responseData.fieldType,
    value: responseData.value,
    displayValue: responseData.displayValue || formatDisplayValue(responseData.value, responseData.fieldType),
  };
};

/**
 * Format display value based on field type
 * @param {*} value - Field value
 * @param {string} fieldType - Field type
 * @returns {string} Formatted display value
 */
const formatDisplayValue = (value, fieldType) => {
  if (value === null || value === undefined) return '';

  switch (fieldType) {
    case 'checkbox':
      return Array.isArray(value) ? value.join(', ') : String(value);
    case 'multiselect':
      return Array.isArray(value) ? value.join(', ') : String(value);
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'datetime':
      return new Date(value).toLocaleString();
    case 'rating':
      return `${value} / 5`;
    default:
      return String(value);
  }
};

module.exports = {
  buildFormField,
  buildFormStep,
  buildContentSection,
  buildFormConfig,
  buildQuestionFormPayload,
  buildFieldResponse,
  formatDisplayValue,
};