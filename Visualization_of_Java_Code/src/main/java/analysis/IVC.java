package analysis;

import spoon.reflect.CtModel;
import spoon.reflect.declaration.CtPackage;

import java.io.IOException;

public class IVC {
    public static void main(String args[]) throws IOException {
        final String PROJECT_PATH = "C:\\Users\\semme\\Documents\\IVJC\\InteractiveVisualizationOfJavaCode\\Sample_Inputcode";

        //creating a model of the project via spoon - returns ctModel
        SpoonModel spoonModel = new SpoonModel(PROJECT_PATH);
        CtModel model = spoonModel.getSpoonModel();

        //parsing the ctModel and creating two hashmaps (entities and associations of model), held by spoonToFamixClass
        SpoonToFamix spoonToFamix = new SpoonToFamix(model);
        spoonToFamix.parseAllPackages();

        //exporting both hashmaps
        ExportJSON jsonExport = new ExportJSON();
        jsonExport.exportEntitiesToFile(spoonToFamix.getFamixEntities(), "entities");
        jsonExport.exportAssociationsToFile(spoonToFamix.getFamixAssociations(), "assocs");

    }
}
