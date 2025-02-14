# Development Plan

## Overview
This project is a demo for visualizing how different algorithms adjust the request rate depending on the responses of a simulated server. The server is parameterized by maximum RPM and a percentage of bad responses. The application will allow the user to adjust both server and algorithm parameters in real time, visualize the results on a graph, and control time playback.

## Architecture & Technology Stack

- **Frontend:** React
  - Use Create React App (or Vite) for project scaffolding.
  - State management with React hooks (or Context API/Redux if state complexity increases).
  - Component-based layout.
- **Visualization:**
  - Use Recharts for data visualization. Recharts offers robust, responsive charting suitable for real-time updates.
- **Styling:**
  - CSS Modules, Styled Components, or any preferred CSS framework.
- **Backend (Simulation Logic):**
  - Simulation logic resides on the client (React) with the entire simulation and algorithm processing implemented in TypeScript.
  
  - **Algorithm Implementation:**
    - Implement algorithms as TypeScript classes.
    - Each algorithm must provide:
      - A method to return its configurable parameters for the UI (e.g., `getConfig()`).
      - A method to process the latest request result (good/bad) and return a new target rpm (e.g., `processResult(result)`).
    - The next request will be scheduled based on the returned target rpm (i.e., with an interval of 60/target_rpm seconds), supporting dynamic time scale adjustments.

## Key Components

1. **Graph Component**
   - A single graph will display comprehensive simulation data on common axes.
   - X-axis represents time; Y-axis represents RPM.
   - The graph includes:
       - A dotted line for the server's max RPM (with new timestamps reflecting any updates to the setting).
       - A dotted line for the target RPM computed by the active algorithm.
       - Stacked bars showing counts of good and bad responses.
   - Both granulation (data resolution) and the history window (time range for displayed data) are configurable.

2. **RPM Display**
   - Shows the current RPM value.
   - Visual component indicating the RPM threshold from the server.

3. **Settings Panel**
   - **Server Settings:** 
     - Maximum RPM.
     - Percentage of bad responses.
   - **Algorithm Settings:** 
     - **Fixed Rate:** Only one controllable parameter—the fixed rate.
     - **Constant Adjustments:** 
       - Delta for increments/decrements.
       - Minimum and maximum boundaries.
     - **Multiplicative Adjustments:**
       - Multiplicative factor.
       - Minimum and maximum boundaries.
   - **Time Settings:**
     - Start/Pause button.
     - Time scale control for adjusting the playback speed, which dynamically recalculates active delay intervals.

4. **Algorithm Controller**
   - Instantiates and manages algorithm classes implemented as TypeScript classes.
   - Each algorithm must adhere to the following interface:
       - A method to return its UI configuration (e.g., `getConfig()`) for parameter adjustments.
       - A method to process the latest request result (good or bad) and return a new target RPM (e.g., `processResult(result)`).
   - The computed target RPM determines the delay for the next request (calculated as 60/target_rpm seconds), while supporting dynamic time scale adjustments even mid-delay.
   - Designed for easy extension, allowing additional algorithms and future visualizations.

5. **Server Simulator**
   - Simulates server responses based on:
     - Current RPM relative to the maximum RPM.
     - Randomization determined by the specified percentage of bad responses.
   - Provides real-time feedback to the Algorithm Controller.

6. **Data Storage & Management**
   - Simulation results (including timestamps, good/bad counts, current RPM, etc.) will be stored in an in-memory data structure (e.g., within React state or context).
   - Data older than the configured history window will be pruned, ensuring that the graph only reflects recent data.
   - Recharts will render the stored data in real time.

## Development Steps

1. **Project Setup**
   - Scaffold a new React project.
   - Set up the chosen charting library for data visualization.
   - Establish project structure with directories for components, hooks, and utility functions.

2. **Implement Core Simulation Logic & Algorithm Interface**
   - Develop functions to simulate server responses.
   - Create algorithm classes for the following strategies, implementing the defined interface:
       - Fixed Rate.
       - Constant Adjustments.
       - Multiplicative Adjustments.
   - Each algorithm class must include:
       - A method to return its UI configuration (e.g., `getConfig()`), enabling parameter adjustments.
       - A method to process the latest request result and return the new target RPM (e.g., `processResult(result)`), where the next request interval is 60/target_rpm seconds, with dynamic time scale adjustments applied even during an active delay.

3. **Design and Develop the User Interface**
   - **Graph Component:** 
     - Create a component that hooks into the simulation to update the graph in real time.
   - **RPM Display & Server Limit Line:** 
     - Develop a visual indicator that shows current RPM alongside the server's limit.
   - **Settings Panel:** 
     - Build a controls panel for user-modifiable parameters (server, algorithm, and time).
     - Ensure real-time responsiveness to changes.
   - **Time Control:** 
     - Implement play/pause functionality.
     - Add a control for adjusting the time scale.

4. **Integration**
   - Tie the simulation logic and the UI components together.
   - Ensure that changes in settings immediately affect the simulation and visualization.

5. **Testing & Refinements**
   - Test each algorithm's behavior under various conditions.
   - Perform UI/UX testing to verify responsiveness and interactivity.
   - Optimize performance for real-time updates.

6. **Future Considerations**
   - Extend the algorithms list as needed.
   - Consider incorporating error handling and additional visualizations (e.g., more detailed statistics, charts).
   - Responsive design improvements for mobile or varying screen sizes.

## Milestones

1. **Step 1: Setup and Core Simulation**
   - Project scaffolding.
   - Implement server simulation and basic algorithm logic.

2. **Step 2: UI Components Development**
   - Develop the Graph Component and RPM Display.
   - Build out the Settings Panel and integrate time controls.

3. **Step 3: Integration and Testing**
   - Integrate simulation logic with UI components.
   - Conduct testing and gather feedback.

4. **Step 4: Polish and Extend**
   - Fine-tune the performance and user experience.
   - Add documentation and prepare for potential extensions.

## Additional Considerations
- Ensure that the system is modular, so that you can add or update algorithms with minimal changes.
- Focus on creating clear separation between simulation logic and UI components.
- Make sure to document functions and components for future reference.

This development plan should provide a structured roadmap for implementing your demo in React. 