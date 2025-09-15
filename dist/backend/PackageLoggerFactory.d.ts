/**
 * Package Logger Factory - Consolidated logger creation for all CVPlus packages
 *
 * This factory provides standardized logging implementations for all remaining packages,
 * ensuring consistency while allowing package-specific customizations.
 */
import { LogLevel } from './index';
import { BaseLogger } from './core/BaseLogger';
/**
 * Generic package logger interface
 */
export interface PackageLogger {
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error, context?: Record<string, any>): void;
    debug(message: string, context?: Record<string, any>): void;
    withCorrelation<T>(correlationId: string, callback: () => T): T;
    getStats(): Record<string, any>;
}
/**
 * Base package logger implementation
 */
export declare abstract class BasePackageLogger implements PackageLogger {
    protected readonly logger: BaseLogger;
    protected readonly packageName: string;
    constructor(packageName: string, logLevel?: LogLevel);
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error, context?: Record<string, any>): void;
    debug(message: string, context?: Record<string, any>): void;
    withCorrelation<T>(correlationId: string, callback: () => T): T;
    abstract getStats(): Record<string, any>;
}
/**
 * T032: Analytics Logger
 */
export declare class AnalyticsLogger extends BasePackageLogger {
    constructor();
    trackEvent(eventName: string, properties: Record<string, any>, userId?: string): void;
    trackMetric(metricName: string, value: number, dimensions?: Record<string, string>): void;
    reportGenerated(reportType: string, userId: string, filters: Record<string, any>): void;
    getStats(): Record<string, any>;
}
/**
 * T033: Premium Logger
 */
export declare class PremiumLogger extends BasePackageLogger {
    constructor();
    subscriptionCreated(userId: string, planId: string, amount: number): void;
    paymentProcessed(userId: string, amount: number, success: boolean, paymentId?: string): void;
    featureAccessed(userId: string, feature: string, allowed: boolean): void;
    getStats(): Record<string, any>;
}
/**
 * T034: Recommendations Logger
 */
export declare class RecommendationsLogger extends BasePackageLogger {
    constructor();
    recommendationGenerated(userId: string, type: string, count: number, confidence: number): void;
    recommendationClicked(userId: string, recommendationId: string, type: string): void;
    modelTraining(modelType: string, trainingData: number, accuracy: number): void;
    getStats(): Record<string, any>;
}
/**
 * T035: Public Profiles Logger
 */
export declare class ProfilesLogger extends BasePackageLogger {
    constructor();
    profileCreated(userId: string, profileId: string, visibility: string): void;
    profileViewed(profileId: string, viewerId?: string, referrer?: string): void;
    contactFormSubmitted(profileId: string, message: string): void;
    getStats(): Record<string, any>;
}
/**
 * T036: Admin Logger
 */
export declare class AdminLogger extends BasePackageLogger {
    constructor();
    adminAction(adminUserId: string, action: string, targetResource: string, success: boolean): void;
    systemHealthCheck(component: string, status: string, details?: Record<string, any>): void;
    configurationChanged(adminUserId: string, setting: string, oldValue: any, newValue: any): void;
    getStats(): Record<string, any>;
}
/**
 * T037: Workflow Logger
 */
export declare class WorkflowLogger extends BasePackageLogger {
    constructor();
    jobCreated(jobId: string, userId: string, jobType: string): void;
    stepCompleted(jobId: string, stepName: string, duration: number, success: boolean): void;
    workflowCompleted(jobId: string, totalDuration: number, stepsCompleted: number): void;
    getStats(): Record<string, any>;
}
/**
 * T038: Payments Logger
 */
export declare class PaymentsLogger extends BasePackageLogger {
    constructor();
    paymentInitiated(paymentId: string, userId: string, amount: number, provider: string): void;
    paymentCompleted(paymentId: string, success: boolean, transactionId?: string, error?: Error): void;
    refundProcessed(refundId: string, originalPaymentId: string, amount: number, reason: string): void;
    getStats(): Record<string, any>;
}
/**
 * Factory function to create package loggers
 */
export declare function createPackageLogger(packageName: string): PackageLogger;
/**
 * Export all logger instances
 */
export declare const analyticsLogger: AnalyticsLogger;
export declare const premiumLogger: PremiumLogger;
export declare const recommendationsLogger: RecommendationsLogger;
export declare const profilesLogger: ProfilesLogger;
export declare const adminLogger: AdminLogger;
export declare const workflowLogger: WorkflowLogger;
export declare const paymentsLogger: PaymentsLogger;
/**
 * Consolidated logging utilities
 */
export declare const packageLogging: {
    analytics: AnalyticsLogger;
    premium: PremiumLogger;
    recommendations: RecommendationsLogger;
    profiles: ProfilesLogger;
    admin: AdminLogger;
    workflow: WorkflowLogger;
    payments: PaymentsLogger;
};
export default createPackageLogger;
//# sourceMappingURL=PackageLoggerFactory.d.ts.map