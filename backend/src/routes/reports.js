const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const Statement = require("../models/Statement");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const Client = require("../models/Client");

// POST /api/reports
router.post("/", auth(["director"]), async (req, res) => {
  try {
    const { client, period_type, period, notes } = req.body;

    if (!client || !period_type || !period) {
      return res.status(400).json({ msg: "client, period_type, and period are required." });
    }

    let startDate, endDate;

    if (period_type === "monthly") {
      const [year, month] = period.split("-");
      startDate = new Date(`${year}-${month}-01`);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (period_type === "yearly") {
      startDate = new Date(`${period}-01-01`);
      endDate = new Date(`${parseInt(period) + 1}-01-01`);
    } else {
      return res.status(400).json({ msg: "Invalid period_type. Use 'monthly' or 'yearly'." });
    }

    const statements = await Statement.find({
      client: new mongoose.Types.ObjectId(client),
      due_date: { $gte: startDate, $lt: endDate }
    });

    if (!statements.length) {
      return res.status(404).json({ msg: "No statements found for the given period." });
    }

    // Aggregate totals
    const totals = statements.reduce(
      (acc, s) => {
        acc.total_gross += s.gross;
        acc.total_wins += s.wins;
        acc.total_net += s.net;
        acc.total_wins_commission += s.wins_commission_total;
        acc.total_balance_office += s.balance_office;
        acc.total_balance_client += s.balance_client;
        return acc;
      },
      {
        total_gross: 0,
        total_wins: 0,
        total_net: 0,
        total_wins_commission: 0,
        total_balance_office: 0,
        total_balance_client: 0
      }
    );

    const report = new Report({
      client,
      period_type,
      period,
      notes: notes || '',
      ...totals
    });

    await report.save();

    res.status(201).json(report);
  } catch (err) {
    console.error("Report generation failed:", err);
    res.status(500).json({ msg: "Server error generating report." });
  }
});


router.get("/:clientId/:period", auth(["director"]), async (req, res) => {
  const { clientId, period } = req.params;

  try {
    const report = await Report.findOne({ client: clientId, period });

    if (!report) {
      return res.status(404).json({ msg: "Report not found." });
    }

    const [year, month] = period.split("-").map(Number);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1); // First day of next month

    const statements = await Statement.find({
      client: clientId,
      start_date: { $gte: start, $lt: end }
    });

    const totals = statements.reduce((acc, stmt) => {
      acc.total_gross += stmt.gross || 0;
      acc.total_wins += stmt.wins || 0;
      acc.total_net += stmt.net || 0;
      acc.total_wins_commission += stmt.wins_commission_total || 0;
      acc.total_balance_office += stmt.balance_office || 0;
      acc.total_balance_client += stmt.balance_client || 0;
      return acc;
    }, {
      total_gross: 0,
      total_wins: 0,
      total_net: 0,
      total_wins_commission: 0,
      total_balance_office: 0,
      total_balance_client: 0
    });

    res.json({
      report,
      totals
    });

  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ msg: "Server error." });
  }
});


// GET /api/reports
router.get("/", auth(["director"]), async (req, res) => {
  try {
    // Fetch all reports from the Report model
    const reports = await Report.find();

    if (!reports.length) {
      return res.status(404).json({ msg: "No reports found." });
    }

    // Get totals for each report
    const reportsWithClientNamesAndTotals = await Promise.all(
      reports.map(async (report) => {
        // Fetch client details using clientId
        const client = await Client.findById(report.client);
        const clientName = client ? client.name : 'Unknown'; 

        // Get the start and end date for the report's period
        const [year, month] = report.period.split("-").map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1); // First day of next month

        // Fetch the statements for the given period
        const statements = await Statement.find({
          client: report.client,
          due_date: { $gte: start, $lt: end }
        });

        // Calculate the totals from the statements
        const totals = statements.reduce(
          (acc, stmt) => {
            acc.total_gross += stmt.gross || 0;
            acc.total_wins += stmt.wins || 0;
            acc.total_net += stmt.net || 0;
            acc.total_wins_commission += stmt.wins_commission_total || 0;
            acc.total_balance_office += stmt.balance_office || 0;
            acc.total_balance_client += stmt.balance_client || 0;
            return acc;
          },
          {
            total_gross: 0,
            total_wins: 0,
            total_net: 0,
            total_wins_commission: 0,
            total_balance_office: 0,
            total_balance_client: 0
          }
        );

        // Return the report with totals and the client name
        return {
          ...report.toObject(),
          ...totals,
          clientName: clientName
        };
      })
    );

    res.json(reportsWithClientNamesAndTotals);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ msg: "Server error." });
  }
});


// DELETE /api/reports/:reportId
router.delete("/:reportId", auth(["director"]), async (req, res) => {
  const { reportId } = req.params;

  try {
    // Check if the report exists
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ msg: "Report not found." });
    }

    // Delete the report using `findByIdAndDelete`
    await Report.findByIdAndDelete(reportId);

    // Optionally, if there are associated statements to be deleted, you can remove them as well
    // await Statement.deleteMany({ report: reportId });

    res.json({ msg: "Report deleted successfully." });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ msg: "Server error." });
  }
});


module.exports = router;
