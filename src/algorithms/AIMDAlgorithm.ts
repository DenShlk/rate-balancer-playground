import { AlgorithmConfig, RateControlAlgorithm } from '../types';

export class AIMDAlgorithm implements RateControlAlgorithm {
  private currentRate: number;
  private addIncrease: number;
  private multiDecreaseFactor: number;
  private minRate: number;
  private maxRate: number;

  constructor(
    initialRate: number = 60,
    addIncrease: number = 5,
    multiDecreaseFactor: number = 0.5,
    minRate: number = 1,
    maxRate: number = 300
  ) {
    this.currentRate = initialRate;
    this.addIncrease = addIncrease;
    this.multiDecreaseFactor = multiDecreaseFactor;
    this.minRate = minRate;
    this.maxRate = maxRate;
  }

  getConfig(): AlgorithmConfig {
    return {
      name: 'AIMD (Additive Increase/Multiplicative Decrease)',
      parameters: {
        currentRate: {
          value: this.currentRate,
          min: this.minRate,
          max: this.maxRate,
          step: 1
        },
        addIncrease: {
          value: this.addIncrease,
          min: 0.1,
          max: 100,
          step: 0.1
        },
        multiDecreaseFactor: {
          value: this.multiDecreaseFactor,
          min: 0.1,
          max: 0.9,
          step: 0.05
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
      // Additive increase
      this.currentRate = Math.min(this.maxRate, this.currentRate + this.addIncrease);
    } else {
      // Multiplicative decrease
      this.currentRate = Math.max(this.minRate, this.currentRate * this.multiDecreaseFactor);
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

  setAddIncrease(increase: number): void {
    this.addIncrease = increase;
  }

  setMultiDecreaseFactor(factor: number): void {
    this.multiDecreaseFactor = factor;
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