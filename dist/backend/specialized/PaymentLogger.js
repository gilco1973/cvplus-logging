/**
 * T025: Payment-specific logging implementation
 * CVPlus Logging System - Payment Module Logger
 */
import { BaseLogger } from '../core/BaseLogger';
import { LogLevel, LogDomain } from '../types';
export class PaymentLogger extends BaseLogger {
    constructor(serviceName = 'payment-service') {
        super(serviceName, {
            package: '@cvplus/premium',
            level: LogLevel.INFO
        });
    }
    /**
     * Log payment initiation
     */
    paymentInitiated(context = {}) {
        // Note: paymentIntent is excluded from logging for security
        return this.log(LogLevel.INFO, 'Payment transaction initiated', {
            domain: LogDomain.BUSINESS,
            event: 'PAYMENT_INITIATED',
            userId: context.userId,
            transactionId: context.transactionId,
            amount: context.amount,
            currency: context.currency,
            paymentMethod: context.paymentMethod,
            plan: context.plan
        });
    }
    /**
     * Log successful payment
     */
    paymentSucceeded(context = {}) {
        const performance = context.processingTime ? {
            duration: context.processingTime
        } : undefined;
        // Note: stripeChargeId is excluded from logging for security
        return this.log(LogLevel.INFO, 'Payment transaction succeeded', {
            domain: LogDomain.BUSINESS,
            event: 'PAYMENT_SUCCEEDED',
            transactionId: context.transactionId,
            userId: context.userId,
            amount: context.amount,
            currency: context.currency,
            plan: context.plan,
            billingCycle: context.billingCycle,
            outcome: 'success',
            performance
        });
    }
    /**
     * Log payment failures
     */
    paymentFailed(context = {}) {
        const error = context.errorMessage ? {
            message: context.errorMessage,
            code: context.errorCode,
            details: {
                declineCode: context.declineCode
            }
        } : undefined;
        const performance = context.processingTime ? {
            duration: context.processingTime
        } : undefined;
        return this.log(LogLevel.WARN, 'Payment transaction failed', {
            domain: LogDomain.BUSINESS,
            event: 'PAYMENT_FAILED',
            transactionId: context.transactionId,
            userId: context.userId,
            amount: context.amount,
            currency: context.currency,
            plan: context.plan,
            attemptNumber: context.attemptNumber,
            outcome: 'failed',
            error,
            performance
        });
    }
    /**
     * Log subscription creation
     */
    subscriptionCreated(context = {}) {
        return this.log(LogLevel.INFO, 'Subscription created', {
            domain: LogDomain.BUSINESS,
            event: 'SUBSCRIPTION_CREATED',
            userId: context.userId,
            subscriptionId: context.subscriptionId,
            plan: context.plan,
            amount: context.amount,
            currency: context.currency,
            billingInterval: context.billingInterval,
            trialPeriodDays: context.trialPeriodDays,
            status: context.status
        });
    }
    /**
     * Log invoice generation
     */
    invoiceGenerated(context = {}) {
        var _a;
        return this.log(LogLevel.INFO, 'Invoice generated', {
            domain: LogDomain.BUSINESS,
            event: 'INVOICE_GENERATED',
            invoiceId: context.invoiceId,
            userId: context.userId,
            subscriptionId: context.subscriptionId,
            amount: context.amount,
            currency: context.currency,
            totalAmount: context.totalAmount,
            lineItemsCount: (_a = context.lineItems) === null || _a === void 0 ? void 0 : _a.length
        });
    }
    /**
     * Log payment retry scheduling
     */
    paymentRetryScheduled(context = {}) {
        const error = context.lastFailureReason ? {
            message: context.lastFailureReason
        } : undefined;
        return this.log(LogLevel.WARN, 'Payment retry scheduled', {
            domain: LogDomain.SYSTEM,
            event: 'PAYMENT_RETRY_SCHEDULED',
            transactionId: context.transactionId,
            userId: context.userId,
            amount: context.amount,
            retryAttempt: context.retryAttempt,
            maxRetries: context.maxRetries,
            retryStrategy: context.retryStrategy,
            retryDelay: context.retryDelay,
            error
        });
    }
    /**
     * Log suspicious payment activity
     */
    suspiciousPaymentActivity(context = {}) {
        return this.log(LogLevel.ERROR, 'Suspicious payment activity detected', {
            domain: LogDomain.SECURITY,
            event: 'SUSPICIOUS_PAYMENT_ACTIVITY',
            userId: context.userId,
            transactionId: context.transactionId,
            riskScore: context.riskScore,
            riskFactors: context.riskFactors,
            actionTaken: context.actionTaken,
            flaggedBy: context.flaggedBy,
            severity: 'high'
        });
    }
    /**
     * Log chargeback events
     */
    chargebackReceived(context = {}) {
        // Note: disputeId and chargeId are excluded from logging for security
        return this.log(LogLevel.ERROR, 'Chargeback received', {
            domain: LogDomain.BUSINESS,
            event: 'CHARGEBACK_RECEIVED',
            transactionId: context.transactionId,
            userId: context.userId,
            amount: context.amount,
            currency: context.currency,
            reason: context.reason,
            status: context.status,
            severity: 'high'
        });
    }
    /**
     * Log payment performance metrics
     */
    paymentPerformance(context = {}) {
        const performance = context.processingTimeMs ? {
            duration: context.processingTimeMs
        } : undefined;
        return this.log(LogLevel.INFO, 'Payment processing performance recorded', {
            domain: LogDomain.PERFORMANCE,
            event: 'PAYMENT_PERFORMANCE',
            paymentMethod: context.paymentMethod,
            region: context.region,
            success: context.success,
            retryCount: context.retryCount,
            performance
        });
    }
    /**
     * Get last log entry (for testing)
     */
    getLastLogEntry() {
        return super.getLastLogEntry();
    }
    /**
     * Get all log entries (for testing)
     */
    getAllLogEntries() {
        return super.getAllLogEntries();
    }
}
//# sourceMappingURL=PaymentLogger.js.map