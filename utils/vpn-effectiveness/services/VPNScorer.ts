import type { VPNScorer, VPNTestResult } from '../types';

export class VPNScoringService implements VPNScorer {
  public calculateScore(results: VPNTestResult[]): number {
    return results.reduce((total, result) => total + result.score, 0);
  }

  public calculateGrade(score: number, maxScore: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    const percentage = (score / maxScore) * 100;

    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  public calculateMaxScore(results: VPNTestResult[]): number {
    return results.reduce((total, result) => total + result.maxScore, 0);
  }

  public calculateCategoryScore(categoryResults: VPNTestResult[]) {
    const score = this.calculateScore(categoryResults);
    const maxScore = this.calculateMaxScore(categoryResults);
    const criticalIssues = categoryResults.filter(r => r.status === 'fail' && r.critical).length;

    return {
      categoryScore: score,
      maxCategoryScore: maxScore,
      criticalIssues
    };
  }

  public determineVPNStatus(
    score: number,
    maxScore: number,
    criticalIssues: number
  ): 'excellent' | 'good' | 'poor' | 'critical' | 'unknown' {
    const percentage = (score / maxScore) * 100;

    if (criticalIssues > 0) return 'critical';
    if (percentage >= 90) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 50) return 'poor';
    return 'critical';
  }

  public calculateSummary(allResults: VPNTestResult[]) {
    const totalTests = allResults.length;
    const testsPassed = allResults.filter(r => r.status === 'pass').length;
    const testsFailed = allResults.filter(r => r.status === 'fail').length;
    const testsWarning = allResults.filter(r => r.status === 'warning').length;
    const criticalIssues = allResults.filter(r => r.status === 'fail' && r.critical).length;

    return {
      totalTests,
      testsPassed,
      testsFailed,
      testsWarning,
      criticalIssues
    };
  }
} 