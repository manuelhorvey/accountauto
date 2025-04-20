const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const Statement = require("../models/Statement");
const auth = require("../middleware/auth"); 


// GET /api/clients
// Any manager or director can list clients
router.get("/", auth(["manager", "director"]), async (req, res) => {
  const clients = await Client.find();
  res.json(clients);
});

// GET /api/clients/:id
// Any manager or director can fetch a single client by ID
router.get("/:id", auth(["manager", "director"]), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }
    res.json(client);
  } catch (err) {
    console.error(err);
    // If the ID format is invalid, Mongoose will throw a CastError
    if (err.name === "CastError") {
      return res.status(400).json({ msg: "Invalid client ID" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/clients/:id/statements
// Fetch all statements for a specific client
router.get("/:id/statements", auth(["manager", "director"]), async (req, res) => {
  try {
    const clientId = req.params.id;

    const statements = await Statement.find({ client: clientId })
      .sort({ start_date: -1 }) // or .sort({ createdAt: -1 }) if you prefer
      .populate("client", "name");

    res.json(statements);
  } catch (err) {
    console.error("Error fetching client statements:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// POST /api/clients
// Only directors can add new clients
router.post("/", auth(["director"]), async (req, res) => {
  const { name, phone, location, gross_commission, wins_commission } = req.body;

  try {
    const client = new Client({ name, phone, location, gross_commission, wins_commission });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Error creating client", error: err.message });
  }
});

// PUT /api/clients/:id
// Only directors can update client settings
router.put("/:id", auth(["director"]), async (req, res) => {
  try {
    const { name, phone, location, gross_commission, wins_commission, is_active } = req.body;
    const updateData = {
      name,
      phone,
      location,
      gross_commission,
      wins_commission,
      is_active 
    };

    const client = await Client.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!client) {
      return res.status(404).json({ msg: "Client not found" });
    }

    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Error updating client", error: err.message });
  }
});

// DELETE /api/clients/:id
// Only directors can remove a client
router.delete("/:id", auth(["director"]), async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ msg: "Client removed." });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Error deleting client", error: err.message });
  }
});

module.exports = router;
