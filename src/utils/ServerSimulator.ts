import { ServerConfig } from '../types';

interface Request {
  timestamp: number;  // Simulation timestamp in milliseconds
}

export class ServerSimulator {
  private config: ServerConfig;
  private requests: Request[];

  constructor(config: ServerConfig) {
    this.config = config;
    this.requests = [];
  }

  processRequest(simulationTime: number): boolean {
    // Add current request
    this.requests.push({ timestamp: simulationTime });

    // Keep only the last N requests
    if (this.requests.length > this.config.requestsToTrack) {
      this.requests = this.requests.slice(-this.config.requestsToTrack);
    }

    // Calculate current RPM
    const currentRPM = this.getCurrentRPM();

    // If we're over the max RPM, automatically fail
    if (currentRPM > this.config.maxRPM) {
      return false;
    }

    // Otherwise, use the configured bad response percentage
    return Math.random() >= this.config.badResponsePercentage / 100;
  }

  updateConfig(config: ServerConfig): void {
    this.config = config;
    // Trim requests if the new config requires fewer requests
    if (this.requests.length > config.requestsToTrack) {
      this.requests = this.requests.slice(-config.requestsToTrack);
    }
  }

  getCurrentRPM(): number {
    if (this.requests.length < 2) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    const latestRequest = this.requests[this.requests.length - 1];
    const timeSpanMinutes = (latestRequest.timestamp - oldestRequest.timestamp) / (1000 * 60);

    // If all requests happened at the same time, use a minimum time span
    if (timeSpanMinutes === 0) {
      return 300;
    }

    return (this.requests.length - 1) / timeSpanMinutes;
  }

  reset(): void {
    this.requests = [];
  }
} 