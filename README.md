# InteractiveVisualizationOfJavaCode
When using the system, a Java Project is first parsed and two .json files (entities.json, assocs.json) are created. In the next step, the contents of these two files are visualised. 

To use the system, the main file ...\InteractiveVisualizationOfJavaCode\Visualization_of_Java_Code\src\main\java\analysis\IVC.java can be started including one command line argument specifying the full path to the project that should be parsed. 
This first step automatically creates and saves the two .json files under ...\InteractiveVisualizationOfJavaCode\Visualization_of_Java_Code\src\main\js\D3\public\src\data. 

In the second step, the visualisation can be started via the command 'node index.js' in the directory ...\InteractiveVisualizationOfJavaCode\Visualization_of_Java_Code\src\main\js\D3.
The visualisation can be started with multiple further configurations - more information on the options can be found via entering 'node index.js --help' in the same directory. 
