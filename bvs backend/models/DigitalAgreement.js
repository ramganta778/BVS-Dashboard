const mongoose = require('mongoose');

const digitalServiceSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  }
});

const digitalAgreementSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientCompany: {
    type: String,
    required: true,
    trim: true
  },
  clientAddress: {
    type: String,
    required: true,
    trim: true
  },
  providerName: {
    type: String,
    default: 'K. KRISHNA TEJA',
    trim: true
  },
  providerCompany: {
    type: String,
    default: 'BUSINESS VICTORY SOLUTIONS',
    trim: true
  },
  providerAddress: {
    type: String,
    default: 'NELLORE, Ramalingapuram main road',
    trim: true
  },
  services: [digitalServiceSchema],
  additionalServices: [digitalServiceSchema],
  totalCost: {
    type: Number,
    required: true,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  platforms: [{
    type: String,
    enum: ['Instagram', 'Facebook', 'YouTube', 'Twitter', 'LinkedIn']
  }],
  travelAllowance: {
    type: Boolean,
    default: false
  },
  droneShoot: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Completed', 'Terminated', 'Expired'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate total cost before saving
digitalAgreementSchema.pre('save', function(next) {
  const servicesCost = this.services.reduce((total, service) => total + service.cost, 0);
  const additionalCost = this.additionalServices.reduce((total, service) => total + service.cost, 0);
  this.totalCost = servicesCost + additionalCost;
  next();
});

module.exports = mongoose.model('DigitalAgreement', digitalAgreementSchema);