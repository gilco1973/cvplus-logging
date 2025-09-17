// @ts-ignore
/**
 * T030: CV processing logging in packages/cv-processing/src/logging/ProcessingLogger.ts
 *
 * Specialized logger for CV processing, analysis, and transformation events
 * Tracks document processing, AI analysis, ATS optimization, and performance metrics
  */

import {
  LoggerFactory,
  CorrelationService,
  LogLevel,
  LogDomain,
  type Logger,
  type LogPerformance
} from '@cvplus/logging';

/**
 * CV processing event types
  */
export enum ProcessingEventType {
  CV_UPLOAD = 'cv.upload',
  CV_PARSING = 'cv.parsing',
  CV_ANALYSIS = 'cv.analysis',
  CV_TRANSFORMATION = 'cv.transformation',
  CV_GENERATION = 'cv.generation',
  ATS_OPTIMIZATION = 'cv.ats.optimization',
  SKILLS_EXTRACTION = 'cv.skills.extraction',
  EXPERIENCE_ANALYSIS = 'cv.experience.analysis',
  PERSONALITY_ANALYSIS = 'cv.personality.analysis',
  KEYWORD_ANALYSIS = 'cv.keyword.analysis',
  FORMATTING_APPLY = 'cv.formatting.apply',
  TEMPLATE_APPLY = 'cv.template.apply',
  EXPORT_GENERATE = 'cv.export.generate',
  AI_ENHANCEMENT = 'cv.ai.enhancement',
  QUALITY_CHECK = 'cv.quality.check',
  COMPLIANCE_CHECK = 'cv.compliance.check'
}

/**
 * Processing stage enumeration
  */
export enum ProcessingStage {
  UPLOAD = 'upload',
  PARSING = 'parsing',
  ANALYSIS = 'analysis',
  ENHANCEMENT = 'enhancement',
  TRANSFORMATION = 'transformation',
  GENERATION = 'generation',
  EXPORT = 'export',
  COMPLETE = 'complete'
}

/**
 * CV processing context interface
  */
export interface ProcessingContext {
  jobId?: string;
  userId?: string;
  sessionId?: string;
  cvId?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  stage?: ProcessingStage;
  templateId?: string;
  targetRole?: string;
  industry?: string;
  atsScore?: number;
  processingTimeMs?: number;
  features?: string[];
  aiModel?: string;
  language?: string;
  region?: string;
  qualityScore?: number;
  errorDetails?: Record<string, any>;
}

/**
 * File processing metrics
  */
export interface FileProcessingMetrics {
  fileSize: number;
  parseTime: number;
  analysisTime: number;
  enhancementTime: number;
  totalTime: number;
  memoryUsage: number;
  cpuUsage: number;
  apiCalls: number;
  tokenUsage?: number;
  cacheHits: number;
  cacheMisses: number;
}

/**
 * ATS optimization results
  */
export interface AtsOptimizationResult {
  originalScore: number;
  optimizedScore: number;
  improvement: number;
  keywordMatches: number;
  missingKeywords: string[];
  recommendations: string[];
  processingTime: number;
}

/**
 * Specialized CV processing logger
  */
export class ProcessingLogger {
  private readonly logger: Logger;
  private readonly packageName = '@cvplus/cv-processing';
  private readonly processingJobs: Map<string, ProcessingContext> = new Map();

  constructor() {
    this.logger = LoggerFactory.createLogger(this.packageName, {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFirebase: true,
      enablePiiRedaction: true
    });
  }

  /**
   * Log CV upload
    */
  cvUpload(context: ProcessingContext): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    if (context.jobId) {
      this.processingJobs.set(context.jobId, {
        ...context,
        stage: ProcessingStage.UPLOAD
      });
    }

