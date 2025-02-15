export interface AlgorithmConfig {
  name: string;
  parameters: Record<string, {
    value: number;
    min?: number;
    max?: number;
    step?: number;
  }>;
}

export interface ServerConfig {
  maxRPM: number;
  badResponsePercentage: number;
  requestsToTrack: number;  // Number of requests to track for RPM calculation
}

export interface TimeConfig {
  timeScale: number;
  isPlaying: boolean;
  timeWindow: number;
}

export interface SimulationDataPoint {
  relativeTime: number;
  targetRPM: number;
  actualRPM: number;
  goodResponses: number;
  badResponses: number;
  timeAgo?: number;  // Optional property used for graph visualization
}

export interface RateControlAlgorithm {
  getConfig(): AlgorithmConfig;
  processResult(wasSuccessful: boolean): number;
  reset(): void;
} 