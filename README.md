This is a demo for visualizing different algorithms of adjusting request rate depending on the responses of the server. 

In this demo, the simulated server can be parametrized by 1) max rpm 2) random percent of bad responses
If rpm exceeds the max rpm, the server will respond with a bad response.

The user can adjust the server and algorithm parameters in real time and see how different algorithms react to the changes.

The algorithms are:
1) Fixed rate
2) Constant adjustments depending on the response (set delta and min/max values)
3) Multiplicative adjustments depending on the response (set factor and min/max values)
Others can be added later

The user interface should be as follows:
Main frame is a graph that shows good/bad responses count against time.
Under it is the rpm value (and a line showing the server's rpm limit).

Under them there is a panel with settings for the server and the algorithm, as well as time settings: start/pause + time scale.

