package analysis;

import model.entities.AbstractFamixEntity;
import model.entities.FamixAssociation;
import spoon.reflect.CtModel;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Scanner;

public class IVC {
    private static String PROJECT_PATH = System.getProperty("user.dir")+"\\src\\test\\resources\\IntegrationTestInputProject";

    private static HashMap<String, AbstractFamixEntity> famixEntities = new LinkedHashMap<>();

    private static HashMap<Integer, FamixAssociation> famixAssociations = new LinkedHashMap<>();

    public static void main(String args[]) throws Exception {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Please enter the full path to the Java project that should be parsed!");
        PROJECT_PATH = scanner.nextLine();
        setProjectPath(PROJECT_PATH);
        System.out.println("Thank you! System is now starting!");
        startIVC();
    }

    public static void startIVC() throws Exception {
        //creating a model of the project via spoon - returns ctModel
        SpoonModel spoonModel = new SpoonModel(PROJECT_PATH);
        CtModel model = spoonModel.getSpoonModel();

        //parsing the ctModel and creating two hashmaps (entities and associations of model), held by spoonToFamixClass
        SpoonToFamix spoonToFamix = new SpoonToFamix(model);
        spoonToFamix.parseSpoonRootPackage();//starts parsing from root package on

        //exporting both hashmaps
        ExportJSON jsonExport = new ExportJSON();
        famixEntities = spoonToFamix.getFamixEntities();
        famixAssociations = spoonToFamix.getFamixAssociations();
        jsonExport.exportEntitiesToFile(famixEntities, "entities");
        jsonExport.exportAssociationsToFile(famixAssociations, "assocs");
    }
    public static void setProjectPath(String projectPath) {
        PROJECT_PATH = projectPath;
    }
    public static HashMap<String, AbstractFamixEntity> getEntities(){
        return famixEntities;
    }
    public static HashMap<Integer, FamixAssociation> getAssociations(){
        return famixAssociations;
    }
}
