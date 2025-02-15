import { AlgorithmConfig, RateControlAlgorithm } from '../types';

interface HistoryEntry {
  wasSuccessful: boolean;
  rate: number;
}

export class StatsLerpAlgorithm implements RateControlAlgorithm {
  private history: HistoryEntry[] = [];
  private currentRate: number;
  private historyLength: number; // X: Number of requests to track (0-50)
  private lerpFactor: number;    // Y: Lerp interpolation factor (0-2.0)
  private minRate: number;
  private maxRate: number;

  constructor(
    initialRate: number = 60,
    historyLength: number = 10,
    lerpFactor: number = 1.0,
    minRate: number = 1,
    maxRate: number = 300
  ) {
    this.currentRate = initialRate;
    this.historyLength = historyLength;
    this.lerpFactor = lerpFactor;
    this.minRate = minRate;
    this.maxRate = maxRate;
  }

  getConfig(): AlgorithmConfig {
    return {
      name: 'Stats Lerp Algorithm',
      parameters: {
        currentRate: {
          value: this.currentRate,
          min: this.minRate,
          max: this.maxRate,
          step: 1
        },
        historyLength: {
          value: this.historyLength,
          min: 0,
          max: 50,
          step: 1
        },
        lerpFactor: {
          value: this.lerpFactor,
          min: 0,
          max: 2.0,
          step: 0.1
        }
      }
    };
  }

  processResult(wasSuccessful: boolean): number {
    // Record the current response if historyLength > 0
    if (this.historyLength > 0) {
      this.history.push({ wasSuccessful, rate: this.currentRate });
      if (this.history.length > this.historyLength) {
        this.history = this.history.slice(-this.historyLength);
      }
    }

    // Calculate average rates for good and bad responses
    const goodRates = this.history.filter(entry => entry.wasSuccessful).map(entry => entry.rate);
    const badRates = this.history.filter(entry => !entry.wasSuccessful).map(entry => entry.rate);

    let goodAvg = goodRates.length > 0 ? goodRates.reduce((a, b) => a + b, 0) / goodRates.length : this.currentRate;
    let badAvg = badRates.length > 0 ? badRates.reduce((a, b) => a + b, 0) / badRates.length : this.currentRate;

    if (goodAvg === badAvg) {
        goodAvg += 5;
        badAvg -= 5;
    }

    let newRate: number;
    if (!wasSuccessful) {
      // For a bad response: lerp from badAvg to goodAvg
      newRate = badAvg + this.lerpFactor * (goodAvg - badAvg) - 1;
    } else {
      // For a good response: lerp from goodAvg to badAvg
      newRate = goodAvg + this.lerpFactor * (badAvg - goodAvg) + 1;
    }

    // Clamp newRate within bounds
    newRate = Math.max(this.minRate, Math.min(this.maxRate, newRate));
    this.currentRate = newRate;
    return newRate;
  }

  reset(): void {
    this.history = [];
    this.currentRate = 60;
  }

  // Setter methods for external parameter updates
  setCurrentRate(rate: number): void {
    this.currentRate = Math.max(this.minRate, Math.min(this.maxRate, rate));
  }

  setHistoryLength(length: number): void {
    this.historyLength = Math.max(0, Math.min(50, length));
    // Trim history if new length is smaller
    while (this.history.length > this.historyLength) {
      this.history.shift();
    }
  }

  setLerpFactor(factor: number): void {
    this.lerpFactor = Math.max(0, Math.min(2.0, factor));
  }
}
