package analysis;

import model.entities.*;
import spoon.Launcher;
import spoon.reflect.CtModel;
import spoon.reflect.declaration.*;

import java.util.*;

import spoon.reflect.reference.CtTypeReference;
import spoon.reflect.visitor.filter.TypeFilter;

import java.util.Collection;

public class SpoonToFamix {
    private static String PROJECT_PATH = "Z:/SourceCode/InteractiveVisualizationOfJavaCode/Sample_Inputcode";
    private static CtModel spoonModel;
    public static HashMap<Integer, AbstractFamixObject> famixEntities = new HashMap<>();
    public static int entitiesCounter = 0;
    public static HashMap<Integer, AbstractFamixObject> famixAssociations = new HashMap<>();
    public static int associationsCounter = 0;
    public static CtPackage rootPackage;
    public static ArrayList<FamixClass> generalisations = new ArrayList<>();


    public static void main(String args[]) {
        //creating SpoonParser model
        Launcher launcher = new Launcher();
        launcher.addInputResource(PROJECT_PATH);
        launcher.buildModel();
        spoonModel = launcher.getModel();
        rootPackage = spoonModel.getRootPackage();

        //parse all packages, subpackages and subclasses/subinterfaces
        for(CtPackage p : rootPackage.getPackages()){
            parsePackage(p);
        }
        System.out.println("test");
    }


    //analyses a package, its subpackages and direct subclasses
    private static void parsePackage(CtPackage p) {//TODO - setting IDs of elements? AbstractFamixEntity gives option of setting id
        Collection<CtType> allEntities = new ArrayList<>();
        allEntities.addAll(p.getElements(new TypeFilter<>(CtClass.class))); //add all classes contained in the package
        allEntities.addAll(p.getElements(new TypeFilter<>(CtInterface.class))); //add all interfaces contained in the package
        Set<FamixClass> famixSubClasses = new HashSet<>();//famix classes and interfaces that are added to famix package

        //add famixPackage to HashMap
        FamixPackage famixPackage = new FamixPackage(p.getQualifiedName());
        addToHashEntities(famixPackage);

        //analysing whether a subentity is a direct child - all direct subentities are added to parent package as a list, and parsed on their own
        for(CtType e : allEntities){
            if(e.getParent().equals(p)){
                FamixClass famixClass = new FamixClass(e.getQualifiedName(), famixPackage);
                addToHashEntities(famixClass);
                famixSubClasses.add(famixClass);

                //parse all encountered direct subclasses and subinterfaces as a famix class
                parseAsClass(famixClass, e);
            }
        }

        //set list of subentities in famix package
        famixPackage.setClasses(famixSubClasses);
        //TODO - famix package could get modifiers set, but there are no modifiers in CtPackage

        //analysing and parsing all subpackages
        for (CtPackage sp : p.getPackages()) {
            parsePackage(sp);
        }

        //after packages are done analysis and parsing of generalisations
        for(FamixClass fc : generalisations){
            //TODO
            //TODO - extract extends and implements relationships!!
            //CtTypeReference<?> superclass = entity.getSuperclass();
            //Set<CtTypeReference<?>> interfaces = entity.getSuperInterfaces();
        }
    }

    //mistakes are less likely, less duplicate code
    private static void addToHashEntities(AbstractFamixObject entity) {
        famixEntities.put(entitiesCounter, entity);
        entitiesCounter++;
    }

    //parse class with all its methods and attributes -> methods and attributes are then parsed on their own
    private static void parseAsClass(FamixClass famixClass, CtType entity){
        //TODO set inner classes of class? has to be set, how can it be checked through Ct??? - maybe ct getNestedTypes() ?
        //TODO - FamixClass can also be an anonymous class -> what is that? - ct isAnonymous() in CtType


        if(entity.getSuperclass() != null || entity.getSuperInterfaces().size() > 0){//has superclass or implements interfaces
            //add famixClass to list of classes that need to be parsed for generalization later, after all classes were parsed
            generalisations.add(famixClass);
        }


        Set<FamixMethod> famixMethods = new HashSet<>();
        Set<FamixAttribute> famixAttributes = new HashSet<>();

        //adding a list of corresponding famix Methods to class, then parsing famix methods on their own
        for(Object m : entity.getMethods()){
            CtMethod ctMethod = (CtMethod) m; //necessary cast
            FamixMethod famixMethod = new FamixMethod(ctMethod.getSimpleName(), famixClass); //name, famixClass as parent
            addToHashEntities(famixMethod);
            parseMethod(famixMethod, ctMethod);
            famixMethods.add(famixMethod);
        }

        //adding all methods to famix class
        famixClass.setMethods(famixMethods);

        //adding a list of corresponding famix attributes to class, then parsing famix attributes on their own
        for(Object f : entity.getFields()){
            CtField ctField = (CtField) f; //necessary cast
            FamixAttribute famixField = new FamixAttribute(ctField.getSimpleName(), famixClass); //name, famixClass as parent
            addToHashEntities(famixField);
            parseAttribute(famixField, ctField);
            famixAttributes.add(famixField);
        }

        //adding all attributes to famix class
        famixClass.setAttributes(famixAttributes);//is attribute and field the same thing? is there more to be added ? TODO
        setModifiers(famixClass, entity);
    }

    private static void setModifiers(AbstractFamixEntity famixEntity, CtType ctEntity) {
        int famixModifier = 0;
        for(ModifierKind modifier : ctEntity.getModifiers()) {
            if(modifier.toString().equals("public")) {
                famixModifier += AbstractFamixEntity.MODIFIER_PUBLIC;
            }else if(modifier.toString().equals("private")) {
                famixModifier += AbstractFamixEntity.MODIFIER_PRIVATE;
            }else if(modifier.toString().equals("protected")) {
                famixModifier += AbstractFamixEntity.MODIFIER_PROTECTED;
            }else if(modifier.toString().equals("static")) {
                famixModifier += AbstractFamixEntity.MODIFIER_STATIC;
            }else if(modifier.toString().equals("final")) {
                famixModifier += AbstractFamixEntity.MODIFIER_FINAL;
            }else if(modifier.toString().equals("abstract")) {
                famixModifier += AbstractFamixEntity.MODIFIER_ABSTRACT;
            }
        }
        if(ctEntity.isInterface()){
            famixModifier += AbstractFamixEntity.MODIFIER_INTERFACE;
        }else if(ctEntity.isEnum()) {
            famixModifier += AbstractFamixEntity.MODIFIER_ENUM;
        }

        famixEntity.setModifiers(famixModifier);
    }

    private static void parseAttribute(FamixAttribute famixField, CtField ctField) {
        //TODO parses a famix attribute with its ct counterpart
    }

    private static void parseMethod(FamixMethod famixMethod, CtMethod ctMethod) {
        //TODO parses a famix Method with its ct counterpart
    }
}