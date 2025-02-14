import { AlgorithmConfig, RateControlAlgorithm } from '../types';

export class MultiplicativeAdjustmentsAlgorithm implements RateControlAlgorithm {
  private currentRate: number;
  private factor: number;
  private minRate: number;
  private maxRate: number;

  constructor(initialRate: number = 60, factor: number = 1.05, minRate: number = 1, maxRate: number = 1000) {
    this.currentRate = initialRate;
    this.factor = factor;
    this.minRate = minRate;
    this.maxRate = maxRate;
  }

  getConfig(): AlgorithmConfig {
    return {
      name: 'Multiplicative Adjustments',
      parameters: {
        currentRate: {
          value: this.currentRate,
          min: this.minRate,
          max: this.maxRate,
          step: 1
        },
        factor: {
          value: this.factor,
          min: 1.01,
          max: 1.5,
          step: 0.01
        },
        minRate: {
          value: this.minRate,
          min: 1,
          max: this.maxRate,
          step: 1
        },
        maxRate: {
          value: this.maxRate,
          min: this.minRate,
          max: 300,
          step: 1
        }
      }
    };
  }

  processResult(wasSuccessful: boolean): number {
    if (wasSuccessful) {
      this.currentRate = Math.min(this.maxRate, this.currentRate * this.factor);
    } else {
      this.currentRate = Math.max(this.minRate, this.currentRate / this.factor);
    }
    return this.currentRate;
  }

  reset(): void {
    this.currentRate = 60; // Reset to default initial rate
  }

  // Setter methods for configuration
  setCurrentRate(rate: number): void {
    this.currentRate = Math.max(this.minRate, Math.min(this.maxRate, rate));
  }

  setFactor(factor: number): void {
    this.factor = factor;
  }

  setMinRate(minRate: number): void {
    this.minRate = Math.min(minRate, this.maxRate);
    this.currentRate = Math.max(this.minRate, this.currentRate);
  }

  setMaxRate(maxRate: number): void {
    this.maxRate = Math.max(maxRate, this.minRate);
    this.currentRate = Math.min(this.maxRate, this.currentRate);
  }
} 