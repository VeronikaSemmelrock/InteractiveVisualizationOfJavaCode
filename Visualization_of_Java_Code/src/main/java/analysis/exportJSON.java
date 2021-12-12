package analysis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import model.entities.AbstractFamixGeneralization;
import model.entities.AbstractFamixObject;
import org.json.JSONObject;

import java.lang.reflect.Array;
import java.util.HashMap;
import java.util.Map;


public class exportJSON {
    public static HashMap<String, AbstractFamixObject> famixEntities;
    public static HashMap<Integer, AbstractFamixGeneralization> famixAssociations;

    public exportJSON(HashMap<String, AbstractFamixObject> famixEntities, HashMap<Integer, AbstractFamixGeneralization> famixAssociations) {
        this.famixEntities = famixEntities;
        this.famixAssociations = famixAssociations;
    }

    public static void exportToFile(String pathToFile){

        log("Raw Map ===> " + famixEntities);

        // Use this builder to construct a Gson instance when you need to set configuration options other than the default.
        GsonBuilder gsonMapBuilder = new GsonBuilder();

        Gson gsonObject = gsonMapBuilder.create();

        //String JSONObject = gsonObject.toJson(famixEntities);
        //log("\nMethod-1: Using Google GSON ==> " + JSONObject);

        //Gson prettyGson = new GsonBuilder().setPrettyPrinting().create();
        //String prettyJson = prettyGson.toJson(famixEntities);

        //log("\nPretty JSONObject ==> " + prettyJson);

        // Construct a JSONObject from a Map.
        //JSONObject crunchifyObject = new JSONObject(famixEntities);
        //log("\nMethod-2: Using new JSONObject() ==> " + crunchifyObject);

        /*
        try {
        
            // Default constructor, which will construct the default JsonFactory as necessary, use SerializerProvider as its
            // SerializerProvider, and BeanSerializerFactory as its SerializerFactory.
            String objectMapper = new ObjectMapper().writeValueAsString(famixEntities);
            log("\nMethod-3: Using ObjectMapper().writeValueAsString() ==> " + objectMapper);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
         */
    }

    private static void log(Object print) {
        System.out.println(print);

    }
}

