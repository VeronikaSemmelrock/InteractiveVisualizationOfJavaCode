package analysis;

import model.entities.*;
import spoon.Launcher;
import spoon.reflect.CtModel;
import spoon.reflect.declaration.*;

import java.util.*;

import spoon.reflect.reference.CtTypeReference;
import spoon.reflect.visitor.filter.AbstractFilter;
import spoon.reflect.visitor.filter.TypeFilter;

import java.util.Collection;

public class SpoonToFamix {
    private static String PROJECT_PATH = "C:\\Users\\Veronika\\Documents\\IVJC\\InteractiveVisualizationOfJavaCode\\Sample_Inputcode";
    private static CtModel spoonModel;
    public static HashMap<Integer, AbstractFamixObject> famixEntities = new HashMap<>();
    public static int entitiesCounter=0;
    public static HashMap<Integer, AbstractFamixGeneralization> famixAssociations = new HashMap<>();
    private static int assocCounter = 0;
    public static CtPackage rootPackage;
    public static ArrayList<FamixClass> generalisationsToParse = new ArrayList<>();


    public static void main(String args[]) {
        createSpoonModel();
        parseAllPackages();//recursive call

        System.out.println("test");
    }

    private static void createSpoonModel() {
        Launcher launcher = new Launcher();
        launcher.addInputResource(PROJECT_PATH);
        launcher.buildModel();
        spoonModel = launcher.getModel();
        rootPackage = spoonModel.getRootPackage();
    }

    //parse all packages, subpackages and subclasses/subinterfaces
    private static void parseAllPackages() {
        for(CtPackage p : rootPackage.getPackages()){
            parsePackage(p);
        }
    }

    //analyses a package, its subpackages and direct subclasses
    private static void parsePackage(CtPackage ctPackage) {
        FamixPackage famixPackage = new FamixPackage(ctPackage.getQualifiedName());
        addToHashEntities(famixPackage);
        //famixEntities.put(famixPackage.getUniqueName(), famixPackage);

        Set<FamixClass> famixSubClasses = parseAllDirectSubclasses(ctPackage, famixPackage);
        famixPackage.setClasses(famixSubClasses);
        parseAllSubpackages(ctPackage);
        parseAllEncounteredGeneralisations();
    }


    private static void parseAllSubpackages(CtPackage ctPackage){
        for (CtPackage p : ctPackage.getPackages()) {
            parsePackage(p);
        }
    }
    private static Set<FamixClass> parseAllDirectSubclasses(CtPackage ctPackage, FamixPackage famixPackage) {
        Set<FamixClass> famixSubClasses = new HashSet<>();

        Collection<CtType> allEntities = new ArrayList<>();
        allEntities.addAll(ctPackage.getElements(new TypeFilter<>(CtClass.class))); //add all classes contained in the package
        allEntities.addAll(ctPackage.getElements(new TypeFilter<>(CtInterface.class))); //add all interfaces contained in the package

        for(CtType entity : allEntities){
            if(isParent(entity, ctPackage)){
                FamixClass famixClass = new FamixClass(entity.getQualifiedName(), famixPackage);
                addToHashEntities(famixClass);
                //famixEntities.put(famixClass.getUniqueName(), famixClass);
                famixSubClasses.add(famixClass);
                //parse all encountered direct subclasses and subinterfaces as a famix class
                parseAsClass(famixClass, entity);
            }
        }
        return famixSubClasses;
    }

    private static boolean isParent(CtType entity, CtElement ctParent) {
        return entity.getParent().equals(ctParent);
    }

    private static void addToHashEntities(AbstractFamixObject f){
        famixEntities.put(entitiesCounter, f);
        entitiesCounter++;
    }

    private static void addToHashAssociations(AbstractFamixGeneralization f){
        famixAssociations.put(assocCounter, f);
        assocCounter++;
    }

