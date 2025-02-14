import { useState, useEffect, useRef, useCallback } from 'react';
import { ServerSimulator } from '../utils/ServerSimulator';
import { SimulationDataPoint, ServerConfig, TimeConfig, RateControlAlgorithm } from '../types';

const MAX_TIME_WINDOW = 30; // 30 seconds of history
const UPDATE_INTERVAL = 1000 / 60; // 60 FPS

interface SimulationTime {
  simulationTime: number;  // Current simulation time in milliseconds
  nextRequestTime: number; // Next scheduled request time in simulation time
  leftoverTime: number;    // Time left over from previous update
}

interface AccumulatedStats {
  totalRequests: number;
  goodRequests: number;
  totalRPM: number;  // Sum of RPM values for averaging
  rpmSamples: number;  // Number of RPM samples for averaging
}

export function useSimulation(
  algorithm: RateControlAlgorithm,
  initialServerConfig: ServerConfig,
  initialTimeConfig: TimeConfig
) {
  const [serverConfig, setServerConfig] = useState<ServerConfig>(initialServerConfig);
  const [timeConfig, setTimeConfig] = useState<TimeConfig>(initialTimeConfig);
  const [data, setData] = useState<SimulationDataPoint[]>([]);
  const [accumulatedStats, setAccumulatedStats] = useState<AccumulatedStats>({
    totalRequests: 0,
    goodRequests: 0,
    totalRPM: 0,
    rpmSamples: 0
  });
  
  const serverSimulator = useRef(new ServerSimulator(initialServerConfig));
  const simulationTime = useRef<SimulationTime>({
    simulationTime: 0,
    nextRequestTime: 0,
    leftoverTime: 0
  });
  const lastUpdateTime = useRef<number>(Date.now());
  const animationFrame = useRef<number>();

  const addDataPoint = useCallback((wasSuccessful: boolean, targetRPM: number) => {
    const simTime = simulationTime.current.simulationTime / 1000; // Convert to seconds
    const actualRPM = serverSimulator.current.getCurrentRPM();
    
    // Update accumulated stats
    setAccumulatedStats(prev => ({
      totalRequests: prev.totalRequests + 1,
      goodRequests: prev.goodRequests + (wasSuccessful ? 1 : 0),
      totalRPM: prev.totalRPM + actualRPM,
      rpmSamples: prev.rpmSamples + 1
    }));
    
    setData(prevData => {
      const newPoint: SimulationDataPoint = {
        relativeTime: simTime,
        targetRPM,
        actualRPM,
        goodResponses: wasSuccessful ? 1 : 0,
        badResponses: wasSuccessful ? 0 : 1
      };

      // Filter out points older than MAX_TIME_WINDOW seconds
      const newData = [...prevData, newPoint].filter(
        point => simTime - point.relativeTime <= MAX_TIME_WINDOW
      );

      return newData;
    });
  }, []);

  const processRequests = useCallback(() => {
    // Process requests as long as simulation time has reached the next scheduled request time
    while (simulationTime.current.simulationTime >= simulationTime.current.nextRequestTime) {
      const wasSuccessful = serverSimulator.current.processRequest(simulationTime.current.simulationTime);
      const newTargetRPM = algorithm.processResult(wasSuccessful);
      addDataPoint(wasSuccessful, newTargetRPM);
      
      // Calculate new interval based on the updated target RPM
      const requestInterval = (60 / newTargetRPM) * 1000; // milliseconds between requests
      simulationTime.current.nextRequestTime += requestInterval;
    }
  }, [algorithm, addDataPoint]);

  const simulationLoop = useCallback(() => {
    if (!timeConfig.isPlaying) {
      lastUpdateTime.current = Date.now();
      animationFrame.current = requestAnimationFrame(simulationLoop);
      return;
    }

    const now = Date.now();
    const realElapsedTime = now - lastUpdateTime.current;
    lastUpdateTime.current = now;

    // Convert real elapsed time to simulation time
    const simElapsedTime = (realElapsedTime * timeConfig.timeScale) + simulationTime.current.leftoverTime;
    
    // Update simulation time
    simulationTime.current.simulationTime += simElapsedTime;
    simulationTime.current.leftoverTime = simElapsedTime % UPDATE_INTERVAL;

    // Process requests
    processRequests();

    animationFrame.current = requestAnimationFrame(simulationLoop);
  }, [timeConfig.isPlaying, timeConfig.timeScale, processRequests]);

  useEffect(() => {
    animationFrame.current = requestAnimationFrame(simulationLoop);
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [simulationLoop]);

  useEffect(() => {
    serverSimulator.current.updateConfig(serverConfig);
    // Reset accumulated stats when server config changes
    setAccumulatedStats({
      totalRequests: 0,
      goodRequests: 0,
      totalRPM: 0,
      rpmSamples: 0
    });
    // Don't reset data, just reset timing
    simulationTime.current = {
      simulationTime: 0,
      nextRequestTime: 0,
      leftoverTime: 0
    };
    lastUpdateTime.current = Date.now();
  }, [serverConfig]);

  const resetSimulation = useCallback(() => {
    setData([]);
    setAccumulatedStats({
      totalRequests: 0,
      goodRequests: 0,
      totalRPM: 0,
      rpmSamples: 0
    });
    algorithm.reset();
    serverSimulator.current.reset();
    simulationTime.current = {
      simulationTime: 0,
      nextRequestTime: 0,
      leftoverTime: 0
    };
    lastUpdateTime.current = Date.now();
  }, [algorithm]);

  return {
    data,
    setServerConfig,
    setTimeConfig,
    resetSimulation,
    currentServerConfig: serverConfig,
    currentTimeConfig: timeConfig,
    accumulatedStats,
    setAccumulatedStats
  };
} 