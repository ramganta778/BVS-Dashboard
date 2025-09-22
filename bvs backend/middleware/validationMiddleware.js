const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

const validateAgreement = [
  body('clientName')
    .trim()
    .notEmpty()
    .withMessage('Client name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Client name must be between 2 and 50 characters'),
  
  body('clientCompany')
    .trim()
    .notEmpty()
    .withMessage('Client company is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Client company must be between 2 and 100 characters'),
  
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service is required'),
  
  body('services.*.description')
    .trim()
    .notEmpty()
    .withMessage('Service description is required'),
  
  body('services.*.cost')
    .isFloat({ min: 0 })
    .withMessage('Service cost must be a positive number'),
  
  body('warrantyYears')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('Warranty years must be between 1 and 3'),
  
  handleValidationErrors
];

module.exports = {
  validateAgreement
};