    //parse class with all its methods and attributes -> methods and attributes are then parsed on their own
    private static void parseAsClass(FamixClass famixClass, CtType entity){
        //TODO set inner classes of class? has to be set, how can it be checked through Ct??? - maybe ct getNestedTypes() ?
        //TODO - FamixClass can also be an anonymous class -> what is that? - ct isAnonymous() in CtType -- see method dort werden sie gesetzt

        if(hasGeneralisation(entity)){
            generalisationsToParse.add(famixClass);
        }
        famixClass.setMethods(parseAllMethods(famixClass, entity));
        famixClass.setAttributes(parseAllAttributes(famixClass, entity));//is attribute and field the same thing? is there more to be added ? TODO
        setModifiers(famixClass, entity);
    }

    private static Set<FamixAttribute> parseAllAttributes(FamixClass famixClass, CtType entity) {
        Set<FamixAttribute> famixAttributes = new HashSet<>();
        //adding a list of corresponding famix attributes to class, then parsing famix attributes on their own
        for(Object f : entity.getFields()){
            CtField ctField = (CtField) f; //necessary cast
            FamixAttribute famixField = new FamixAttribute(ctField.getSimpleName(), famixClass); //name, famixClass as parent
            addToHashEntities(famixField);
            //famixEntities.put(famixField.getUniqueName(), famixField);
            parseAttribute(famixField, ctField);
            famixAttributes.add(famixField);
        }
        return famixAttributes;
    }

    private static Set<FamixMethod> parseAllMethods(FamixClass famixClass, CtType entity) {
        Set<FamixMethod> famixMethods = new HashSet<>();

        //adding a list of corresponding famix Methods to class, then parsing famix methods on their own
        for(Object m : entity.getMethods()){
            CtMethod ctMethod = (CtMethod) m; //necessary cast
            FamixMethod famixMethod = new FamixMethod(ctMethod.getSimpleName(), famixClass); //name, famixClass as parent
            addToHashEntities(famixMethod);
            //famixEntities.put(famixMethod.getUniqueName(), famixMethod);
            parseMethod(famixMethod, ctMethod);
            famixMethods.add(famixMethod);
        }
        return famixMethods;
    }

    private static boolean hasGeneralisation(CtType entity) {
        return entity.getSuperclass() != null || entity.getSuperInterfaces().size() > 0;
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

    private static void parseAllEncounteredGeneralisations() {
        //after packages are done analysis and parsing of generalisations - because then all famix classes have been created and two famix classes can be put into a relationship
        for(FamixClass fClass : generalisationsToParse){//TODO -- there are still mistakes in this sourcecode - duplicate entries
            FamixInheritance finh = null;
            FamixSubtyping fsub = null;
            FamixClass fAssoc = null;
            List matchingClasses = rootPackage.filterChildren(new AbstractFilter<CtClass>(CtClass.class) {
                @Override
                public boolean matches(CtClass ctc){
                    return ctc.getQualifiedName().equals(fClass.getUniqueName()); //filter only matches one specific class
                }
            }).list();
            if(matchingClasses.size() == 1){
                CtClass classMatch = (CtClass) matchingClasses.get(0);
                CtTypeReference superclass = classMatch.getSuperclass();
                Set<CtTypeReference<?>> interfaces = classMatch.getSuperInterfaces();
                if(superclass != null){
                    fAssoc = (FamixClass) famixEntities.get(superclass.getQualifiedName());
                    if(fAssoc != null){
                        finh = new FamixInheritance(fClass, fAssoc);
                    }else{//could also extend Thread etc that are not in HashEntities, because it was not parsed by spoonparser
                        finh = new FamixInheritance(fClass, new FamixClass(superclass.getQualifiedName()));
                    }
                    addToHashAssociations(finh);
                }
                if(interfaces.size()>0){
                    for(CtTypeReference i : interfaces){
                        fAssoc = (FamixClass) famixEntities.get(superclass.getQualifiedName());
                        fsub = new FamixSubtyping(fClass, fAssoc);
                        addToHashAssociations(fsub);
                    }
                }

            }
        }
    }
}