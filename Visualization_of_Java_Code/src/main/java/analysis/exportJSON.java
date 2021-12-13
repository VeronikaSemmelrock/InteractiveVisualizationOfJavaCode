package analysis;

import com.google.gson.GsonBuilder;
import model.entities.*;

import java.util.HashMap;


public class exportJSON {
    private static HashMap<String, AbstractFamixEntity> famixEntities;
    private static HashMap<Integer, AbstractFamixGeneralization> famixAssociations;

    private static String entitiesString;
    private static String assocString;

    public exportJSON(HashMap<String, AbstractFamixEntity> famixEntities, HashMap<Integer, AbstractFamixGeneralization> famixAssociations) {
        this.famixEntities = famixEntities;
        this.famixAssociations = famixAssociations;
    }

    public static void exportToFile(String pathToFile){
        entitiesString = serializeEntities();
        //assocString = serializeAssocs();
        writeToFile(pathToFile);
    }

    private static void writeToFile(String pathToFile) {

    }

    private static String serializeEntities() {
        //String JSONObject = new GsonBuilder().create().toJson(famixEntities);
        return new GsonBuilder().setPrettyPrinting().create().toJson(famixEntities);
    }
    private static String serializeAssocs() {
        return new GsonBuilder().setPrettyPrinting().create().toJson(famixAssociations);

    }
}

