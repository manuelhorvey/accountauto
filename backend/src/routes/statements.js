
const express = require("express");
const router = express.Router();
const Statement = require("../models/Statement");
const Client = require("../models/Client");
const DailySales = require("../models/DailySales");
const auth = require("../middleware/auth");

// Helper to compute fields
const computeStatement = async ({
  clientId,
  gross,
  wins,
  cash_received = 0,
  cash_paid = 0,
  expenses = 0,
  excludeStatementId = null,
  current_start_date
}) => {
  const client = await Client.findById(clientId);
  if (!client) throw new Error("Client not found");

  const net = gross * (1 - client.gross_commission / 100);
  const wins_commission_total = wins * client.wins_commission;

  let balance_office = net - wins_commission_total;
  let balance_client = 0;

  if (balance_office < 0) {
    balance_client = Math.abs(balance_office);
    balance_office = 0;
  }

  // Get the most recent previous statement
  const query = {
    client: clientId,
    due_date: { $lt: current_start_date }
  };
  if (excludeStatementId) query._id = { $ne: excludeStatementId };

  const prev = await Statement.findOne(query)
    .sort({ due_date: -1 })
    .lean();

  const prev_office = prev?.final_receivable || 0;
  const prev_client = prev?.final_payable || 0;

  // Initial balance calculation
  let diff = prev_office - prev_client + balance_office - balance_client;
  let baseReceivable = diff >= 0 ? diff : 0;
  let basePayable = diff < 0 ? -diff : 0;

  // Apply expenses
  if (expenses > 0) {
    if (expenses <= baseReceivable) {
      baseReceivable -= expenses;
    } else {
      const leftover = expenses - baseReceivable;
      baseReceivable = 0;
      basePayable += leftover;
    }
  }

  // Apply cash_paid
  if (cash_paid > 0) {
    if (cash_paid <= basePayable) {
      basePayable -= cash_paid;
    } else {
      const leftover = cash_paid - basePayable;
      basePayable = 0;
      baseReceivable += leftover;
    }
  }

  // Apply cash_received
  let final_receivable = baseReceivable;
  let final_payable = basePayable;

  if (cash_received > 0) {
    if (cash_received <= final_receivable) {
      final_receivable -= cash_received;
    } else {
      const leftover = cash_received - final_receivable;
      final_receivable = 0;
      final_payable += leftover;
    }
  }

  return {
    net,
    wins_commission_total,
    balance_office,
    balance_client,
    prev_balance_office: prev_office,
    prev_balance_client: prev_client,
    final_receivable,
    final_payable,
    current_balance_office: balance_office,
    current_balance_client: balance_client
  };
};


// GET /api/statements
router.get("/", auth(["manager", "director"]), async (req, res) => {
  try {
    const filter = {};
    if (req.query.client) filter.client = req.query.client;

    const list = await Statement.find(filter)
      .populate("client", "name")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    console.error("Error fetching statements:", err);
    res.status(500).json({ msg: "Server error." });
  }
});


router.get("/:clientId/statements/:statementId", auth(["manager", "director"]), async (req, res) => {
  try {
    const { clientId, statementId } = req.params;

    // Get the statement for a specific client and statementId
    const statement = await Statement.findOne({ _id: statementId, client: clientId }).populate("client", "name");

    if (!statement) {
      return res.status(404).json({ msg: "Statement not found for this client" });
    }

    // Fetch the related daily sales separately
    const dailySales = await DailySales.findOne({ statement: statementId });

    res.json({ ...statement.toObject(), dailySales });
  } catch (err) {
    console.error("Error fetching statement:", err);
    res.status(500).json({ msg: "Server error." });
  }
});


router.get("/:statementId", auth(["manager", "director"]), async (req, res) => {
  try {
    const { statementId } = req.params;

    // Get the statement for the specific statementId (no need for clientId)
    const statement = await Statement.findById(statementId).populate("client", "name");

    if (!statement) {
      return res.status(404).json({ msg: "Statement not found" });
    }

    // Fetch the related daily sales separately
    const dailySales = await DailySales.findOne({ statement: statementId });

    res.json({ ...statement.toObject(), dailySales });
  } catch (err) {
    console.error("Error fetching statement:", err);
    res.status(500).json({ msg: "Server error." });
  }
});


