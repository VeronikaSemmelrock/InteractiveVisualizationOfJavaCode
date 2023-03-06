package analysis;

import model.entities.AbstractFamixEntity;
import model.entities.FamixAssociation;
import spoon.reflect.CtModel;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Scanner;

public class IVC {
    private static String SAMPLE_PROJECT_PATH = System.getProperty("user.dir")+"\\src\\test\\resources\\IntegrationTestInputProject";
    private static String OUTPUT_PATH = System.getProperty("user.dir")+"\\src\\main\\js\\D3\\public\\src\\data";

    private static HashMap<String, AbstractFamixEntity> famixEntities = new LinkedHashMap<>();

    private static HashMap<Integer, FamixAssociation> famixAssociations = new LinkedHashMap<>();

    public static void main(String args[]) throws Exception {
        //parse command line arguments
        if(args.length < 1){
            System.out.println("Please provide the necessary argument - java IVJ {pathToProject}");
            return;
        }
        String argument = args[0];
        if (argument.equals("help")){
            System.out.println("Please start the system with the following command structure - java IVJ {pathToProject}\nPathToProject - full path to a java project" +
                    "\nThis will start the parsing process. Afterward, the visualisation server can be started with npm start in "+System.getProperty("user.dir")+"\\src\\main\\java\\visualization\\public\\D3" );
            return;
        }
        //check whether project path exists
        if (!new File(argument).exists())
        {
            System.out.println("Please provide a correct Project Path");
            throw new FileNotFoundException(argument);
        }
        //start system
        startIVC(argument, OUTPUT_PATH);
    }

    public static void startIVC(String projectPath, String outputPath) throws Exception {
        //creating a model of the project via spoon - returns ctModel
        SpoonModel spoonModel = new SpoonModel(projectPath);
        CtModel model = spoonModel.getSpoonModel();

        //parsing the ctModel and creating two hashmaps (entities and associations of model), held by spoonToFamixClass
        SpoonToFamix spoonToFamix = new SpoonToFamix(model);
        spoonToFamix.parseSpoonRootPackage();//starts parsing from root package on

        //exporting both hashmaps
        ExportJSON jsonExport = new ExportJSON();
        famixAssociations = spoonToFamix.getFamixAssociations();
        jsonExport.exportEntitiesToFile(spoonToFamix.getFamixEntities(), outputPath, "entities");
        jsonExport.exportAssociationsToFile(spoonToFamix.getFamixAssociations(), outputPath, "assocs");

        System.out.println("Parsing process finished, please start server in "+ System.getProperty("user.dir")+"\\src\\main\\js\\D3 with command node index.js. For further information on options, enter command node index.js --help in the same directory.");
    }

    public static HashMap<String, AbstractFamixEntity> getEntities(){
        return famixEntities;
    }
    public static HashMap<Integer, FamixAssociation> getAssociations(){
        return famixAssociations;
    }
}
