const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  department: { 
    type: String, 
    required: true,
    enum: ['Engineering', 'Human Resources', 'Sales', 'Marketing', 'Finance']
  },
  startDate: { type: Date, min: '1970-01-01', max: '2100-12-31', required: true },
  jobTitle: { type: String, required: true, trim: true },
  salary: { type: Number, min: 0, max: 1000000, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);