/**
 * Production validation and health checking utilities for the CVPlus logging system
 * Ensures logging system is production-ready with comprehensive validation
 */
import { EventEmitter } from 'events';
export interface ValidationResult {
    isValid: boolean;
    category: 'configuration' | 'performance' | 'security' | 'integration' | 'infrastructure';
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    details?: Record<string, any>;
    recommendations?: string[];
    fixable?: boolean;
}
export interface SystemHealthReport {
    overall: 'healthy' | 'degraded' | 'critical';
    score: number;
    validationResults: ValidationResult[];
    metrics: {
        uptime: number;
        logThroughput: number;
        errorRate: number;
        averageLatency: number;
        memoryUsage: number;
        diskUsage: number;
    };
    timestamp: Date;
}
export interface ProductionReadinessCheck {
    isProductionReady: boolean;
    blockers: ValidationResult[];
    warnings: ValidationResult[];
    recommendations: ValidationResult[];
    checklist: Array<{
        category: string;
        items: Array<{
            name: string;
            status: 'pass' | 'fail' | 'warning';
        }>;
    }>;
}
/**
 * Production validation engine
 */
export declare class ProductionValidator extends EventEmitter {
    private validationRules;
    private healthCheckers;
    constructor();
    /**
     * Initialize default production validation rules
     */
    private initializeDefaultValidators;
    /**
     * Validate logging configuration for production readiness
     */
    private validateLoggingConfiguration;
    /**
     * Validate security settings
     */
    private validateSecuritySettings;
    /**
     * Validate performance settings
     */
    private validatePerformanceSettings;
    /**
     * Validate retention policies
     */
    private validateRetentionPolicies;
    /**
     * Check system resources
     */
    private checkSystemResources;
    /**
     * Check log storage health
     */
    private checkLogStorage;
    /**
     * Check network connectivity for remote logging
     */
    private checkNetworkConnectivity;
    /**
     * Check health of logging system dependencies
     */
    private checkDependencyHealth;
    /**
     * Run complete production validation
     */
    validateProduction(config: any): Promise<ProductionReadinessCheck>;
    /**
     * Generate system health report
     */
    generateHealthReport(): Promise<SystemHealthReport>;
    /**
     * Generate production readiness checklist
     */
    private generateChecklist;
    private getChecklistItemStatus;
    private simulateStorageCheck;
    private simulateEndpointCheck;
    private simulateDependencyCheck;
}
export declare const productionValidator: ProductionValidator;
declare const _default: {
    ProductionValidator: typeof ProductionValidator;
    productionValidator: ProductionValidator;
};
export default _default;
//# sourceMappingURL=ProductionValidation.d.ts.map