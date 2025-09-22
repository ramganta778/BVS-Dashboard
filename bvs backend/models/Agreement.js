const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
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

const agreementSchema = new mongoose.Schema({
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
  services: [serviceSchema],
  totalCost: {
    type: Number,
    required: true,
    default: 0
  },
  warrantyYears: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 3
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
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
agreementSchema.pre('save', function(next) {
  this.totalCost = this.services.reduce((total, service) => total + service.cost, 0);
  
  // Calculate end date based on warranty years
  if (this.startDate && this.warrantyYears && !this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setFullYear(endDate.getFullYear() + this.warrantyYears);
    this.endDate = endDate;
  }
  
  next();
});

module.exports = mongoose.model('Agreement', agreementSchema);