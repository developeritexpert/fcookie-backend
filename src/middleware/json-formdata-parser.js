// middleware/json-formdata-parser.js
const parseJsonFormData = (req, res, next) => {
  const jsonFields = ['formConfig', 'fields', 'steps', 'contentSections'];
  
  jsonFields.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (e) {
        console.error(`Failed to parse ${field}:`, e);
      }
    }
  });
  
  next();
};

module.exports = parseJsonFormData;