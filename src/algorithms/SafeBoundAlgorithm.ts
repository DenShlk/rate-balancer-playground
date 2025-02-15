import { AlgorithmConfig, RateControlAlgorithm } from '../types';

export class SafeBoundAlgorithm implements RateControlAlgorithm {
  private currentRate: number;
  private safeRate: number;
  private upperBound: number;
  private probeFactor: number;
  private reductionFactor: number;
  private forgetFactor: number;
  private minRate: number;
  private maxRate: number;
  private initialRate: number;
  private consecutiveFailures: number;

  constructor(
    initialRate: number = 60,
    probeFactor: number = 0.9,
    reductionFactor: number = 0.5,
    forgetFactor: number = 0.05,
    minRate: number = 1,
    maxRate: number = 300
  ) {
    this.initialRate = initialRate;
    this.currentRate = initialRate;
    this.safeRate = initialRate;
    this.upperBound = maxRate;
    this.probeFactor = probeFactor;
    this.reductionFactor = reductionFactor;
    this.forgetFactor = forgetFactor;
    this.minRate = minRate;
    this.maxRate = maxRate;
    this.consecutiveFailures = 0;
  }

  getConfig(): AlgorithmConfig {
    return {
      name: 'SafeBound Algorithm',
      parameters: {
        currentRate: {
          value: this.currentRate,
          min: this.minRate,
          max: this.maxRate,
          step: 1
        },
        safeRate: {
          value: this.safeRate,
          min: this.minRate,
          max: this.maxRate,
          step: 1
        },
        upperBound: {
          value: this.upperBound,
          min: this.safeRate,
          max: this.maxRate,
          step: 1
        },
        probeFactor: {
          value: this.probeFactor,
          min: 0,
          max: 1,
          step: 0.1
        },
        reductionFactor: {
          value: this.reductionFactor,
          min: 0,
          max: 1,
          step: 0.1
        },
        forgetFactor: {
          value: this.forgetFactor,
          min: 0,
          max: 1,
          step: 0.01
        }
      }
    };
  }

  processResult(wasSuccessful: boolean): number {
    if (wasSuccessful) {
      this.consecutiveFailures = 0;
      // On success, update safeRate and probe closer to the upperBound
      this.safeRate = Math.max(this.safeRate, this.currentRate);
      let newRate = this.safeRate + this.probeFactor * (this.upperBound - this.safeRate);
      newRate = Math.min(this.maxRate, Math.max(this.minRate, newRate));
      this.currentRate = newRate;
    } else {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 3) {
        // After several failures, probe upward to test if conditions have improved
        let newRate = this.currentRate * this.reductionFactor;
        newRate = Math.min(this.maxRate, Math.max(this.minRate, newRate));
        this.currentRate = newRate;
        this.consecutiveFailures = 0; // reset after probe
      } else {
        // Normal failure: reduce the rate
        this.upperBound = Math.min(this.upperBound, this.currentRate);
        let newRate = this.safeRate + this.reductionFactor * (this.currentRate - this.safeRate);
        newRate = Math.min(this.maxRate, Math.max(this.minRate, newRate));
        this.currentRate = newRate;
      }
    }

    // Apply forgetting mechanism to allow state to fade over time
    this.safeRate = (1 - this.forgetFactor) * this.safeRate + this.forgetFactor * this.currentRate;
    this.upperBound = (1 - this.forgetFactor) * this.upperBound + this.forgetFactor * this.currentRate;

    return this.currentRate;
  }

  reset(): void {
    this.currentRate = this.initialRate;
    this.safeRate = this.initialRate;
    this.upperBound = this.maxRate;
    this.consecutiveFailures = 0;
  }

  // Setter methods for external configuration updates
  setCurrentRate(rate: number): void {
    this.currentRate = Math.min(this.maxRate, Math.max(this.minRate, rate));
  }

  setProbeFactor(factor: number): void {
    this.probeFactor = Math.max(0, Math.min(1, factor));
  }

  setReductionFactor(factor: number): void {
    this.reductionFactor = Math.max(0, Math.min(1, factor));
  }

  setForgetFactor(factor: number): void {
    this.forgetFactor = Math.max(0, Math.min(1, factor));
  }

  setMinRate(min: number): void {
    this.minRate = min;
    if (this.currentRate < min) this.currentRate = min;
    if (this.safeRate < min) this.safeRate = min;
  }

  setMaxRate(max: number): void {
    if (max > this.maxRate) {
      // If increasing max rpm, update upperBound and reset safeRate to currentRate to allow upward probing
      this.upperBound = max;
      this.safeRate = this.currentRate;
      this.consecutiveFailures = 0;
    } else {
      if (this.currentRate > max) this.currentRate = max;
      if (this.upperBound > max) this.upperBound = max;
    }
    this.maxRate = max;
  }
} 