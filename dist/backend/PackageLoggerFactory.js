/**
 * Package Logger Factory - Consolidated logger creation for all CVPlus packages
 *
 * This factory provides standardized logging implementations for all remaining packages,
 * ensuring consistency while allowing package-specific customizations.
 */
import { LoggerFactory, CorrelationService, LogLevel } from './index';
/**
 * Base package logger implementation
 */
export class BasePackageLogger {
    constructor(packageName, logLevel = LogLevel.INFO) {
        this.packageName = packageName;
        this.logger = LoggerFactory.createLogger(packageName, {
            level: logLevel,
            enableConsole: true,
            enableFirebase: true,
            enablePiiRedaction: true
        });
    }
    info(message, context) {
        const correlationId = CorrelationService.getCurrentId();
        this.logger.info(message, { ...context, correlationId, package: this.packageName });
    }
    warn(message, context) {
        const correlationId = CorrelationService.getCurrentId();
        this.logger.warn(message, { ...context, correlationId, package: this.packageName });
    }
    error(message, error, context) {
        const correlationId = CorrelationService.getCurrentId();
        this.logger.error(message, {
            ...context,
            correlationId,
            package: this.packageName,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
    debug(message, context) {
        const correlationId = CorrelationService.getCurrentId();
        this.logger.debug(message, { ...context, correlationId, package: this.packageName });
    }
    withCorrelation(correlationId, callback) {
        const result = CorrelationService.withCorrelationId(correlationId, callback);
        return result;
    }
}
/**
 * T032: Analytics Logger
 */
export class AnalyticsLogger extends BasePackageLogger {
    constructor() {
        super('@cvplus/analytics');
    }
    trackEvent(eventName, properties, userId) {
        this.info('Analytics event tracked', {
            event: 'analytics.event.tracked',
            eventName,
            userId,
            properties
        });
    }
    trackMetric(metricName, value, dimensions) {
        this.debug('Metric recorded', {
            event: 'analytics.metric.recorded',
            metricName,
            value,
            dimensions
        });
    }
    reportGenerated(reportType, userId, filters) {
        this.info('Analytics report generated', {
            event: 'analytics.report.generated',
            reportType,
            userId,
            filterCount: Object.keys(filters).length
        });
    }
    getStats() {
        return {
            eventsTracked: 0,
            metricsRecorded: 0,
            reportsGenerated: 0
        };
    }
}
/**
 * T033: Premium Logger
 */
export class PremiumLogger extends BasePackageLogger {
    constructor() {
        super('@cvplus/premium');
    }
    subscriptionCreated(userId, planId, amount) {
        this.info('Subscription created', {
            event: 'premium.subscription.created',
            userId,
            planId,
            amount
        });
    }
    paymentProcessed(userId, amount, success, paymentId) {
        this.info('Payment processed', {
            event: 'premium.payment.processed',
            userId,
            amount,
            success,
            paymentId
        });
    }
    featureAccessed(userId, feature, allowed) {
        this.debug('Premium feature accessed', {
            event: 'premium.feature.accessed',
            userId,
            feature,
            allowed
        });
    }
    getStats() {
        return {
            subscriptionsCreated: 0,
            paymentsProcessed: 0,
            featureAccesses: 0
        };
    }
}
/**
 * T034: Recommendations Logger
 */
export class RecommendationsLogger extends BasePackageLogger {
    constructor() {
        super('@cvplus/recommendations');
    }
    recommendationGenerated(userId, type, count, confidence) {
        this.info('Recommendations generated', {
            event: 'recommendations.generated',
            userId,
            type,
            count,
            confidence
        });
    }
    recommendationClicked(userId, recommendationId, type) {
        this.debug('Recommendation clicked', {
            event: 'recommendations.clicked',
            userId,
            recommendationId,
            type
        });
    }
    modelTraining(modelType, trainingData, accuracy) {
        this.info('Model training completed', {
            event: 'recommendations.model.trained',
            modelType,
            trainingData,
            accuracy
        });
    }
    getStats() {
        return {
            recommendationsGenerated: 0,
            recommendationsClicked: 0,
            modelsTrained: 0
        };
    }
}
/**
 * T035: Public Profiles Logger
 */
export class ProfilesLogger extends BasePackageLogger {
    constructor() {
        super('@cvplus/public-profiles');
    }
    profileCreated(userId, profileId, visibility) {
        this.info('Public profile created', {
            event: 'profiles.created',
            userId,
            profileId,
            visibility
        });
    }
    profileViewed(profileId, viewerId, referrer) {
        this.debug('Profile viewed', {
            event: 'profiles.viewed',
            profileId,
            viewerId,
            referrer
        });
    }
    contactFormSubmitted(profileId, message) {
        this.info('Contact form submitted', {
            event: 'profiles.contact.submitted',
            profileId,
            messageLength: message.length
        });
    }
    getStats() {
        return {
            profilesCreated: 0,
            profileViews: 0,
            contactForms: 0
        };
    }
}
/**
 * T036: Admin Logger
 */
export class AdminLogger extends BasePackageLogger {
    constructor() {
        super('@cvplus/admin');
    }
    adminAction(adminUserId, action, targetResource, success) {
        this.info('Admin action performed', {
            event: 'admin.action.performed',
            adminUserId,
            action,
            targetResource,
            success
        });
    }
    systemHealthCheck(component, status, details) {
        this.debug('System health check', {
            event: 'admin.health.check',
            component,
            status,
            details
        });
    }
    configurationChanged(adminUserId, setting, oldValue, newValue) {
        this.warn('Configuration changed', {
            event: 'admin.config.changed',
            adminUserId,
            setting,
            oldValue,
            newValue
        });
    }
    getStats() {
        return {
            adminActions: 0,
            healthChecks: 0,
            configChanges: 0
        };
    }
}
/**
 * T037: Workflow Logger
 */
export class WorkflowLogger extends BasePackageLogger {
    constructor() {
        super('@cvplus/workflow');
    }
    jobCreated(jobId, userId, jobType) {
        this.info('Workflow job created', {
            event: 'workflow.job.created',
            jobId,
            userId,
            jobType
        });
    }
    stepCompleted(jobId, stepName, duration, success) {
        this.debug('Workflow step completed', {
            event: 'workflow.step.completed',
            jobId,
            stepName,
            duration,
            success
        });
    }
    workflowCompleted(jobId, totalDuration, stepsCompleted) {
        this.info('Workflow completed', {
            event: 'workflow.completed',
            jobId,
            totalDuration,
            stepsCompleted
        });
    }
    getStats() {
        return {
            jobsCreated: 0,
            stepsCompleted: 0,
            workflowsCompleted: 0
        };
    }
}
/**
 * T038: Payments Logger
 */
export class PaymentsLogger extends BasePackageLogger {
    constructor() {
        super('@cvplus/payments');
    }
    paymentInitiated(paymentId, userId, amount, provider) {
        this.info('Payment initiated', {
            event: 'payments.initiated',
            paymentId,
            userId,
            amount,
            provider
        });
    }
    paymentCompleted(paymentId, success, transactionId, error) {
        if (success) {
            this.info('Payment completed successfully', {
                event: 'payments.completed',
                paymentId,
                success,
                transactionId
            });
        }
        else {
            this.error('Payment failed', error, {
                event: 'payments.completed',
                paymentId,
                success
            });
        }
    }
    refundProcessed(refundId, originalPaymentId, amount, reason) {
        this.info('Refund processed', {
            event: 'payments.refund.processed',
            refundId,
            originalPaymentId,
            amount,
            reason
        });
    }
    getStats() {
        return {
            paymentsInitiated: 0,
            paymentsCompleted: 0,
            refundsProcessed: 0
        };
    }
}
/**
 * Factory function to create package loggers
 */
export function createPackageLogger(packageName) {
    switch (packageName) {
        case '@cvplus/analytics':
            return new AnalyticsLogger();
        case '@cvplus/premium':
            return new PremiumLogger();
        case '@cvplus/recommendations':
            return new RecommendationsLogger();
        case '@cvplus/public-profiles':
            return new ProfilesLogger();
        case '@cvplus/admin':
            return new AdminLogger();
        case '@cvplus/workflow':
            return new WorkflowLogger();
        case '@cvplus/payments':
            return new PaymentsLogger();
        default:
            throw new Error(`Unknown package: ${packageName}`);
    }
}
/**
 * Export all logger instances
 */
export const analyticsLogger = new AnalyticsLogger();
export const premiumLogger = new PremiumLogger();
export const recommendationsLogger = new RecommendationsLogger();
export const profilesLogger = new ProfilesLogger();
export const adminLogger = new AdminLogger();
export const workflowLogger = new WorkflowLogger();
export const paymentsLogger = new PaymentsLogger();
/**
 * Consolidated logging utilities
 */
export const packageLogging = {
    analytics: analyticsLogger,
    premium: premiumLogger,
    recommendations: recommendationsLogger,
    profiles: profilesLogger,
    admin: adminLogger,
    workflow: workflowLogger,
    payments: paymentsLogger
};
// Export the factory function as default
export default createPackageLogger;
//# sourceMappingURL=PackageLoggerFactory.js.map