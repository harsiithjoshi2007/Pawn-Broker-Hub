/**
 * Overdue Loan Scheduler
 *
 * Runs every 5 minutes. For each loan whose due_date is in the past and
 * whose status is still 'active' or 'partially_paid':
 *   1. Marks the loan as 'overdue'.
 *   2. Sends an Expo push notification to every user who has a push token.
 *
 * Uses the Expo Push Notification service — no APNs/FCM credentials needed
 * for Expo Go or development builds.
 */

import { db } from "@workspace/db";
import { loansTable, usersTable, customersTable } from "@workspace/db";
import { and, eq, inArray, isNotNull, lt, or } from "drizzle-orm";
import { Expo, type ExpoPushMessage } from "expo-server-sdk";
import { logger } from "./lib/logger";
import { format } from "date-fns";

const expo = new Expo();

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export async function checkOverdueLoans(): Promise<void> {
  const today = format(new Date(), "yyyy-MM-dd");

  try {
    // Find loans that are past due and not yet marked overdue / closed / auctioned
    const overdueLoans = await db
      .select({
        loan: loansTable,
        customerName: customersTable.name,
      })
      .from(loansTable)
      .leftJoin(customersTable, eq(loansTable.customerId, customersTable.id))
      .where(
        and(
          lt(loansTable.dueDate, today),
          inArray(loansTable.status, ["active", "partially_paid"])
        )
      );

    if (overdueLoans.length === 0) {
      return;
    }

    // Mark them overdue in one batch
    const ids = overdueLoans.map((r) => r.loan.id);
    await db
      .update(loansTable)
      .set({ status: "overdue", updatedAt: new Date() })
      .where(inArray(loansTable.id, ids));

    logger.info(
      { count: ids.length, ids },
      "Marked loans as overdue"
    );

    // Fetch all active users with a push token
    const users = await db
      .select({ pushToken: usersTable.pushToken })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.active, true),
          isNotNull(usersTable.pushToken)
        )
      );

    const validTokens = users
      .map((u) => u.pushToken)
      .filter((t): t is string => !!t && Expo.isExpoPushToken(t));

    if (validTokens.length === 0) {
      return;
    }

    // Build one message per overdue loan per user token
    const messages: ExpoPushMessage[] = [];
    for (const { loan, customerName } of overdueLoans) {
      const body = customerName
        ? `${loan.loanNumber} (${customerName}) is now overdue`
        : `${loan.loanNumber} is now overdue`;

      for (const token of validTokens) {
        messages.push({
          to: token,
          sound: "default",
          title: "⚠️ Loan Overdue",
          body,
          data: {
            loanId: loan.id,
            loanNumber: loan.loanNumber,
            screen: "loan-detail",
          },
          // Group by loan so devices show one alert per loan, not per user
          channelId: "overdue-loans",
        });
      }
    }

    // Expo limits: chunk into batches of 100
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const receipts = await expo.sendPushNotificationsAsync(chunk);
        for (const receipt of receipts) {
          if (receipt.status === "error") {
            logger.warn({ error: receipt.message }, "Expo push send error");
          }
        }
      } catch (err) {
        logger.error({ err }, "Expo push chunk send failed");
      }
    }

    logger.info(
      { tokens: validTokens.length, messages: messages.length },
      "Sent overdue-loan push notifications"
    );
  } catch (err) {
    logger.error({ err }, "checkOverdueLoans error");
  }
}

export function startScheduler(): void {
  // Run once on startup, then on the interval
  checkOverdueLoans();
  setInterval(checkOverdueLoans, CHECK_INTERVAL_MS);
  logger.info("Overdue-loan scheduler started (interval: 5 min)");
}
