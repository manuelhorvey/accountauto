const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const auth = require("../middleware/auth");

// Helper to trim and sanitize input
const sanitize = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].trim();
    }
  }
  return obj;
};

// GET all employees
router.get("/", auth(["manager", "director"]), async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET single employee by ID
router.get("/:id", auth(["manager", "director"]), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST create new employee
router.post("/", auth(["director"]), async (req, res) => {
    try {
      const { first_name, last_name, phone, email, status, salary } = req.body;
  
      if (!first_name || !last_name || !phone || !salary) {
        return res.status(400).json({ msg: "First name, last name, phone, and salary are required." });
      }
  
      const newEmployee = new Employee({ first_name, last_name, phone, email, status, salary });
      await newEmployee.save();
  
      res.status(201).json(newEmployee);
    } catch (err) {
      console.error(err); 
      if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: err.message }); 
      }
      res.status(500).json({ msg: "Server error." });
    }
  });
  

// PUT update employee
router.put("/:id", auth(["director"]), async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      sanitize(req.body),
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Employee not found." });
    res.json({ success: true, message: "Employee updated.", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// DELETE employee
router.delete("/:id", auth(["director"]), async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Employee not found." });

    res.json({ success: true, message: "Employee deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