    this.logger.info('CV uploaded for processing', {
      event: ProcessingEventType.CV_UPLOAD,
      jobId: context.jobId,
      userId: context.userId,
      fileName: context.fileName,
      fileSize: context.fileSize,
      fileType: context.fileType,
      correlationId
    });
  }

  /**
   * Log CV parsing start/completion
    */
  cvParsing(context: ProcessingContext, success: boolean, metrics?: Partial<FileProcessingMetrics>, error?: Error): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    if (context.jobId && this.processingJobs.has(context.jobId)) {
      const job = this.processingJobs.get(context.jobId)!;
      job.stage = ProcessingStage.PARSING;
      this.processingJobs.set(context.jobId, job);
    }

    const performance: LogPerformance = {
      duration: metrics?.parseTime,
      memoryUsage: metrics?.memoryUsage,
      cpuUsage: metrics?.cpuUsage
    };

    if (success) {
      this.logger.info('CV parsing completed', {
        event: ProcessingEventType.CV_PARSING,
        jobId: context.jobId,
        userId: context.userId,
        fileName: context.fileName,
        correlationId,
        performance
      });
    } else {
      this.logger.error('CV parsing failed', {
        event: ProcessingEventType.CV_PARSING,
        jobId: context.jobId,
        userId: context.userId,
        fileName: context.fileName,
        correlationId,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  }

  /**
   * Log CV analysis
    */
  cvAnalysis(context: ProcessingContext, analysisType: string, results: Record<string, any>, metrics?: Partial<FileProcessingMetrics>): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    if (context.jobId && this.processingJobs.has(context.jobId)) {
      const job = this.processingJobs.get(context.jobId)!;
      job.stage = ProcessingStage.ANALYSIS;
      this.processingJobs.set(context.jobId, job);
    }

    const performance: LogPerformance = {
      duration: metrics?.analysisTime,
      memoryUsage: metrics?.memoryUsage,
      cpuUsage: metrics?.cpuUsage
    };

    this.logger.info('CV analysis completed', {
      event: ProcessingEventType.CV_ANALYSIS,
      jobId: context.jobId,
      userId: context.userId,
      analysisType,
      aiModel: context.aiModel,
      language: context.language,
      qualityScore: results.qualityScore,
      correlationId,
      performance,
      results: {
        ...results,
        // Remove sensitive data
        personalInfo: undefined,
        contactDetails: undefined
      }
    });
  }

  /**
   * Log ATS optimization
    */
  atsOptimization(context: ProcessingContext, result: AtsOptimizationResult): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    this.logger.info('ATS optimization completed', {
      event: ProcessingEventType.ATS_OPTIMIZATION,
      jobId: context.jobId,
      userId: context.userId,
      targetRole: context.targetRole,
      industry: context.industry,
      originalScore: result.originalScore,
      optimizedScore: result.optimizedScore,
      improvement: result.improvement,
      keywordMatches: result.keywordMatches,
      missingKeywordsCount: result.missingKeywords.length,
      recommendationsCount: result.recommendations.length,
      correlationId,
      performance: {
        duration: result.processingTime
      }
    });
  }

  /**
   * Log skills extraction
    */
  skillsExtraction(context: ProcessingContext, extractedSkills: string[], confidence: number): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    this.logger.info('Skills extracted from CV', {
      event: ProcessingEventType.SKILLS_EXTRACTION,
      jobId: context.jobId,
      userId: context.userId,
      skillsCount: extractedSkills.length,
      confidence,
      topSkills: extractedSkills.slice(0, 10), // Log top 10 skills only
      correlationId
    });
  }

  /**
   * Log experience analysis
    */
  experienceAnalysis(context: ProcessingContext, experienceData: Record<string, any>): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    this.logger.info('Experience analysis completed', {
      event: ProcessingEventType.EXPERIENCE_ANALYSIS,
      jobId: context.jobId,
      userId: context.userId,
      totalExperience: experienceData.totalYears,
      positions: experienceData.positionsCount,
      companies: experienceData.companiesCount,
      industries: experienceData.industries,
      careerProgression: experienceData.progressionScore,
      correlationId
    });
  }

  /**
   * Log personality analysis
    */
  personalityAnalysis(context: ProcessingContext, personalityData: Record<string, any>): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    this.logger.info('Personality analysis completed', {
      event: ProcessingEventType.PERSONALITY_ANALYSIS,
      jobId: context.jobId,
      userId: context.userId,
      aiModel: context.aiModel,
      personalityType: personalityData.type,
      traits: personalityData.traits,
      confidence: personalityData.confidence,
      correlationId
    });
  }

  /**
   * Log CV transformation
    */
  cvTransformation(context: ProcessingContext, transformationType: string, success: boolean, error?: Error): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    if (context.jobId && this.processingJobs.has(context.jobId)) {
      const job = this.processingJobs.get(context.jobId)!;
      job.stage = ProcessingStage.TRANSFORMATION;
      this.processingJobs.set(context.jobId, job);
    }

    if (success) {
      this.logger.info('CV transformation completed', {
        event: ProcessingEventType.CV_TRANSFORMATION,
        jobId: context.jobId,
        userId: context.userId,
        transformationType,
        templateId: context.templateId,
        features: context.features,
        correlationId
      });
    } else {
      this.logger.error('CV transformation failed', {
        event: ProcessingEventType.CV_TRANSFORMATION,
        jobId: context.jobId,
        userId: context.userId,
        transformationType,
        correlationId,
        error: error ? {
          name: error.name,
          message: error.message
        } : undefined
      });
    }
  }

  /**
   * Log CV generation
    */
  cvGeneration(context: ProcessingContext, outputFormat: string, success: boolean, metrics?: Partial<FileProcessingMetrics>): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    if (context.jobId && this.processingJobs.has(context.jobId)) {
      const job = this.processingJobs.get(context.jobId)!;
      job.stage = success ? ProcessingStage.COMPLETE : ProcessingStage.GENERATION;
      this.processingJobs.set(context.jobId, job);
    }

    const performance: LogPerformance = {
      duration: metrics?.totalTime,
      memoryUsage: metrics?.memoryUsage,
      cpuUsage: metrics?.cpuUsage
    };

    this.logger.info('CV generation completed', {
      event: ProcessingEventType.CV_GENERATION,
      jobId: context.jobId,
      userId: context.userId,
      outputFormat,
      success,
      templateId: context.templateId,
      qualityScore: context.qualityScore,
      correlationId,
      performance
    });
  }

  /**
   * Log AI enhancement
    */
  aiEnhancement(context: ProcessingContext, enhancementType: string, tokenUsage?: number): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    this.logger.info('AI enhancement applied', {
      event: ProcessingEventType.AI_ENHANCEMENT,
      jobId: context.jobId,
      userId: context.userId,
      enhancementType,
      aiModel: context.aiModel,
      tokenUsage,
      correlationId
    });
  }

  /**
   * Log quality check
    */
  qualityCheck(context: ProcessingContext, checks: Record<string, boolean>, overallScore: number): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    this.logger.info('Quality check performed', {
      event: ProcessingEventType.QUALITY_CHECK,
      jobId: context.jobId,
      userId: context.userId,
      overallScore,
      passedChecks,
      totalChecks,
      passRate: (passedChecks / totalChecks) * 100,
      checks,
      correlationId
    });
  }

  /**
   * Log processing job completion
    */
  jobComplete(jobId: string, success: boolean, totalMetrics: FileProcessingMetrics): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();
    const job = this.processingJobs.get(jobId);

    if (job) {
      job.stage = ProcessingStage.COMPLETE;
      job.processingTimeMs = totalMetrics.totalTime;
    }

    const performance: LogPerformance = {
      duration: totalMetrics.totalTime,
      memoryUsage: totalMetrics.memoryUsage,
      cpuUsage: totalMetrics.cpuUsage
    };

    this.logger.info('CV processing job completed', {
      jobId,
      userId: job?.userId,
      success,
      totalTime: totalMetrics.totalTime,
      apiCalls: totalMetrics.apiCalls,
      tokenUsage: totalMetrics.tokenUsage,
      cacheHitRate: totalMetrics.cacheHits / (totalMetrics.cacheHits + totalMetrics.cacheMisses) * 100,
      correlationId,
      performance
    });

    // Clean up job tracking
    this.processingJobs.delete(jobId);
  }

  /**
   * Log processing error
    */
  processingError(context: ProcessingContext, error: Error, stage: ProcessingStage): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    this.logger.error('CV processing error', {
      jobId: context.jobId,
      userId: context.userId,
      stage,
      fileName: context.fileName,
      correlationId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: context.errorDetails
    });

    // Update job status
    if (context.jobId && this.processingJobs.has(context.jobId)) {
      const job = this.processingJobs.get(context.jobId)!;
      job.errorDetails = {
        stage,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      this.processingJobs.set(context.jobId, job);
    }
  }

  /**
   * Log template application
    */
  templateApply(context: ProcessingContext, templateData: Record<string, any>): void {
    const correlationId = CorrelationService.getCurrentCorrelationId();

    this.logger.debug('Template applied to CV', {
      event: ProcessingEventType.TEMPLATE_APPLY,
      jobId: context.jobId,
      userId: context.userId,
      templateId: context.templateId,
      templateName: templateData.name,
      templateCategory: templateData.category,
      customizations: templateData.customizations,
      correlationId
    });
  }

  /**
   * Get processing statistics
    */
  getProcessingStats(): {
    activeJobs: number;
    jobsByStage: Record<ProcessingStage, number>;
    averageProcessingTime: number;
    totalJobsProcessed: number;
  } {
    const jobs = Array.from(this.processingJobs.values());
    const jobsByStage: Record<ProcessingStage, number> = {} as Record<ProcessingStage, number>;

    // Initialize all stages
    Object.values(ProcessingStage).forEach(stage => {
      jobsByStage[stage] = 0;
    });

    // Count jobs by stage
    jobs.forEach(job => {
      if (job.stage) {
        jobsByStage[job.stage]++;
      }
    });

    return {
      activeJobs: jobs.length,
      jobsByStage,
      averageProcessingTime: 0, // Would be calculated from historical data
      totalJobsProcessed: 0 // Would be tracked separately
    };
  }

  /**
   * Log with correlation context
    */
  withCorrelation<T>(correlationId: string, callback: () => T): T {
    return CorrelationService.withCorrelationId(correlationId, callback);
  }

  /**
   * Get job status
    */
  getJobStatus(jobId: string): ProcessingContext | undefined {
    return this.processingJobs.get(jobId);
  }

  /**
   * Clear completed jobs
    */
  clearCompletedJobs(): number {
    const completed = Array.from(this.processingJobs.entries())
      .filter(([_, job]) => job.stage === ProcessingStage.COMPLETE);

    completed.forEach(([jobId]) => {
      this.processingJobs.delete(jobId);
    });

    return completed.length;
  }
}

