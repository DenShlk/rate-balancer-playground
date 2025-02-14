import React from 'react';
import styled from 'styled-components';
import { ServerConfig, TimeConfig, AlgorithmConfig } from '../types';

interface Props {
  serverConfig: ServerConfig;
  timeConfig: TimeConfig;
  algorithmConfig: AlgorithmConfig;
  availableAlgorithms: string[];
  currentAlgorithm: string;
  onServerConfigChange: (config: ServerConfig) => void;
  onTimeConfigChange: (config: TimeConfig) => void;
  onAlgorithmParameterChange: (paramName: string, value: number) => void;
  onAlgorithmChange: (algorithmName: "Fixed Rate" | "Constant Adjustments" | "Multiplicative Adjustments" | "Additive increase/multiplicative decrease") => void;
  onReset: () => void;
}

const Panel = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 300px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #333;
  margin-bottom: 15px;
  
  &:focus {
    outline: none;
    border-color: #8884d8;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Slider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #ddd;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #8884d8;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #8884d8;
    cursor: pointer;
    border: none;
  }
`;

const Value = styled.span`
  min-width: 50px;
  font-size: 14px;
  color: #666;
  text-align: right;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 10px;
  background: ${props => props.variant === 'secondary' ? '#f44336' : '#8884d8'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
  
  &:hover {
    background: ${props => props.variant === 'secondary' ? '#d32f2f' : '#7673c0'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const SettingsPanel: React.FC<Props> = ({
  serverConfig,
  timeConfig,
  algorithmConfig,
  availableAlgorithms,
  currentAlgorithm,
  onServerConfigChange,
  onTimeConfigChange,
  onAlgorithmParameterChange,
  onAlgorithmChange,
  onReset
}) => {
  return (
    <Panel>
      <Section>
        <SectionTitle>Algorithm Selection</SectionTitle>
        <Select
          value={currentAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as "Fixed Rate" | "Constant Adjustments" | "Multiplicative Adjustments" | "Additive increase/multiplicative decrease")}
        >
          {availableAlgorithms.map(algorithm => (
            <option key={algorithm} value={algorithm}>
              {algorithm}
            </option>
          ))}
        </Select>
      </Section>

      <Section>
        <SectionTitle>Server Settings</SectionTitle>
        <InputGroup>
          <Label>Maximum RPM</Label>
          <SliderContainer>
            <Slider
              type="range"
              value={serverConfig.maxRPM}
              onChange={(e) => onServerConfigChange({
                ...serverConfig,
                maxRPM: Number(e.target.value)
              })}
              min={1}
              max={300}
              step={1}
            />
            <Value>{serverConfig.maxRPM}</Value>
          </SliderContainer>
        </InputGroup>
        <InputGroup>
          <Label>Bad Response %</Label>
          <SliderContainer>
            <Slider
              type="range"
              value={serverConfig.badResponsePercentage}
              onChange={(e) => onServerConfigChange({
                ...serverConfig,
                badResponsePercentage: Number(e.target.value)
              })}
              min={0}
              max={100}
              step={1}
            />
            <Value>{serverConfig.badResponsePercentage}%</Value>
          </SliderContainer>
        </InputGroup>
        <InputGroup>
          <Label>Requests to Track</Label>
          <SliderContainer>
            <Slider
              type="range"
              value={serverConfig.requestsToTrack}
              onChange={(e) => onServerConfigChange({
                ...serverConfig,
                requestsToTrack: Number(e.target.value)
              })}
              min={2}
              max={50}
              step={1}
            />
            <Value>{serverConfig.requestsToTrack}</Value>
          </SliderContainer>
        </InputGroup>
      </Section>

      <Section>
        <SectionTitle>Algorithm Settings ({algorithmConfig.name})</SectionTitle>
        {Object.entries(algorithmConfig.parameters).map(([name, config]) => (
          <InputGroup key={name}>
            <Label>{name.charAt(0).toUpperCase() + name.slice(1)}</Label>
            <SliderContainer>
              <Slider
                type="range"
                value={config.value}
                onChange={(e) => onAlgorithmParameterChange(name, Number(e.target.value))}
                min={config.min}
                max={config.max}
                step={config.step}
              />
              <Value>{config.value}</Value>
            </SliderContainer>
          </InputGroup>
        ))}
      </Section>

      <Section>
        <SectionTitle>Time Control</SectionTitle>
        <InputGroup>
          <Label>Time Scale</Label>
          <SliderContainer>
            <Slider
              type="range"
              value={timeConfig.timeScale}
              onChange={(e) => onTimeConfigChange({
                ...timeConfig,
                timeScale: Number(e.target.value)
              })}
              min={0.1}
              max={10}
              step={0.1}
            />
            <Value>{timeConfig.timeScale}x</Value>
          </SliderContainer>
        </InputGroup>
        <ButtonGroup>
          <Button
            onClick={() => onTimeConfigChange({
              ...timeConfig,
              isPlaying: !timeConfig.isPlaying
            })}
          >
            {timeConfig.isPlaying ? '⏸ Pause' : '▶ Play'}
          </Button>
          <Button variant="secondary" onClick={onReset}>
            ⟲ Reset
          </Button>
        </ButtonGroup>
      </Section>
    </Panel>
  );
};

export default SettingsPanel; 