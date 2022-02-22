package analysis;

import model.entities.*;
import spoon.Launcher;
import spoon.reflect.CtModel;
import spoon.reflect.declaration.*;

import java.io.IOException;
import java.lang.reflect.Array;
import java.util.*;

import spoon.reflect.reference.CtTypeReference;
import spoon.reflect.visitor.filter.AbstractFilter;
import spoon.reflect.visitor.filter.TypeFilter;

import java.util.Collection;

public class SpoonToFamix {
    /**
     * The CtModel that is parsed to create hashmaps of Famix Objects
     */
    private CtModel spoonModel;

    /**
     * HashMap that holds all parsed Famix Entities
     */
    private HashMap<String, AbstractFamixEntity> famixEntities = new LinkedHashMap<>();

    /**
     * HashMap that holds all parsed Famix Associations
     */
    private HashMap<Integer, AbstractFamixGeneralization> famixAssociations = new LinkedHashMap<>();
    /**
     * Counter for IDs in famixAssociations-hashMap
     */
    private int assocCounter = 0;
    /**
     * root package in ctModel. Source from where parsing starts.
     * The spoonRootPackage itself is not parsed into a famix object as it is a package added by spoonParser
     */
    private CtPackage spoonRootPackage;
    /**
     * Hashmap to temporarily hold all encountered entities with associations that need to be parsed
     */
    private ArrayList<FamixClass> generalisationsToParse = new ArrayList<>();


    /**
     * Constructor. Sets spoonModel and spoonRootPackage. The spoonRootPackage is a package created and added by SpoonParser at the root
     * @param model - the SpoonParser ctModel that needs to be parsed into hashmaps of famix objects
     */
    public SpoonToFamix(CtModel model){
        this.spoonModel = model;
        this.spoonRootPackage = spoonModel.getRootPackage();
    }

    /**
     * Starts parsing of all entities
     * Afterwards, starts parsing of all encountered associations
     */
    public void parseSpoonRootPackage() {
        for(CtPackage p : spoonRootPackage.getPackages()){
            parseRootPackage(p);
        }
        parseAllEncounteredGeneralisations();
    }

    /**
     * Parses a root package and starts parsing of all its subpackages and subclasses
     * A root package does not have a parent package - so no parent needs to be set
     * @param ctPackage - the package that needs to be parsed
     */
    private void parseRootPackage(CtPackage ctPackage) {
        //parsing of root package
        FamixPackage famixPackage = new FamixPackage(ctPackage.getQualifiedName());
        famixPackage.setType("package");
        famixEntities.put(famixPackage.getUniqueName(), famixPackage);

        //parsing of root package and call to start parsing all direct subclasses and subpackages
        famixPackage.setClasses(parseAllDirectSubclasses(ctPackage, famixPackage));
        parseAllSubpackages(ctPackage, famixPackage);
    }


    /**
     * Starts parsing of all direct subpackages of a package
     * @param ctPackage - the package of which the subpackages need to be parsed
     * @param famixParent - the parent package as a famix object for easy setting of parent
     */
    private void parseAllSubpackages(CtPackage ctPackage, FamixPackage famixParent){
        for (CtPackage p : ctPackage.getPackages()) {//.getPackages() only returns DIRECT subpackages
            parseSubPackage(p, famixParent);
        }
    }

    /**
     * Parses a subpackage and starts parsing of all its direct subpackages and subclasses
     * A subpackage has a parent package - so parent needs to be set
     * @param ctPackage - the package that needs to be parsed
     * @param famixParent - the parent package as a famix object for easy setting of parent
     */
    private void parseSubPackage(CtPackage ctPackage, FamixPackage famixParent) {
        //parsing of subpackage
        FamixPackage famixPackage = new FamixPackage(ctPackage.getQualifiedName(), famixParent);
        famixPackage.setParentString(famixParent.getUniqueName());
        famixPackage.setType("package");
        famixEntities.put(famixPackage.getUniqueName(), famixPackage);

        //parsing of subpackage and call to start parsing all direct subclasses and subpackages
        famixPackage.setClasses(parseAllDirectSubclasses(ctPackage, famixPackage));
        parseAllSubpackages(ctPackage, famixPackage);
    }



