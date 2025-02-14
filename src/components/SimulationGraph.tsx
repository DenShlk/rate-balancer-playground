import React, { useMemo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Bar
} from 'recharts';
import styled from 'styled-components';
import { SimulationDataPoint } from '../types';

interface Props {
  data: SimulationDataPoint[];
  maxRPM: number;
  width?: number;
  height?: number;
  accumulatedStats: {
    totalRequests: number;
    goodRequests: number;
    totalRPM: number;
    rpmSamples: number;
  };
}

const GraphContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  min-width: 600px;
`;

const StatsOverlay = styled.div`
  position: absolute;
  top: 40px;
  right: 40px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div<{ color?: string }>`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.color || '#82ca9d'};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const ChartContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

// Constants for data processing
const MAIN_BUCKET_SIZE = 0.5; // 0.5s for main graph
const HISTORY_BUCKET_SIZE = 2.0; // 2s for history graph
const MAX_HISTORY_POINTS = 15; // Maximum number of history points to show

const SimulationGraph: React.FC<Props> = ({
  data,
  maxRPM,
  width = 800,
  height = 400,
  accumulatedStats
}) => {
  // Process data for both graphs
  const { mainData, historyData } = useMemo(() => {
    if (data.length === 0) return { mainData: [], historyData: [] };

    const latestTime = data[data.length - 1].relativeTime;
    const mainBuckets = new Map<number, SimulationDataPoint>();
    const historyBuckets = new Map<number, { good: number; bad: number }>();
    
    // Process data in reverse order (newest to oldest)
    for (let i = data.length - 1; i >= 0; i--) {
      const point = data[i];
      const timeAgo = point.relativeTime - latestTime;
      
      // Process main graph data (RPM metrics)
      const mainBucketKey = Math.floor(timeAgo / MAIN_BUCKET_SIZE) * MAIN_BUCKET_SIZE;
      if (!mainBuckets.has(mainBucketKey)) {
        mainBuckets.set(mainBucketKey, {
          ...point,
          timeAgo: mainBucketKey
        });
      }
      
      // Process history data (requests)
      const historyBucketKey = Math.floor(timeAgo / HISTORY_BUCKET_SIZE) * HISTORY_BUCKET_SIZE;
      if (historyBucketKey > -MAX_HISTORY_POINTS * HISTORY_BUCKET_SIZE) { // Only process recent history
        const bucket = historyBuckets.get(historyBucketKey) || { good: 0, bad: 0 };
        bucket.good += point.goodResponses;
        bucket.bad += point.badResponses;
        historyBuckets.set(historyBucketKey, bucket);
      }
    }

    // Convert buckets to arrays and sort by time
    const mainData = Array.from(mainBuckets.values())
      .sort((a, b) => a.timeAgo - b.timeAgo);

    const historyData = Array.from(historyBuckets.entries())
      .map(([timeAgo, counts]) => ({
        timeAgo,
        goodResponses: counts.good,
        badResponses: counts.bad
      }))
      .sort((a, b) => a.timeAgo - b.timeAgo)
      .slice(-MAX_HISTORY_POINTS); // Limit number of bars

    return { mainData, historyData };
  }, [data]);

  const formatTime = (timeAgo: number) => {
    return `${timeAgo.toFixed(1)}s`;
  };

  const overallSuccessRate = accumulatedStats.totalRequests > 0
    ? (accumulatedStats.goodRequests / accumulatedStats.totalRequests * 100).toFixed(1)
    : '100.0';

  const averageRPM = accumulatedStats.rpmSamples > 0
    ? (accumulatedStats.totalRPM / accumulatedStats.rpmSamples).toFixed(1)
    : '0.0';

  const expectedGoodRPM = accumulatedStats.rpmSamples > 0
    ? (Number(averageRPM) * Number(overallSuccessRate) / 100).toFixed(1)
    : '0.0';

  const mainHeight = Math.floor(height * 0.7);
  const historyHeight = Math.floor(height * 0.3);
  const chartWidth = Math.max(width, 600);

  return (
    <GraphContainer>
      <StatsOverlay>
        <StatItem>
          <StatValue color="#82ca9d">{overallSuccessRate}%</StatValue>
          <StatLabel>Success Rate</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue color="#8884d8">{averageRPM}</StatValue>
          <StatLabel>Average RPM</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue color="#ff7300">{expectedGoodRPM}</StatValue>
          <StatLabel>Expected Good RPM</StatLabel>
        </StatItem>
      </StatsOverlay>

      {/* Main Graph - RPM */}
      <ChartContainer>
        <ComposedChart width={chartWidth} height={mainHeight} data={mainData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timeAgo"
            tickFormatter={formatTime}
            domain={['dataMin', 'dataMax']}
            type="number"
            hide={true}
          />
          <YAxis 
            label={{ value: 'RPM', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            labelFormatter={(value: number) => `${Math.abs(value).toFixed(1)}s ago`}
            formatter={(value: number, name: string) => [value.toFixed(1), name]}
          />
          <Legend />
          
          <Line
            type="monotone"
            dataKey={() => maxRPM}
            stroke="#ff7300"
            strokeDasharray="5 5"
            name="Max RPM"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="targetRPM"
            stroke="#8884d8"
            name="Target RPM"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="actualRPM"
            stroke="#82ca9d"
            name="Actual RPM"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartContainer>

      {/* Request History Graph */}
      <ChartContainer>
        <ComposedChart width={chartWidth} height={historyHeight} data={historyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timeAgo"
            tickFormatter={formatTime}
            domain={['dataMin', 'dataMax']}
            type="number"
            label={{ value: 'Time (seconds ago)', position: 'insideBottom', offset: -5 }}
            height={40}
          />
          <YAxis 
            label={{ value: 'Requests', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            labelFormatter={(value: number) => `${Math.abs(value).toFixed(1)}s ago`}
            formatter={(value: number, name: string) => [value.toFixed(1), name]}
          />
          <Legend wrapperStyle={{ paddingTop: '15px' }} />
          
          <Bar
            dataKey="goodResponses"
            stackId="responses"
            fill="#82ca9d"
            name="Good Requests"
            isAnimationActive={false}
          />
          <Bar
            dataKey="badResponses"
            stackId="responses"
            fill="#ff8042"
            name="Bad Requests"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartContainer>
    </GraphContainer>
  );
};

export default SimulationGraph; 