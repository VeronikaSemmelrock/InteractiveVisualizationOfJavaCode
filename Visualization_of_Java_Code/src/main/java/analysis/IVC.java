package analysis;

import spoon.reflect.CtModel;
import spoon.reflect.declaration.CtPackage;

import java.io.IOException;

public class IVC {
    private static String PROJECT_PATH = "C:\\Users\\semme\\Documents\\IVJC\\InteractiveVisualizationOfJavaCode\\Sample_Inputcode";


    public static void main(String args[]) throws Exception {
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
        jsonExport.exportEntitiesToFile(spoonToFamix.getFamixEntities(), "entities");
        jsonExport.exportAssociationsToFile(spoonToFamix.getFamixAssociations(), "assocs");
    }
    public static void setProjectPath(String projectPath) {
        PROJECT_PATH = projectPath;
    }
}
