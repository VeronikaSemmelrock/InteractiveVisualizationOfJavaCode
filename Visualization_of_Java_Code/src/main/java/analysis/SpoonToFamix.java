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
    public static HashMap<Integer, AbstractFamixGeneralization> famixAssociations = new HashMap<>();
    private static int assocCounter = 0;
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
    private static void parsePackage(CtPackage p) {
        Collection<CtType> allEntities = new ArrayList<>();
        allEntities.addAll(p.getElements(new TypeFilter<>(CtClass.class))); //add all classes contained in the package
        allEntities.addAll(p.getElements(new TypeFilter<>(CtInterface.class))); //add all interfaces contained in the package
        Set<FamixClass> famixSubClasses = new HashSet<>();//famix classes and interfaces that are added to famix package

        //add famixPackage to HashMap
        FamixPackage famixPackage = new FamixPackage(p.getQualifiedName());
        famixEntities.put(famixPackage.getUniqueName(), famixPackage);

        //analysing whether a subentity is a direct child - all direct subentities are added to parent package as a list, and parsed on their own
        for(CtType e : allEntities){
            if(e.getParent().equals(p)){
                FamixClass famixClass = new FamixClass(e.getQualifiedName(), famixPackage);
                famixEntities.put(famixClass.getUniqueName(), famixClass);
                famixSubClasses.add(famixClass);

                //parse all encountered direct subclasses and subinterfaces as a famix class
                parseAsClass(famixClass, e);
            }
        }

        //set list of subentities in famix package
        famixPackage.setClasses(famixSubClasses);

        //analysing and parsing all subpackages
        for (CtPackage sp : p.getPackages()) {
            parsePackage(sp);
        }

        //after packages are done analysis and parsing of generalisations - because then all famix classes have been created and two famix classes can be put into a relationship
        for(FamixClass fClass : generalisations){//TODO -- there are still mistakes in this sourcecode - duplicate entries
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

    private static void addToHashAssociations(AbstractFamixGeneralization f){
        famixAssociations.put(assocCounter, f);
        assocCounter++;
    }

    //parse class with all its methods and attributes -> methods and attributes are then parsed on their own
    private static void parseAsClass(FamixClass famixClass, CtType entity){
        //TODO set inner classes of class? has to be set, how can it be checked through Ct??? - maybe ct getNestedTypes() ?
        //TODO - FamixClass can also be an anonymous class -> what is that? - ct isAnonymous() in CtType -- see method dort werden sie gesetzt


        if(entity.getSuperclass() != null || entity.getSuperInterfaces().size() > 0){//has superclass or implements interfaces
            //add CtClass and corresponding famixClass to list of classes that need to be parsed for generalization later, after all classes were parsed
            generalisations.add(famixClass);
        }


        Set<FamixMethod> famixMethods = new HashSet<>();
        Set<FamixAttribute> famixAttributes = new HashSet<>();

        //adding a list of corresponding famix Methods to class, then parsing famix methods on their own
        for(Object m : entity.getMethods()){
            CtMethod ctMethod = (CtMethod) m; //necessary cast
            FamixMethod famixMethod = new FamixMethod(ctMethod.getSimpleName(), famixClass); //name, famixClass as parent
            famixEntities.put(famixMethod.getUniqueName(), famixMethod);
            parseMethod(famixMethod, ctMethod);
            famixMethods.add(famixMethod);
        }

        //adding all methods to famix class
        famixClass.setMethods(famixMethods);

        //adding a list of corresponding famix attributes to class, then parsing famix attributes on their own
        for(Object f : entity.getFields()){
            CtField ctField = (CtField) f; //necessary cast
            FamixAttribute famixField = new FamixAttribute(ctField.getSimpleName(), famixClass); //name, famixClass as parent
            famixEntities.put(famixField.getUniqueName(), famixField);
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