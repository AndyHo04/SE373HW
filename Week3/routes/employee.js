const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

//Read Route - Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find({}).sort({createdAt: -1}).lean();
        res.render('employees/view', { employees, successMessage: req.query.success});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Add employee form page
router.get('/add', (req, res) => {
    res.render('employees/index');
});

//Create Route - Add a new employee
router.post('/employees', async (req, res) => {
  try {
    const payload = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        department: req.body.department,
        startDate: req.body.startDate,
        jobTitle: req.body.jobTitle,
        salary: Number(req.body.salary)
    }
    await Employee.create(payload);
    res.render('employees/index', { successMessage: 'Employee created successfully' });
    } catch (err) {
        const employees = await Employee.find({}).sort({createdAt: -1}).lean();
        res.status(400).render ('employees/index', { 
            employees,
            errorMessage: 'Error creating employee. Please ensure all fields are filled out correctly.',
            formData: req.body
        });
    }
});

//Update Route - Update an employee
router.put('/employees/:id', async (req, res) => {
  try {
    const payload = {
        ...req.body,
        salary: Number(req.body.salary)
    }
    await Employee.findByIdAndUpdate(req.params.id, payload, { runValidators: true });
    res.redirect('/');
  } catch (err) {
    const employee = await Employee.findById(req.params.id).lean();
    res.status(400).render ('employees/edit', {  
        employee: {...employee, ...req.body},
        errorMessage: 'Update Failed: Check required fields',
        formData: req.body
    });
  }
});

//Edit page
router.get('/employees/:id/edit',  async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).lean();
    if(!employee) {
        return res.status(404).send('Employee not found');
    }
    res.render('employees/edit', { employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Delete Route - Delete an employee
router.delete('/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect('/?success=Employee deleted successfully');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
