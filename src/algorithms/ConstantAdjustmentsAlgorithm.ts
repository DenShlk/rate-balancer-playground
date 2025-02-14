import { AlgorithmConfig, RateControlAlgorithm } from '../types';

export class ConstantAdjustmentsAlgorithm implements RateControlAlgorithm {
  private currentRate: number;
  private delta: number;
  private minRate: number;
  private maxRate: number;

  constructor(initialRate: number = 60, delta: number = 5, minRate: number = 1, maxRate: number = 1000) {
    this.currentRate = initialRate;
    this.delta = delta;
    this.minRate = minRate;
    this.maxRate = maxRate;
  }

  getConfig(): AlgorithmConfig {
    return {
      name: 'Constant Adjustments',
      parameters: {
        currentRate: {
          value: this.currentRate,
          min: this.minRate,
          max: this.maxRate,
          step: 1
        },
        delta: {
          value: this.delta,
          min: 0.1,
          max: 10,
          step: 0.1
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
      this.currentRate = Math.min(this.maxRate, this.currentRate + this.delta);
    } else {
      this.currentRate = Math.max(this.minRate, this.currentRate - this.delta);
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

  setDelta(delta: number): void {
    this.delta = delta;
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