    /**
     * Starts parsing of all direct subclasses (subentities - classes, abstract classes and interfaces) of a package and returns the parsed famix objects as a list
     * @param ctPackage - the package of which the direct subclasses need to be parsed
     * @param famixParent - the ctPackage as a famixObject, so famixObject can easily be set as parent of all parsed direct subclasses
     * @return the parsed subclasses, so they can be set as list of subclasses in parent famixObject
     */
    private Set<FamixClass> parseAllDirectSubclasses(CtPackage ctPackage, AbstractFamixEntity famixParent) {
        Set<FamixClass> famixSubClasses = new HashSet<>();
        Collection<CtType> allEntities = new ArrayList<>();
        allEntities.addAll(ctPackage.getElements(new TypeFilter<>(CtClass.class))); //add all subclasses (including abstract classes) of the package
        allEntities.addAll(ctPackage.getElements(new TypeFilter<>(CtInterface.class))); //add all subinterfaces of the package

        //call parsing of every encountered subentity
        for(CtType entity : allEntities){
            if(isParent(entity, ctPackage)){//parse only DIRECT subentites
                famixSubClasses.add(parseAsClass(entity, famixParent));
            }
        }
        return famixSubClasses;
    }

    /**
     * Checks whether a given Spoonparser entity has another given Spoonparser entity (ctParent) as its parent in the Spoonparser CtModel
     * @param entity - the entity for which the parent is checked
     * @param ctParent - the supposed parent of the entity
     * @return boolean, whether ctParent is parent of entity in ctModel
     */
    private boolean isParent(CtType entity, CtElement ctParent) {
        return entity.getParent().equals(ctParent);
    }

    /**
     * Adds a famix generalisation to the famixAssociations-Hashmap and updates the ID-counter
     * @param f - the famix generalisation that should be added to the hashmap
     */
    private void addToHashAssociations(AbstractFamixGeneralization f){
        famixAssociations.put(assocCounter, f);
        assocCounter++;
    }

    /**
     * Checks whether a given entity has an implements- or extends-relationship to another entity in the ctModel
     * @param entity - the entity whose relationships are checked
     * @return boolean, whether the entity has some type of relationship to another entity
     */
    private boolean hasGeneralisation(CtType entity) {
        return entity.getSuperclass() != null || entity.getSuperInterfaces().size() > 0;
    }

    /**
     * Parses a class, (abstract class) or interface into a famix-class. Calls parsing-methods for its method and attribute entities
     * @param ctEntity the entity that should be parsed into a famix-class
     * @param famixParent the direct famix parent of the entity that should be parsed
     * @return the famix class the entity was parsed into
     */
    private FamixClass parseAsClass(CtType ctEntity, AbstractFamixEntity famixParent){
        //basic parsing of class
        FamixClass famixClass = new FamixClass(ctEntity.getQualifiedName(), famixParent);
        famixClass.setType("class");
        famixClass.setParentString(famixParent.getUniqueName());
        famixEntities.put(famixClass.getUniqueName(), famixClass);
        setModifiers(famixClass, ctEntity);

        //checking whether class has generalization relationship, then adding it to a list for further parsing of the relationship
        if(hasGeneralisation(ctEntity)){
            generalisationsToParse.add(famixClass);
        }

        //further parsing of class with calls to parse its methods, attributes and inner classes
        famixClass.setMethods(parseAllMethods(ctEntity, famixClass));
        famixClass.setAttributes(parseAllAttributes(ctEntity, famixClass));
        famixClass.setInnerClasses(parseAllNestedClasses(ctEntity, famixClass));
        return famixClass;
    }

    /**
     * Parses all nested Classes of a class
     * @param ctEntity the entity of which all nested classes should be parsed
     * @param famixParentClass the entity as a famix class, so famix parent can easily be set in nestedclasses as their direct parent
     * @return the list of parsed famix objects
     */
    private Set<FamixClass> parseAllNestedClasses(CtType ctEntity, AbstractFamixEntity famixParentClass) {
        Set<FamixClass> nestedClasses = new HashSet<>();

        for(Object c : ctEntity.getNestedTypes()){
            if(c instanceof CtClass){//checking before casting just in case
                CtClass ctClass = (CtClass) c; //necessary cast
                nestedClasses.add(parseAsClass(ctClass, famixParentClass));
            }
        }
        return nestedClasses;
    }

