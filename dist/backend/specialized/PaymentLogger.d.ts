/**
 * T025: Payment-specific logging implementation
 * CVPlus Logging System - Payment Module Logger
 */
import { BaseLogger } from '../core/BaseLogger';
export declare class PaymentLogger extends BaseLogger {
    constructor(serviceName?: string);
    /**
     * Log payment initiation
     */
    paymentInitiated(context?: {
        userId?: string;
        transactionId?: string;
        amount?: number;
        currency?: string;
        paymentMethod?: string;
        plan?: string;
        paymentIntent?: string;
        correlationId?: string;
    }): string;
    /**
     * Log successful payment
     */
    paymentSucceeded(context?: {
        transactionId?: string;
        userId?: string;
        amount?: number;
        currency?: string;
        paymentMethod?: string;
        plan?: string;
        stripeChargeId?: string;
        billingCycle?: string;
        nextBillingDate?: string;
        processingTime?: number;
        correlationId?: string;
    }): string;
    /**
     * Log payment failures
     */
    paymentFailed(context?: {
        transactionId?: string;
        userId?: string;
        amount?: number;
        currency?: string;
        paymentMethod?: string;
        plan?: string;
        errorCode?: string;
        errorMessage?: string;
        declineCode?: string;
        attemptNumber?: number;
        processingTime?: number;
        correlationId?: string;
    }): string;
    /**
     * Log subscription creation
     */
    subscriptionCreated(context?: {
        userId?: string;
        subscriptionId?: string;
        plan?: string;
        amount?: number;
        currency?: string;
        billingInterval?: string;
        trialPeriodDays?: number;
        status?: string;
        startDate?: string;
        trialEndDate?: string;
        correlationId?: string;
    }): string;
    /**
     * Log invoice generation
     */
    invoiceGenerated(context?: {
        invoiceId?: string;
        userId?: string;
        subscriptionId?: string;
        amount?: number;
        currency?: string;
        billingPeriod?: {
            start: string;
            end: string;
        };
        lineItems?: Array<{
            description: string;
            amount: number;
            quantity: number;
        }>;
        taxAmount?: number;
        totalAmount?: number;
        dueDate?: string;
        correlationId?: string;
    }): string;
    /**
     * Log payment retry scheduling
     */
    paymentRetryScheduled(context?: {
        transactionId?: string;
        userId?: string;
        amount?: number;
        currency?: string;
        plan?: string;
        retryAttempt?: number;
        maxRetries?: number;
        retryStrategy?: string;
        nextRetryAt?: string;
        lastFailureReason?: string;
        retryDelay?: number;
        correlationId?: string;
    }): string;
    /**
     * Log suspicious payment activity
     */
    suspiciousPaymentActivity(context?: {
        userId?: string;
        transactionId?: string;
        riskScore?: number;
        riskFactors?: string[];
        ipAddress?: string;
        deviceFingerprint?: string;
        geoLocation?: string;
        actionTaken?: string;
        flaggedBy?: string;
        correlationId?: string;
    }): string;
    /**
     * Log chargeback events
     */
    chargebackReceived(context?: {
        chargeId?: string;
        transactionId?: string;
        userId?: string;
        amount?: number;
        currency?: string;
        reason?: string;
        disputeId?: string;
        chargebackDate?: string;
        responseDeadline?: string;
        status?: string;
        correlationId?: string;
    }): string;
    /**
     * Log payment performance metrics
     */
    paymentPerformance(context?: {
        processingTimeMs?: number;
        paymentMethod?: string;
        region?: string;
        success?: boolean;
        retryCount?: number;
        timestamp?: string;
        correlationId?: string;
    }): string;
    /**
     * Get last log entry (for testing)
     */
    getLastLogEntry(): import("..").LogEntry | null;
    /**
     * Get all log entries (for testing)
     */
    getAllLogEntries(): import("..").LogEntry[];
}
//# sourceMappingURL=PaymentLogger.d.ts.map