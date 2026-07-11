import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

// POST /calculator/compute
router.post("/calculator/compute", requireAuth, async (req, res) => {
  try {
    const {
      principal, interestRate, ratePeriod = "month", interestType = "simple",
      duration, durationUnit = "months", penaltyRate = 0, overdueDays = 0,
    } = req.body;

    if (!principal || !interestRate || !duration) {
      return res.status(400).json({ error: "principal, interestRate, and duration are required" });
    }

    // Normalize rate to monthly
    let monthlyRate = Number(interestRate);
    if (ratePeriod === "day") monthlyRate = Number(interestRate) * 30;
    else if (ratePeriod === "year") monthlyRate = Number(interestRate) / 12;

    // Normalize duration to months
    let months = Number(duration);
    if (durationUnit === "days") months = Number(duration) / 30;
    else if (durationUnit === "years") months = Number(duration) * 12;

    let totalInterest: number;
    const monthlyBreakdown: { period: string; interest: number; balance: number }[] = [];

    if (interestType === "compound") {
      const r = monthlyRate / 100;
      for (let i = 1; i <= Math.ceil(months); i++) {
        const balance = Number(principal) * Math.pow(1 + r, i);
        const interest = balance - Number(principal);
        monthlyBreakdown.push({ period: `Month ${i}`, interest: Math.round(interest * 100) / 100, balance: Math.round(balance * 100) / 100 });
      }
      totalInterest = Number(principal) * (Math.pow(1 + r, months) - 1);
    } else {
      const monthlyInterest = (Number(principal) * monthlyRate) / 100;
      for (let i = 1; i <= Math.ceil(months); i++) {
        const interest = monthlyInterest * i;
        monthlyBreakdown.push({ period: `Month ${i}`, interest: Math.round(interest * 100) / 100, balance: Math.round((Number(principal) + interest) * 100) / 100 });
      }
      totalInterest = monthlyInterest * months;
    }

    const penaltyInterest = overdueDays > 0 && penaltyRate > 0
      ? (Number(principal) * Number(penaltyRate) * Number(overdueDays)) / (100 * 30)
      : 0;

    return res.json({
      totalInterest: Math.round(totalInterest * 100) / 100,
      penaltyInterest: Math.round(penaltyInterest * 100) / 100,
      totalPayable: Math.round((Number(principal) + totalInterest + penaltyInterest) * 100) / 100,
      monthlyBreakdown,
    });
  } catch (err) {
    req.log.error({ err }, "Calculator error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
