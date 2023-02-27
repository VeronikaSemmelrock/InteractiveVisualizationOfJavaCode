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
     * Exports a famixEntities-Hashmap to a .json-File named {filename}.json in path filepath
     *
     * @param famixEntities - the famixEntities Hashmap
     * @param filepath - the path where the file will be put
     * @param filename - the filename with which the file will be saved
     * @throws IOException
     */
    public void exportEntitiesToFile(HashMap<String, AbstractFamixEntity> famixEntities, String filepath, String filename) throws IOException {
        writer = new FileWriter(filepath+"\\"+filename+".json");
        new GsonBuilder().setPrettyPrinting().create().toJson(famixEntities, writer);
        writer.close();
    }

    /**
     * Exports a famixAssociations-Hashmap to a .json-File named {filename}.json in path filepath
     *
     * @param famixAssociations - the famixEntities Hashmap
     * @param filepath - the path where the file will be put
     * @param filename - the filename with which the file will be saved
     * @throws IOException
     */
    public void exportAssociationsToFile(HashMap<Integer, FamixAssociation> famixAssociations, String filepath, String filename) throws IOException {
        writer = new FileWriter(filepath+"\\"+filename+".json");
        new GsonBuilder().setPrettyPrinting().create().toJson(famixAssociations, writer);
        writer.close();
    }
}