// POST /api/statements
router.post("/", auth(["manager", "director"]), async (req, res) => {
  try {
    const {
      client: clientId,
      wins,
      cash_received = 0,
      cash_paid = 0,
      dailySales,
      expenses = 0,
      start_date,
      due_date
    } = req.body;

    if (!dailySales) return res.status(400).json({ msg: "Daily sales data is required." });
    if (!start_date || !due_date) return res.status(400).json({ msg: "Both start_date and due_date are required." });

    const gross = Object.values(dailySales).reduce((sum, val) => sum + (typeof val === "number" ? val : 0), 0);

    const computed = await computeStatement({
      clientId,
      gross,
      wins,
      cash_received,
      cash_paid,
      expenses,
      current_start_date: new Date(start_date)
    });

    const statement = new Statement({
      client: clientId,
      gross,
      wins,
      expenses,
      net: computed.net,
      wins_commission_total: computed.wins_commission_total,
      balance_office: computed.current_balance_office,
      balance_client: computed.current_balance_client,
      prev_balance_office: computed.prev_balance_office,
      prev_balance_client: computed.prev_balance_client,
      cash_received,
      cash_paid,
      final_receivable: computed.final_receivable,
      final_payable: computed.final_payable,
      start_date,
      due_date,
      created_by: req.user.userId
    });

    await statement.save();
    const dailySalesRecord = new DailySales({ statement: statement._id, client: clientId, ...dailySales });
    await dailySalesRecord.save();

    res.status(201).json({ statement, dailySales: dailySalesRecord });
  } catch (err) {
    console.error("Error creating statement:", err);
    res.status(500).json({ msg: "Server error." });
  }
});

// PUT /api/statements/:id
router.put("/:id", auth(["manager", "director"]), async (req, res) => {
  const { wins, cash_received = 0, cash_paid = 0, dailySales, expenses = 0, start_date, due_date } = req.body;
  const statementId = req.params.id;

  try {
    const statement = await Statement.findById(statementId);
    if (!statement) return res.status(404).json({ msg: "Statement not found." });
    if (!start_date || !due_date) return res.status(400).json({ msg: "Both start_date and due_date are required." });

    const gross = Object.values(dailySales).reduce((sum, val) => sum + (typeof val === "number" ? val : 0), 0);

    const computed = await computeStatement({
      clientId: statement.client,
      gross,
      wins,
      cash_received,
      cash_paid,
      expenses,
      excludeStatementId: statement._id,
      current_start_date: new Date(start_date)
    });

    Object.assign(statement, {
      gross,
      wins,
      expenses,
      net: computed.net,
      wins_commission_total: computed.wins_commission_total,
      balance_office: computed.current_balance_office,
      balance_client: computed.current_balance_client,
      prev_balance_office: computed.prev_balance_office,
      prev_balance_client: computed.prev_balance_client,
      cash_received,
      cash_paid,
      final_receivable: computed.final_receivable,
      final_payable: computed.final_payable,
      start_date,
      due_date
    });

    await statement.save();

    const dailySalesRecord = await DailySales.findOneAndUpdate(
      { statement: statementId },
      { $set: { ...dailySales, statement: statementId } },
      { new: true, upsert: true }
    );

    // Ripple Update: Recalculate all future statements
    const futureStatements = await Statement.find({
      client: statement.client,
      start_date: { $gt: new Date(start_date) }
    }).sort({ start_date: 1 });

    for (const future of futureStatements) {
      const futureGross = await DailySales.findOne({ statement: future._id });
      const futureGrossTotal = futureGross
        ? Object.values(futureGross.toObject()).reduce((sum, val) => {
            if (typeof val === "number") return sum + val;
            return sum;
          }, 0)
        : 0;

      const futureComputed = await computeStatement({
        clientId: future.client,
        gross: futureGrossTotal,
        wins: future.wins,
        cash_received: future.cash_received,
        cash_paid: future.cash_paid,
        expenses: future.expenses,
        excludeStatementId: future._id,
        current_start_date: future.start_date
      });

      Object.assign(future, {
        gross: futureGrossTotal,
        net: futureComputed.net,
        wins_commission_total: futureComputed.wins_commission_total,
        balance_office: futureComputed.current_balance_office,
        balance_client: futureComputed.current_balance_client,
        prev_balance_office: futureComputed.prev_balance_office,
        prev_balance_client: futureComputed.prev_balance_client,
        final_receivable: futureComputed.final_receivable,
        final_payable: futureComputed.final_payable
      });

      await future.save();
    }

    res.status(200).json({ statement, dailySales: dailySalesRecord });
  } catch (err) {
    console.error("Error updating statement:", err);
    res.status(500).json({ msg: "Server error." });
  }
});


// DELETE /api/statements/:id
router.delete("/:id", auth(["manager", "director"]), async (req, res) => {
  const { id } = req.params;
  try {
    const statement = await Statement.findById(id);
    if (!statement) return res.status(404).json({ msg: "Statement not found." });

    await Statement.deleteOne({ _id: id });
    await DailySales.deleteOne({ statement: id });

    res.json({ msg: "Statement and daily sales removed." });
  } catch (err) {
    console.error("Error deleting statement:", err);
    res.status(500).json({ msg: "Server error." });
  }
});

module.exports = router;