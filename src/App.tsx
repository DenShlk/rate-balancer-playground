import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import SimulationGraph from './components/SimulationGraph';
import SettingsPanel from './components/SettingsPanel';
import { FixedRateAlgorithm } from './algorithms/FixedRateAlgorithm';
import { ConstantAdjustmentsAlgorithm } from './algorithms/ConstantAdjustmentsAlgorithm';
import { MultiplicativeAdjustmentsAlgorithm } from './algorithms/MultiplicativeAdjustmentsAlgorithm';
import { AIMDAlgorithm } from './algorithms/AIMDAlgorithm';
import { useSimulation } from './hooks/useSimulation';
import { ServerConfig, TimeConfig, RateControlAlgorithm } from './types';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
  gap: 20px;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 24px;
`;

// Available algorithms with their display names
const ALGORITHMS = {
  'Fixed Rate': FixedRateAlgorithm,
  'Constant Adjustments': ConstantAdjustmentsAlgorithm,
  'Multiplicative Adjustments': MultiplicativeAdjustmentsAlgorithm,
  'Additive increase/multiplicative decrease': AIMDAlgorithm,
} as const;

function App() {
  // Track both the current algorithm instance and its name
  const [currentAlgorithm, setCurrentAlgorithm] = useState<{
    name: keyof typeof ALGORITHMS;
    instance: RateControlAlgorithm;
  }>(() => ({
    name: 'Fixed Rate',
    instance: new FixedRateAlgorithm(60)
  }));
  
  const initialServerConfig: ServerConfig = {
    maxRPM: 100,
    badResponsePercentage: 10,
    requestsToTrack: 10  // Track last 10 requests for RPM calculation
  };

  const initialTimeConfig: TimeConfig = {
    timeScale: 1,
    isPlaying: false
  };

  const {
    data,
    setServerConfig,
    setTimeConfig,
    resetSimulation,
    currentServerConfig,
    currentTimeConfig,
    accumulatedStats,
    setAccumulatedStats
  } = useSimulation(currentAlgorithm.instance, initialServerConfig, initialTimeConfig);

  const handleAlgorithmChange = useCallback((algorithmName: keyof typeof ALGORITHMS) => {
    const AlgorithmClass = ALGORITHMS[algorithmName];
    setCurrentAlgorithm({
      name: algorithmName,
      instance: new AlgorithmClass(60) // Create new instance with default settings
    });
    resetSimulation();
  }, [resetSimulation]);

  const handleAlgorithmParameterChange = useCallback((paramName: string, value: number) => {
    const algorithm = currentAlgorithm.instance;
    // Use the appropriate setter method based on the parameter name
    const setterName = `set${paramName.charAt(0).toUpperCase()}${paramName.slice(1)}` as keyof RateControlAlgorithm;
    if (typeof algorithm[setterName] === 'function') {
      (algorithm[setterName] as Function)(value);
      // Only reset accumulated stats, not the whole simulation
      setAccumulatedStats({
        totalRequests: 0,
        goodRequests: 0,
        totalRPM: 0,
        rpmSamples: 0
      });
    }
  }, [currentAlgorithm]);

  return (
    <AppContainer>
      <SettingsPanel
        serverConfig={currentServerConfig}
        timeConfig={currentTimeConfig}
        algorithmConfig={currentAlgorithm.instance.getConfig()}
        availableAlgorithms={Object.keys(ALGORITHMS)}
        currentAlgorithm={currentAlgorithm.name}
        onAlgorithmChange={handleAlgorithmChange}
        onServerConfigChange={setServerConfig}
        onTimeConfigChange={setTimeConfig}
        onAlgorithmParameterChange={handleAlgorithmParameterChange}
        onReset={resetSimulation}
      />
      <MainContent>
        <Title>Rate Balancer Visualization</Title>
        <SimulationGraph
          data={data}
          maxRPM={currentServerConfig.maxRPM}
          accumulatedStats={accumulatedStats}
        />
      </MainContent>
    </AppContainer>
  );
}

export default App;
