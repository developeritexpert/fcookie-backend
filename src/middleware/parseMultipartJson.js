module.exports = (req, res, next) => {
  if (!req.body) return next();

  const jsonFields = [
    'stepResponses',
    'responses',
    'completedSteps',
    'guestInfo',
  ];

  jsonFields.forEach((field) => {
    if (typeof req.body[field] === 'string') {
      try {
        req.body[field] = JSON.parse(req.body[field]);
      } catch (err) {
        req.body[field] = undefined;
      }
    }
  });

  const numberFields = ['currentStep', 'timeSpentSeconds'];

  numberFields.forEach((field) => {
    if (typeof req.body[field] === 'string') {
      req.body[field] = Number(req.body[field]);
    }
  });

  next();
};
