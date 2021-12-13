package analysis;

import com.google.gson.GsonBuilder;
import model.entities.*;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;


public class exportJSON {
    private static HashMap<String, AbstractFamixEntity> famixEntities;
    private static HashMap<Integer, AbstractFamixGeneralization> famixAssociations;
    private static String ENTITES_FILENAME = "entities";
    private static String ASSOCS_FILENAME = "assocs";

    public exportJSON(HashMap<String, AbstractFamixEntity> famixEntities, HashMap<Integer, AbstractFamixGeneralization> famixAssociations) {
        this.famixEntities = famixEntities;
        this.famixAssociations = famixAssociations;
    }

    public static void exportToFile() throws IOException {
        serializeEntities();
        serializeAssocs();
    }

    private static void serializeEntities() throws IOException {
        //String JSONObject = new GsonBuilder().create().toJson(famixEntities);
        Writer writer = new FileWriter(ENTITES_FILENAME+".json");
        new GsonBuilder().setPrettyPrinting().create().toJson(famixEntities, writer);
        writer.close();
    }
    private static void serializeAssocs() throws IOException {
        Writer writer = new FileWriter(ASSOCS_FILENAME+".json");
        new GsonBuilder().setPrettyPrinting().create().toJson(famixAssociations, writer);
        writer.close();
    }
}

