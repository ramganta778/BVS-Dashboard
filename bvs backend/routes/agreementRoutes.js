const express = require('express');
const {
  getAgreements,
  getAgreement,
  createAgreement,
  updateAgreement,
  deleteAgreement,
  getAgreementStats
} = require('../controllers/agreementController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateAgreement } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.route('/')
  .get(getAgreements)
  .post(validateAgreement, createAgreement);

router.route('/stats/summary')
  .get(getAgreementStats);

router.route('/:id')
  .get(getAgreement)
  .put(validateAgreement, updateAgreement)
  .delete(deleteAgreement);

module.exports = router;