import { AlgorithmConfig, RateControlAlgorithm } from '../types';

export class FixedRateAlgorithm implements RateControlAlgorithm {
  private rate: number;

  constructor(initialRate: number = 60) {
    this.rate = initialRate;
  }

  getConfig(): AlgorithmConfig {
    return {
      name: 'Fixed Rate',
      parameters: {
        rate: {
          value: this.rate,
          min: 1,
          max: 300,
          step: 1
        }
      }
    };
  }

  processResult(wasSuccessful: boolean): number {
    return this.rate;
  }

  reset(): void {
    // No reset needed for fixed rate
  }

  setRate(rate: number): void {
    this.rate = rate;
  }
} 