    /**
     * Parses all direct submethods of an entity
     * @param ctEntity the entity of which all submethods should be parsed
     * @param famixClass the entity as a famix object, so parent can easily be set in all submethods
     * @return a list of famixMethods, the submethods were parsed into
     */
    private Set<FamixMethod> parseAllMethods(CtType ctEntity, FamixClass famixClass) {
        Set<FamixMethod> famixMethods = new HashSet<>();

        //parsing all "normal" methods of the class or interface
        for(Object m : ctEntity.getMethods()){
            CtMethod ctMethod = (CtMethod) m; //necessary cast
            famixMethods.add(parseMethod(ctMethod, famixClass));
        }

        //parsing all contructors of a class -> interfaces do not have constructors
        if(!(ctEntity instanceof CtInterface)) {//only interfaces do not have constructors - if it is not an interface, ctEntity is of type CtClass
            CtClass ctClass = (CtClass) ctEntity;
            for (Object c : ctClass.getConstructors()) {
                CtConstructor ctConstructor = (CtConstructor) c;
                famixMethods.add(parseMethod(ctConstructor, famixClass));
            }
        }
        return famixMethods;
    }

    /**
     * Parses one ctElement (method or constructor) into a famixMethod
     * @param ctElement the ctElement that should be parsed into a famixMethod
     * @param famixParent the ctElement as a famixObject, so parent can easily be set in famixMethod
     * @return the famixMethod, the ctElement was parsed into
     */
    private FamixMethod parseMethod(CtElement ctElement, AbstractFamixEntity famixParent) {
        //TODO -- parse the method or the constructor
        //method has a list of local variables -> ... parse them into FamixLocalVariable -> needs unique name, parent and declareed class so type -- i dont know how to get the local Vars yet
        FamixMethod famixMethod = null;
        if(ctElement instanceof CtMethod){
            CtMethod m = (CtMethod) ctElement;
            famixMethod = new FamixMethod(m.getReference().getDeclaringType().getQualifiedName()+"-"+m.getSimpleName(), famixParent);//proper unique Name //TODO - fix naming
            parseAsMethod(m, famixMethod);

        }else if(ctElement instanceof CtConstructor){
            CtConstructor c = (CtConstructor) ctElement;
            famixMethod = new FamixMethod(c.getReference().getDeclaringType().getQualifiedName()+"-"+c.getSimpleName(), famixParent);//proper unique Name //TODO - fix naming

            parseAsConstructor(c, famixMethod);
        }else{
            return null;
        }
        famixMethod.setParentString(famixParent.getUniqueName());
        famixMethod.setParameters(parseAllParameters(ctElement, famixMethod));
        famixMethod.setType("method");
        famixEntities.put(famixMethod.getUniqueName(), famixMethod);
        famixMethod.setAnonymClasses(parseAllAnonymousClasses(ctElement, famixMethod));
        return famixMethod;
    }

    /**
     * Parses all Parameters of one ctElement (CtMethod or CtConstructor) and returns the parsed FamixParameters as a list
     * @param ctElement the CtMethod or CtConstructor that holds the information for the famixParameters that should be parsed
     * @param famixMethod the famixMethod that should be set as parent in all parsed FamixParameters
     * @return a list of parsed FamixParameters, so list can easily be set as field in parent famixMethod
     */
    private List<FamixParameter> parseAllParameters(CtElement ctElement, FamixMethod famixMethod) {
        List<FamixParameter> parsedParameters = new LinkedList<FamixParameter>();
        List paramsToParse = ((CtExecutable<?>) ctElement).getParameters();
        for(int i = 0; i< paramsToParse.size(); i++){
            parsedParameters.add(parseAsParameter((CtParameter) paramsToParse.get(i), i, famixMethod));
        }
        return parsedParameters;
    }

    /**
     * Parses one CtParameter into one FamixParameter
     * @param param the CtParameter of which the information should be set in new FamixParameter
     * @param index the index of the parameter in the parameter list
     * @param famixMethod the parent of the new FamixParameter in the Famix-Hierarchy
     * @return the parsed FamixParameter
     */
    private FamixParameter parseAsParameter(CtParameter param,int index, FamixMethod famixMethod) {
        FamixClass declaredType = null;
        //TODO - name of param will not be okay probably..
        FamixParameter famixParameter = new FamixParameter(param.getSimpleName(), famixMethod, index);
        famixParameter.setParentString(famixMethod.getUniqueName());
        famixParameter.setType("parameter"); //TODO - add styling in javascript
        declaredType = (FamixClass) famixEntities.get(param.getType().toString());
        if (declaredType == null){
            declaredType = new FamixClass(param.getType().toString());
            famixEntities.put(param.getType().toString(), declaredType);
        }
        famixParameter.setDeclaredClass(declaredType);//works? looks weird? test out with own class/type - reference does not work properly.. maybe just switch out for string?
        famixEntities.put(famixParameter.getUniqueName(), famixParameter);
        return famixParameter;
    }

