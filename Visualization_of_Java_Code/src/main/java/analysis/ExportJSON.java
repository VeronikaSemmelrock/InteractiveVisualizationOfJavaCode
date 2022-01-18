package analysis;

import com.google.gson.GsonBuilder;
import model.entities.*;

import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;


public class ExportJSON {
    private Writer writer;

    /**
     * Exports a famixEntities-Hashmap to a .json-File named {filename}.json
     *
     * @param famixEntities - the famixEntities Hashmap
     * @param filename - the filename with which the file will be saved
     * @throws IOException
     */
    public void exportEntitiesToFile(HashMap<String, AbstractFamixEntity> famixEntities, String filename) throws IOException {
        writer = new FileWriter(filename+".json");
        new GsonBuilder().setPrettyPrinting().create().toJson(famixEntities, writer);
        writer.close();
    }

    /**
     * Exports a famixAssociations-Hashmap to a .json-File named {filename}.json
     *
     * @param famixAssociations - the famixEntities Hashmap
     * @param filename - the filename with which the file will be saved
     * @throws IOException
     */
    public void exportAssociationsToFile(HashMap<Integer, AbstractFamixGeneralization> famixAssociations, String filename) throws IOException {
        writer = new FileWriter(filename+".json");
        new GsonBuilder().setPrettyPrinting().create().toJson(famixAssociations, writer);
        writer.close();
    }
}

