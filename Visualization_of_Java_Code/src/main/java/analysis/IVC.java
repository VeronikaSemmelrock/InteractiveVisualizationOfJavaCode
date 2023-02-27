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

    private static HashMap<String, AbstractFamixEntity> famixEntities = new LinkedHashMap<>();

    private static HashMap<Integer, FamixAssociation> famixAssociations = new LinkedHashMap<>();

    public static void main(String args[]) throws Exception {
        if(args.length > 0 && args[0].equals("help")){
            System.out.println("Please start the system with the following command structure - java IVJ {pathToProject} {pathForOutput}\nPathToProject - full path to a java project\npathForOutput - full path to where the parsed files entities.json and assocs.json should be put. Please enter this command without a trailing \\");
        }
        if(args.length != 2){
            System.out.println("Please provide all necessary arguments - java IVJ {pathToPROJECT} {pathForOutput}");
            return;
        }
        String enteredProjectPath = args[0];
        String enteredPathForOutput = args[1];
        if (!new File(enteredProjectPath).exists())
        {
            System.out.println("Please provide a correct Project Path");
            throw new FileNotFoundException(enteredProjectPath);
        }else if (!new File(enteredProjectPath).exists()){
            System.out.println("Please provide a correct path for the output");
            throw new FileNotFoundException(enteredPathForOutput);
        }
        startIVC(enteredProjectPath, enteredPathForOutput);
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
    }

    public static HashMap<String, AbstractFamixEntity> getEntities(){
        return famixEntities;
    }
    public static HashMap<Integer, FamixAssociation> getAssociations(){
        return famixAssociations;
    }
}