    /**Almost identical to parseAsMethod
     * Method to finish parsing existing famixMethod -> sets all fields that can be set with additional information from ctConstructor
     * @param c the ctConstructor, that holds all information for famixMethod
     * @param famixMethod the FamixMethod that should be parsed
     */
    private void parseAsConstructor(CtConstructor c, FamixMethod famixMethod) {
        //TODO
        //is it necessary to show constructors.. ?
        //TODO... set modifiers
        //copy basically everything from parseAsMethod
        //System.out.println(c.getSimpleName()+" is a Constructor! Its parameters: "+ c.getParameters());
        //System.out.println("//////The return type is "+c.getDirectChildren().get(0));
    }

    /**Almost identical to parseAsConstructor
     * Method to finish parsing existing famixMethod -> sets all fields that can be set with additional information from ctMethod
     * @param m the ctMethod, that holds all information for famixMethod
     * @param famixMethod the FamixMethod that should be parsed
     */
    private void parseAsMethod(CtMethod m, FamixMethod famixMethod) {

        FamixClass returnType = null;
        //TODO set Modifiers...
        //method has return type search whether specific return class (set in getChildren at first position) already exists as a famixClass in entitiesHashmap
        returnType = (FamixClass) famixEntities.get(m.getDirectChildren().get(0));
        //TODO - that will probably create a problem... now everytime a new entity is created it should first be checked whether it does not exist in list yet...
        if(returnType == null){//returnType does not exist as FamixClass in hashmap -> must create (int etc)
            returnType = new FamixClass(m.getDirectChildren().get(0).toString());
        }
        //TODO - check whether void should be set as "declared" return class
        famixMethod.setDeclaredReturnClass(returnType);
        }


    /**
     * Parses all anonymous classes of a method
     * @param ctMethod the ctMethod, which holds anonymous classes that should be parsed into famix classes
     * @param famixMethod the ctMethod as a famixObject, so parent can easily be set in resulting famix classes
     * @return list of famix classes, the anonymous classes were parsed into
     */
    private Set<FamixClass> parseAllAnonymousClasses(CtElement ctMethod, FamixMethod famixMethod) {
        Set<FamixClass> anonymClasses = new HashSet<>();
        for (CtClass ctClass : ctMethod.getElements(new TypeFilter<>(CtClass.class))){
            anonymClasses.add(parseAsClass(ctClass,famixMethod));
        }
        return anonymClasses;
    }

    /**
     * Parses all attributes of a ctEntity
     * @param ctEntity the entity of which all attributes should be parsed
     * @param famixEntity the entity as its famixObject equivalent, so parent of parsed attributes can be easily set
     * @return a list of famix attributes, the ctFields (attributes) were parsed into
     */
    private Set<FamixAttribute> parseAllAttributes(CtType ctEntity, AbstractFamixEntity famixEntity) {
        Set<FamixAttribute> famixAttributes = new HashSet<>();
        for(Object f : ctEntity.getFields()){
            CtField ctField = (CtField) f;
            famixAttributes.add(parseAttribute(ctField, famixEntity));
        }
        return famixAttributes;
    }

    /**
     * Parses one ctFields into a famix field/attribute
     * @param ctField the ctFields that should be parsed
     * @param famixParent the ctField as its famixObject equivalent, so parent can easily be set
     * @return the famixField the ctField was parsed into
     */
    private FamixAttribute parseAttribute(CtField ctField, AbstractFamixEntity famixParent) {
        //TODO also set a declared class -> so the type.. could just set as a string instead of a famix class.... hmmmm -> gehen dann die references verloren?
        //TODO - check whether uniqueName of attribute inside a method will be set correctly - because method was given unique name manually
        FamixAttribute famixField = new FamixAttribute(ctField.getReference().getQualifiedName(), famixParent); //proper unique Name
        famixField.setType("attribute");
        famixField.setParentString(famixParent.getUniqueName());
        famixEntities.put(famixField.getUniqueName(), famixField);
        return famixField;
    }

