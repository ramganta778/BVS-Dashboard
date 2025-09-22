const express = require('express');
const {
  getDigitalAgreements,
  getDigitalAgreement,
  createDigitalAgreement,
  updateDigitalAgreement,
  updateDigitalAgreementStatus,
  deleteDigitalAgreement,
  getDigitalAgreementStats
} = require('../controllers/digitalAgreementController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.route('/')
  .get(getDigitalAgreements)
  .post(createDigitalAgreement);

router.route('/stats/summary')
  .get(getDigitalAgreementStats);

router.route('/:id')
  .get(getDigitalAgreement)
  .put(updateDigitalAgreement)
  .delete(deleteDigitalAgreement);

router.route('/:id/status')
  .patch(updateDigitalAgreementStatus);

module.exports = router;