/**
 * Global CV processing logger instance
  */
export const processingLogger = new ProcessingLogger();

/**
 * Convenience functions for common processing logging scenarios
  */
export const processingLogging = {
  /**
   * Log file upload with basic validation
    */
  uploadFile: (fileName: string, fileSize: number, userId?: string) => {
    processingLogger.cvUpload({
      fileName,
      fileSize,
      userId,
      jobId: `job_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    });
  },

  /**
   * Log successful processing completion
    */
  processComplete: (jobId: string, processingTimeMs: number, qualityScore?: number) => {
    processingLogger.jobComplete(jobId, true, {
      fileSize: 0,
      parseTime: 0,
      analysisTime: 0,
      enhancementTime: 0,
      totalTime: processingTimeMs,
      memoryUsage: 0,
      cpuUsage: 0,
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0
    });
  },

  /**
   * Log processing failure
    */
  processFailed: (jobId: string, stage: ProcessingStage, error: Error) => {
    processingLogger.processingError({ jobId }, error, stage);
  },

  /**
   * Log ATS score improvement
    */
  atsImprovement: (jobId: string, beforeScore: number, afterScore: number, keywords: string[]) => {
    processingLogger.atsOptimization({ jobId }, {
      originalScore: beforeScore,
      optimizedScore: afterScore,
      improvement: afterScore - beforeScore,
      keywordMatches: keywords.length,
      missingKeywords: [],
      recommendations: [],
      processingTime: 0
    });
  }
};

/**
 * Processing logger middleware for Express
  */
export const processingLoggerMiddleware = (req: any, res: any, next: any) => {
  // Add processing context to request
  req.processingLogger = processingLogger;
  req.processingContext = {
    sessionId: req.sessionID,
    userId: req.user?.id
  };

  next();
};

/**
 * Default export
  */
export default ProcessingLogger;