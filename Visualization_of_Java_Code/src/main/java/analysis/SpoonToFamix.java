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
    public static HashMap<String, AbstractFamixObject> famixEntities = new HashMap<>();
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
        parseAllEncounteredGeneralisations();
    }

    //analyses a package, its subpackages and direct subclasses
    private static void parsePackage(CtPackage ctPackage) {
        FamixPackage famixPackage = new FamixPackage(ctPackage.getQualifiedName());
        famixEntities.put(famixPackage.getUniqueName(), famixPackage);

        Set<FamixClass> famixSubClasses = parseAllDirectSubclasses(ctPackage, famixPackage);
        famixPackage.setClasses(famixSubClasses);
        parseAllSubpackages(ctPackage);
    }


    private static void parseAllSubpackages(CtPackage ctPackage){
        for (CtPackage p : ctPackage.getPackages()) {
            parsePackage(p);
        }
    }
    private static Set<FamixClass> parseAllDirectSubclasses(CtPackage ctPackage, AbstractFamixEntity famixParent) {
        Set<FamixClass> famixSubClasses = new HashSet<>();

        Collection<CtType> allEntities = new ArrayList<>();
        allEntities.addAll(ctPackage.getElements(new TypeFilter<>(CtClass.class))); //add all classes contained in the package
        allEntities.addAll(ctPackage.getElements(new TypeFilter<>(CtInterface.class))); //add all interfaces contained in the package

        for(CtType entity : allEntities){
            if(isParent(entity, ctPackage)){
                famixSubClasses.add(parseAsClass(entity, famixParent));
            }
        }
        return famixSubClasses;
    }

    private static boolean isParent(CtType entity, CtElement ctParent) {
        return entity.getParent().equals(ctParent);
    }

    private static void addToHashAssociations(AbstractFamixGeneralization f){
        famixAssociations.put(assocCounter, f);
        assocCounter++;
    }

    private static boolean hasGeneralisation(CtType entity) {
        return entity.getSuperclass() != null || entity.getSuperInterfaces().size() > 0;
    }

    //parse class with all its methods and attributes -> methods and attributes are then parsed on their own
    private static FamixClass parseAsClass(CtType ctEntity, AbstractFamixEntity famixParent){
        FamixClass famixClass = new FamixClass(ctEntity.getQualifiedName(), famixParent);
        famixEntities.put(famixClass.getUniqueName(), famixClass);

        if(hasGeneralisation(ctEntity)){
            generalisationsToParse.add(famixClass);
        }
        famixClass.setMethods(parseAllMethods(ctEntity, famixClass));
        famixClass.setAttributes(parseAllAttributes(ctEntity, famixClass));//is attribute and field the same thing? is there more to be added ? TODO
        setModifiers(famixClass, ctEntity);
        famixClass.setInnerClasses(parseAllNestedClasses(ctEntity, famixClass));
        return famixClass;
    }

    private static Set<FamixClass> parseAllNestedClasses(CtType ctEntity, AbstractFamixEntity famixParentClass) {
        Set<FamixClass> nestedClasses = new HashSet<>();

        for(Object c : ctEntity.getNestedTypes()){
            if(c instanceof CtClass){
                CtClass ctClass = (CtClass) c; //necessary cast
                nestedClasses.add(parseAsClass(ctClass, famixParentClass));
            }
        }
        return nestedClasses;
    }

    private static Set<FamixMethod> parseAllMethods(CtType ctEntity, FamixClass famixClass) {
        Set<FamixMethod> famixMethods = new HashSet<>();

        for(Object m : ctEntity.getMethods()){
            CtMethod ctMethod = (CtMethod) m; //necessary cast
            famixMethods.add(parseMethod(ctMethod, famixClass));
        }
        return famixMethods;
    }
    private static FamixMethod parseMethod(CtMethod ctMethod, AbstractFamixEntity famixParent) {
        //TODO -- parse the method
        FamixMethod famixMethod = new FamixMethod(ctMethod.getReference().getDeclaringType().getQualifiedName()+"-"+ctMethod.getSimpleName(), famixParent);//proper unique Name
        famixEntities.put(famixMethod.getUniqueName(), famixMethod);

        famixMethod.setAnonymClasses(parseAllAnonymousClasses(ctMethod, famixMethod));
        return famixMethod;
    }

    private static Set<FamixClass> parseAllAnonymousClasses(CtMethod ctMethod, FamixMethod famixMethod) {
        Set<FamixClass> anonymClasses = new HashSet<>();
        for (CtClass ctClass : ctMethod.getElements(new TypeFilter<>(CtClass.class))){
            anonymClasses.add(parseAsClass(ctClass,famixMethod));
        }
        return anonymClasses;
    }

    private static Set<FamixAttribute> parseAllAttributes(CtType ctEntity, AbstractFamixEntity famixEntity) {
        //TODO - check, whether uniqueName of attribute inside a method fits for hashmap (because unique name of method was created manually,
        //should be created manually and added here too, with attribute unique name at the end)
        Set<FamixAttribute> famixAttributes = new HashSet<>();
        for(Object f : ctEntity.getFields()){
            CtField ctField = (CtField) f;
            famixAttributes.add(parseAttribute(ctField, famixEntity));
        }
        return famixAttributes;
    }

    private static FamixAttribute parseAttribute(CtField ctField, AbstractFamixEntity famixParent) {
        //TODO -- parse the attribute
        FamixAttribute famixField = new FamixAttribute(ctField.getReference().getQualifiedName(), famixParent); //proper unique Name
        famixEntities.put(famixField.getUniqueName(), famixField);
        return famixField;
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


    private static void parseAllEncounteredGeneralisations() {
        //TODO - refactor after errors are gone - errors = duplicate entries
        //after packages are done analysis and parsing of generalisations - because then all famix classes have been created and two famix classes can be put into a relationship
        for(FamixClass fClass : generalisationsToParse){
            FamixInheritance finh = null; //represents extends
            FamixSubtyping fsub = null; //represents implements
            FamixClass fAssoc = null;
            List matchingClasses = rootPackage.filterChildren(new AbstractFilter<CtClass>(CtClass.class) {
                @Override
                public boolean matches(CtClass ctc){
                    return ctc.getQualifiedName().equals(fClass.getUniqueName()); //filter only matches one specific class
                }
            }).list();
            if(matchingClasses.size() == 1){
                CtClass classMatch = (CtClass) matchingClasses.get(0);
                System.out.println("Classmatch: "+classMatch.getQualifiedName());
                CtTypeReference superclass = classMatch.getSuperclass();
                System.out.println("Superclass: "+superclass.getQualifiedName());
                Set<CtTypeReference<?>> interfaces = classMatch.getSuperInterfaces();
                if(superclass != null){
                    System.out.println("Superclass was not null. ");
                    fAssoc = (FamixClass) famixEntities.get(superclass.getQualifiedName());
                    if(fAssoc != null){ //could be null if class was not parsed by spoon (like class Thread, Enum ...)
                        System.out.println("Matching Superclass in Spoon was found ");
                        finh = new FamixInheritance(fClass, fAssoc);
                    }else{
                        System.out.println("Matching Superclass in Spoon was not found - like Thread etc ");
                        finh = new FamixInheritance(fClass, new FamixClass(superclass.getQualifiedName()));
                    }
                    addToHashAssociations(finh);
                }
                if(interfaces.size()>0){
                    System.out.println("There is an interface to parse");
                    for(CtTypeReference i : interfaces){
                        System.out.println("Interface: "+i.getQualifiedName());
                        fAssoc = (FamixClass) famixEntities.get(i.getQualifiedName());
                        if(fAssoc != null){
                            fsub = new FamixSubtyping(fClass, fAssoc);
                        }else{//could be like "implements JavaCompiler" -> Spoonparser did not parse this class
                            fsub = new FamixSubtyping(fClass, new FamixClass(i.getQualifiedName()));
                        }

                        addToHashAssociations(fsub);
                    }
                }

            }
        }
    }
}