    /**
     * Sets the correct modifiers of a famix object, depending on the modifiers of the corresponding ctEntity
     * @param famixEntity the famix entity of which the modifiers are set
     * @param ctEntity the corresponding ctEntity
     */
    private void setModifiers(AbstractFamixEntity famixEntity, CtType ctEntity) {
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

    /**
     * Starts parsing of all generalisations that were encountered when the entities were being parsed
     */
    //after packages are done analysis and parsing of generalisations - because then all famix classes have been created and two famix classes can be put into a relationship
    private void parseAllEncounteredGeneralisations() {
        for(FamixClass fClass : generalisationsToParse){
            parseGeneralisationsOfClass(fClass);
        }
    }

    /**
     * Starts parsing of the generalisations of one famix Class (implements and extends relationships)
     * @param fClass the class of which the generalisations should be parsed
     */
    private void parseGeneralisationsOfClass(FamixClass fClass) {
        CtClass ctClassMatch = getMatchingCtClass(fClass);

        if(ctClassMatch != null){
            parseExtendsAssoc(fClass, ctClassMatch);
            parseImplementsAssocs(fClass, ctClassMatch);
        }

    }

    /**
     * Parses all implements relationships of one famix Class
     * @param fClass the famix Class of which all implements relationships should be parsed
     * @param ctClassMatch the corresponding ctEntity that provides all  additional data for the famixClass
     */
    private void parseImplementsAssocs(FamixClass fClass, CtClass ctClassMatch) {
        Set<CtTypeReference<?>> interfaces = ctClassMatch.getSuperInterfaces();
        FamixSubtyping fsub = null; //represents implements
        FamixClass fAssoc = null;

        if(interfaces.size()>0){
            for(CtTypeReference i : interfaces){
                fAssoc = (FamixClass) famixEntities.get(i.getQualifiedName());
                if(fAssoc != null){
                    fsub = new FamixSubtyping(fClass, fAssoc);
                }else{//could be first encounter of interface like "JavaCompiler" -> Spoonparser did not parse this class
                    fAssoc = new FamixClass(i.getQualifiedName());
                    fAssoc.setType("class");
                    fsub = new FamixSubtyping(fClass, fAssoc);
                    fsub.setType("implements");
                    famixEntities.put(i.getQualifiedName(), fAssoc);
                }
                fsub.setType("implements");
                addToHashAssociations(fsub);
            }
        }
    }

    /**
     * Parses all extends relationships of one famix class
     * @param fClass the famix Class of which all extends relationships should be parsed
     * @param ctClassMatch the corresponding ctEntity that provides all additional data for the famixClass
     */
    private void parseExtendsAssoc(FamixClass fClass, CtClass ctClassMatch) {
        CtTypeReference superclass = ctClassMatch.getSuperclass();
        FamixInheritance finh = null; //represents extends
        FamixClass fAssoc = null;

        if(superclass != null){
            fAssoc = (FamixClass) famixEntities.get(superclass.getQualifiedName());
            if(fAssoc != null){ //could be null if first encounter of unparsed class (like Thread, Enum ...)
                finh = new FamixInheritance(fClass, fAssoc);
            }else{
                fAssoc = new FamixClass(superclass.getQualifiedName());
                fAssoc.setType("class");
                finh = new FamixInheritance(fClass, fAssoc);
                famixEntities.put(superclass.getQualifiedName(), fAssoc); //adding unknown class to entities for visualisation
            }
            finh.setType("extends");
            addToHashAssociations(finh);
        }
    }

    /**
     * Searches through the ctModel and returns the corresponding ctEntity to a given famixClass
     * @param fClass the famixClass for which the corresponding ctEntity should be found
     * @return the corresponding ctEntity
     */
    private CtClass getMatchingCtClass(FamixClass fClass) {
        List matchingClasses = spoonRootPackage.filterChildren(new AbstractFilter<CtClass>(CtClass.class) {
            @Override
            public boolean matches(CtClass ctc){
                return ctc.getQualifiedName().equals(fClass.getUniqueName()); //filter only matches one specific class
            }
        }).list();
        if(matchingClasses.size() > 0){
            return (CtClass) matchingClasses.get(0);
        }else {
            return null;
        }
    }

    /**
     * Getter for famixEntites-hashmap
     * @return the famixEntities-hashmap
     */
    public HashMap<String, AbstractFamixEntity> getFamixEntities() {
        return famixEntities;
    }

    /**
     * Getter for famixAssociations-hashmap
     * @return the famixAssociations-hashmap
     */
    public HashMap<Integer, AbstractFamixGeneralization> getFamixAssociations() {
        return famixAssociations;
    }
}