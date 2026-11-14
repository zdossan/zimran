import { z } from "zod";

/** Validates a StatementExtraction (lib/types.ts) — used for cached samples and API responses. */
export const StatementSchema = z.object({
  isSample: z.boolean(),
  servicer: z.string(),
  statementDate: z.string(),
  dueDate: z.string(),
  amountDue: z.number(),
  planName: z.string().optional(),
  loanStatus: z.string().optional(),
  principalBalance: z.number(),
  interestRate: z.number().optional(),
  lastPayment: z
    .object({
      date: z.string(),
      amount: z.number(),
      toInterest: z.number(),
      toPrincipal: z.number(),
      subsidyApplied: z.number().optional(),
      matchApplied: z.number().optional(),
    })
    .optional(),
  monthlyInterestAccrued: z.number().optional(),
  fieldConfidence: z.record(z.string(), z.number().min(0).max(1)),
});

const amount = z.number().nullable();

/**
 * What Claude returns (structured outputs). Every key is required and nullable because
 * structured outputs need closed objects; mapped to StatementExtraction in extract.ts.
 */
export const LlmStatementSchema = z.object({
  isStudentLoanStatement: z.boolean().describe("false if this is not a US student-loan servicer billing statement"),
  servicer: z.string().nullable(),
  statementDate: z.string().nullable().describe("statement or bill date, YYYY-MM-DD"),
  dueDate: z.string().nullable().describe("payment due date, YYYY-MM-DD"),
  amountDue: amount.describe("current amount due in dollars"),
  planName: z.string().nullable().describe("repayment plan name exactly as printed, e.g. RAP, IBR, STANDARD"),
  loanStatus: z.string().nullable().describe("loan status as printed, e.g. REPAY, FORB, DEFER"),
  principalBalance: amount.describe("total outstanding principal in dollars"),
  interestRate: amount.describe("annual interest rate as a decimal, e.g. 6.5% -> 0.065"),
  lastPayment: z
    .object({
      date: z.string().nullable(),
      amount,
      toInterest: amount,
      toPrincipal: amount,
      subsidyApplied: amount.describe("RAP interest subsidy / waived interest applied, if printed"),
      matchApplied: amount.describe("RAP principal match applied, if printed"),
    })
    .nullable(),
  monthlyInterestAccrued: amount.describe("interest that accrued this month, if printed"),
  confidence: z.object({
    servicer: z.number(),
    statementDate: z.number(),
    dueDate: z.number(),
    amountDue: z.number(),
    principalBalance: z.number(),
    lastPayment: z.number(),
    monthlyInterestAccrued: z.number(),
  }),
});

export type LlmStatement = z.infer<typeof LlmStatementSchema>;
