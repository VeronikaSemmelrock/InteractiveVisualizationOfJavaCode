package analysis;

import model.entities.*;
import org.eclipse.jdt.core.util.IModifierConstants;
import spoon.reflect.CtModel;
import spoon.reflect.code.*;
import spoon.reflect.declaration.*;

import java.util.*;

import spoon.reflect.reference.CtFieldReference;
import spoon.reflect.reference.CtTypeReference;
import spoon.reflect.visitor.filter.AbstractFilter;
import spoon.reflect.visitor.filter.TypeFilter;
import spoon.support.reflect.declaration.CtMethodImpl;

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
    private HashMap<Integer, FamixAssociation> famixAssociations = new LinkedHashMap<>();
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
     * Lists of encountered methods and attributes to finish parsing, after all classes were parsed, to be able to set declared class
     */
    private HashMap<FamixMethod, CtExecutable> encounteredMethods = new HashMap<>();
    private HashMap<FamixAttribute, CtField> encounteredAttributes = new HashMap<>();
    /**
     * Hashmap to temporarily hold all encountered entities with associations that need to be parsed
     */
    private ArrayList<FamixClass> generalisationsToParse = new ArrayList<>();

    /**
     * Delimiters that make unique naming of methods (overloading issues), local variables and parameters possible
     */
    private final char DELIMITER_METHOD = '.';
    private final char DELIMITER_LOCALVARIABLE = '^';
    private final char DELIMITER_PARAMETER ='\'';
    private final char DELIMITER_ATTRIBUTE = '#';
    private final char DELIMITER_INNERCLASS = '$';

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
    public void parseSpoonRootPackage() throws Exception {
        for(CtPackage p : spoonRootPackage.getPackages()){
            parseRootPackage(p);
        }
        setAttributeDeclaredClass(); //after all classes have been parsed -> attributes can have their declaring class (data type - could be a class) set
        finishMethodParsing(); //after all classes have been parsed -> methods parsing can be finished -> setting declared return type in method and starts parsing of parameters and Local variables that also have declared class
        parseAllEncounteredGeneralisations(); //parses all encountered import and extends relationships between classes
        parseAllMethodInvocations(); //parses any and all method invocations
        parseAllAttributeAccesses(); //parses any and all field/attribute accesses (read/write)
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
    private void addToHashAssociations(FamixAssociation f){
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
        famixClass.setModifiers(getModifiers((CtNamedElement) ctEntity));

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
     * Parses all methods ("normal" methods and constrcutors) of a class
     * @param ctEntity the entity of which all submethods should be parsed
     * @param famixClass the entity as a famix object, so parent can easily be set in all submethods
     * @return a list of famixMethods the submethods were parsed into
     */
    private Set<FamixMethod> parseAllMethods(CtType ctEntity, FamixClass famixClass) {
        Set<FamixMethod> famixMethods = new HashSet<>();

        //parsing all "normal" methods of the class or interface
        for(Object m : ctEntity.getMethods()){
            CtMethod ctMethod = (CtMethod) m; //necessary cast
            famixMethods.add(parseMethod(ctMethod, famixClass));
        }

        //parsing all contructors of a class -> interfaces do not have constructors
        if(!(ctEntity instanceof CtInterface)) {
            CtClass ctClass = (CtClass) ctEntity;
            for (Object c : ctClass.getConstructors()) {
                CtConstructor ctConstructor = (CtConstructor) c;
                famixMethods.add(parseMethod(ctConstructor, famixClass));
            }
        }
        return famixMethods;
    }

    /**
     * Rarses a CtMethod object into a FamixMethod-Object
     * @param m the ctMethod, that holds all information for famixMethod
     * @param famixParent the parent of the method as a Famix Object for easy setting of parent
     */
    private FamixMethod parseMethod(CtExecutable m, FamixClass famixParent) {
        FamixMethod famixMethod = null;
        //creating unique name depending on whether it is a constructor or "normal" method -> "-" can not be used in naming of classes, methods ... so it is used here as a delimiter
        if(m instanceof CtMethod){
            famixMethod = new FamixMethod(m.getReference().getDeclaringType().getQualifiedName()+DELIMITER_METHOD+m.getReference(), famixParent);//proper unique Name
            famixMethod.setType("method");
        }else if(m instanceof CtConstructor){ //Name of constructors will look different
            famixMethod = new FamixMethod(""+m.getReference(), famixParent);//proper unique name
            famixMethod.setType(("constructor"));
        }
        //parsing of method and all its anonymous inner classes
        famixMethod.setParentString(famixParent.getUniqueName());
        famixMethod.setModifiers(getModifiers((CtNamedElement) m));
        famixEntities.put(famixMethod.getUniqueName(), famixMethod);
        famixMethod.setAnonymClasses(parseAllAnonymousClasses(m, famixMethod));

        //adding famixMethod to a list of methods whose parsing (and their parameters and local vars parsing) will be finished once all classes were parsed - for declared return class
        encounteredMethods.put(famixMethod, m);
        return famixMethod;
    }

    /**
     * Starts parsing of all local Variables of a CtMethod into FamixLocalVariables
     * @param m the ctMethod of which the local Variables should be parsed
     * @param famixMethod the parent of the local Variables
     * @return a list of all parsed FamixLocalVariables
     */
    private Set<FamixLocalVariable> parseAllLocalVariables(CtExecutable m, FamixMethod famixMethod) {
        Set<FamixLocalVariable> localVars = new HashSet<>();

        for(CtVariable var : m.getElements(new TypeFilter<>(CtVariable.class))){
            localVars.add(parseLocalVariable(var, famixMethod));
        }
        return localVars;
    }

    /**
     * Parses a CtLocalVariable into a FamixLocalVariable
     * @param ctVar the CtLocalVariable that should be parsed
     * @param famixMethod the parent of the resulting FamixLocalVariable
     * @return a parsed FamixLocalVariable
     */
    private FamixLocalVariable parseLocalVariable(CtVariable ctVar, FamixMethod famixMethod) {
        //basic parsing of FamixLocalVariable
        FamixLocalVariable famixVar = new FamixLocalVariable(famixMethod.getUniqueName()+DELIMITER_LOCALVARIABLE+ctVar.getSimpleName(), famixMethod);
        famixVar.setType("localVariable");
        famixVar.setModifiers(getModifiers((CtNamedElement) ctVar));
        famixVar.setParentString(famixMethod.getUniqueName());
        famixEntities.put(famixVar.getUniqueName(), famixVar);
        famixVar.setDeclaredClass(getDeclaredClass(ctVar.getType().toString()));
        return famixVar;
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
        //basic parsing of parameter
        FamixParameter famixParameter = new FamixParameter(famixMethod.getUniqueName()+DELIMITER_PARAMETER+param.getSimpleName(), famixMethod, index);
        famixParameter.setParentString(famixMethod.getUniqueName());
        famixParameter.setType("parameter");
        famixParameter.setModifiers(-1);//a parameter does not have any modifiers
        famixEntities.put(famixParameter.getUniqueName(), famixParameter);
        famixParameter.setDeclaredClass(getDeclaredClass(param.getType().toString()));
        return famixParameter;
    }


    /**
     * Parses all attributes of a ctEntity (class)
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
     * Parses one ctField into a FamixAttribute
     * @param ctField the ctFields that should be parsed
     * @param famixParent the ctField as its famixObject equivalent, so parent can easily be set
     * @return the famixAttribute the ctField was parsed into
     */
    private FamixAttribute parseAttribute(CtField ctField, AbstractFamixEntity famixParent) {
        //basic parsing of attribute
        FamixAttribute famixAttribute = new FamixAttribute(ctField.getReference().getQualifiedName(), famixParent); //unique name
        famixAttribute.setType("attribute");
        famixAttribute.setParentString(famixParent.getUniqueName());
        famixAttribute.setModifiers(getModifiers((CtNamedElement) ctField));
        famixEntities.put(famixAttribute.getUniqueName(), famixAttribute);
        //adding attribute to a list of attributes whose parsing (setting of declared class (data type)) will be finished once all classes have been parsed
        encounteredAttributes.put(famixAttribute, ctField);
        return famixAttribute;
    }

    /**
     * Calls functions to finish parsing of all encountered methods and subsequently its parameters and local variables.
     * This method is called after all classes have been parsed, so data types (declared class) of method (return type), parameter and local variable can now be set.
     * For all methods the declared return class is set and parsing of parameters and local variables is started.
     * Furthermore, for each found return type of a method, an FamixAssociation between FamixMethod and its return type (FamixClass) is created and added to the assocs hashmap
     */
    private void finishMethodParsing() {
        for(Map.Entry<FamixMethod, CtExecutable> entry : encounteredMethods.entrySet()){
            FamixMethod fmethod = entry.getKey();
            CtExecutable ctmethod = entry.getValue();

            //further parsing of method and call to parse all its parameters and local variables
            fmethod.setParameters(parseAllParameters(ctmethod, fmethod));
            fmethod.setLocalVariables(parseAllLocalVariables(ctmethod, fmethod));

            //only set a declared return class if it is not a constructor -> constructors do not have return types
            if(ctmethod instanceof CtMethod){
                //getting the declaredReturnClass and setting it in FamixMethod
                FamixClass declaredReturnClass = getDeclaredClass(ctmethod.getType().toString());
                fmethod.setDeclaredReturnClass(declaredReturnClass);

                //creating a famixAssociation connecting the method to its return type (declared return class)
                FamixAssociation returnTypeAssoc = new FamixAssociation(fmethod, declaredReturnClass);
                returnTypeAssoc.setType("returnType");
                addToHashAssociations(returnTypeAssoc);
            }
        }
    }

    /**
     * Method to set declared class of each encountered attribute. This method is called after all classes have been parsed to be able to set declared class
     */
    private void setAttributeDeclaredClass(){
        for(Map.Entry<FamixAttribute, CtField> entry : encounteredAttributes.entrySet()){
            entry.getKey().setDeclaredClass(getDeclaredClass(entry.getValue().getType().toString()));
        }
    }


    /**
     * Searches for a uniqueName representing a class in entities-Hashmap and returns it. If no class is found, a new one is created, added to the hashmap and returned.
     * @param uniqueName the uniqueName that represensts the key in the hashmap. The value in the hashmap is the class that is looked for.
     * @return a famixClass representing the searched for class.
     */
    private FamixClass getDeclaredClass(String uniqueName) {
        FamixClass returnType = null;
        //searching in famixEntities-hashmap, whether data type (declared class) already exists as a FamixClass in the hashmap
        returnType = (FamixClass) famixEntities.get(uniqueName);
        if(returnType == null){//returnType does not exist as FamixClass in hashmap -> must create (like int, boolean ...) and only set specific name
            returnType = new FamixClass(uniqueName);
            returnType.setType("class");
            returnType.setForeign(true);//it is an unknown entity -> setting necessary for visualisation later
            famixEntities.put(uniqueName, returnType);
        }
        return returnType;
    }


    /**
     * Returns the correct modifiers of a famix object, depending on the modifiers of the corresponding ctEntity
     * @param ctEntity the corresponding ctEntity
     * @return modifiers to be set in a famix Object
     */
    private int getModifiers(CtNamedElement ctEntity) {
        Set<ModifierKind> modifiers = new HashSet<ModifierKind>();
        int typeModifier = 0;

        if (ctEntity instanceof CtConstructor){
            CtConstructor c = (CtConstructor) ctEntity;
            modifiers = c.getModifiers();
        }else if(ctEntity instanceof CtMethod){
            CtMethod m = (CtMethod) ctEntity;
            modifiers = m.getModifiers();
        }else if(ctEntity instanceof CtClass || ctEntity instanceof CtInterface){
            CtType c = (CtType) ctEntity;
            modifiers = c.getModifiers();
            if(c.isEnum()){
                typeModifier += AbstractFamixEntity.MODIFIER_ENUM;
            }
            if(c.isInterface()){
                typeModifier += AbstractFamixEntity.MODIFIER_INTERFACE;
            }
        }else if(ctEntity instanceof CtField || ctEntity instanceof CtVariable){
            CtVariable v = (CtVariable) ctEntity;
            modifiers = v.getModifiers();
        }

        return calculateModifiers(modifiers, typeModifier);
    }

    /**
     * Calculates and returns the correct modifier from a list of modifiers
     * @param modifiers the corresponding modifier-list of a ctEntity
     * @param famixModifier already calculated offset (depending on whether ctEntity is of Type interface or enum)
     * @return calculated modifiers
     */
    private int calculateModifiers(Set<ModifierKind> modifiers, int famixModifier) {
        for(ModifierKind modifier : modifiers) {
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
        return famixModifier;
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
                    fAssoc.setForeign(true);//necessary to be able to filter it away in visualisation
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
                fAssoc.setForeign(true);//necessary to be able to filter it away in visualisation
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
     * Parses all method invocations in the spoon parser model to FamixInvocation and adds them to assocations-hashmap
     * @throws Exception - is thrown, when caller-method is unknown
     */
    private void parseAllMethodInvocations() throws Exception {
        List<CtInvocation> invocations = spoonModel.getElements(ctElement -> ctElement instanceof CtInvocation);
        for (CtInvocation invocation : invocations) {
            FamixInvocation famixInvocation = createFamixInvocation(invocation);
            if(famixInvocation != null){
                addToHashAssociations(createFamixInvocation(invocation));
            }
        }
    }


    /**
     * Parses a given CtInvocation into a FamixInvocation
     * @param invocation the invocation from the spoon model, that needs to be parsed into FamixInvocation
     * @return a FamixInvocation representing the CtInvocation from the SpoonModel
     * @throws Exception - is thrown, when caller-method of invocation is unknown
     */
    private FamixInvocation createFamixInvocation(CtInvocation invocation) throws Exception {
        //extracting uniqueNames for caller- and callee-method
        String uniqueNameCallee = null;
        String uniqueNameCaller = null;
        String uniqueNameCalleeOtherOption = null; //sometimes other delimiters have to be used ($ for innerClasses) or the full path has to be added in order to find it in the hashmap.
        //if still no entity is found with this name, then entity is created with original uniqueName
        CtMethod parentMethod = invocation.getParent(new TypeFilter<>(CtMethod.class));
        CtConstructor parentConstructor = invocation.getParent(new TypeFilter<>(CtConstructor.class));
        if(parentMethod != null){//parent/caller is a method
            uniqueNameCaller = parentMethod.getReference().getDeclaringType().getQualifiedName()+DELIMITER_METHOD+parentMethod.getReference();
            uniqueNameCallee = invocation.getExecutable().getDeclaringType().toString()+DELIMITER_METHOD+invocation.getExecutable().toString();
            //for finding innerClasses
            String temp = invocation.getExecutable().getDeclaringType().toString();
            int tempIndex = temp.lastIndexOf(".");
            uniqueNameCalleeOtherOption = temp.substring(0, tempIndex) + DELIMITER_INNERCLASS+temp.substring(tempIndex+1)+DELIMITER_METHOD+invocation.getExecutable().toString();
        }else if(parentConstructor != null){//parent/caller is a constructor
            uniqueNameCaller = parentConstructor.getReference().toString();
            uniqueNameCallee = invocation.getExecutable().toString();
            uniqueNameCalleeOtherOption = invocation.getExecutable().getDeclaringType().toString()+DELIMITER_METHOD+invocation.getExecutable().toString();//for finding method with full path
        }else {
            return null;
        }

        if(uniqueNameCallee.contains(".Object()") && parentConstructor != null){//in case of constructors calling java.lang.Object() etc -> do not add to list!
            return null;
        }
        //searching for uniqueNames in entities-hashmap, in case it is a known method that was already parsed
        FamixMethod caller = (FamixMethod) famixEntities.get(uniqueNameCaller);
        FamixMethod callee = (FamixMethod) famixEntities.get(uniqueNameCallee);

        //if the caller is unknown, throw exception
        if(caller == null){
            throw new Exception("Unknown caller in method invocation!");
        }
        //if the callee is unknown, create new FamixMethod with this uniqueName and add to entities-hashmap
        if(callee == null){
            System.out.println(uniqueNameCallee+ " was not found. Now searching for "+uniqueNameCalleeOtherOption);
            callee = (FamixMethod) famixEntities.get(uniqueNameCalleeOtherOption);//search for other naming option in hashmap of known entities
            if(callee == null){//other naming option was also not found - create new FamixMethod
                System.out.println(uniqueNameCalleeOtherOption+ " was also not found. Now creating "+uniqueNameCallee);
                callee = new FamixMethod(uniqueNameCallee);
                callee.setType("method");
                callee.setForeign(true);//necessary to be able to filter it away in visualisation
                famixEntities.put(uniqueNameCallee, callee);
            }
        }
        System.out.println("Creating Invocation with callee "+callee.getUniqueName());
        //create and return FamixInvocation
        FamixInvocation finvocation = new FamixInvocation(caller, callee);
        finvocation.setType("invocation");
        return finvocation;
    }

    /**
     * Parses all attribute accesses in the spoon parser model to FamixAccess and adds them to assocations-hashmap
     */
    private void parseAllAttributeAccesses() throws Exception {
        List<CtFieldAccess> accesses = spoonModel.getElements(ctAccess -> ctAccess instanceof CtFieldAccess);
        for (CtFieldAccess access : accesses) {
            FamixAccess famixAccess = createFamixAccess(access);
            if(famixAccess != null ){
                addToHashAssociations(famixAccess);
            }
        }
    }

    /**
     *Parses a given CtFieldAccess into a FamixAccess
     *@param access the CtFieldAccess from the spoon model, that needs to be parsed into FamixAccess
     *@return a FamixAccess representing the CtVariableAccess from the SpoonModel
     */
    private FamixAccess createFamixAccess(CtFieldAccess access) throws Exception {
        String uniqueNameMethod = null;
        String uniqueNameField = access.getVariable().getQualifiedName();

        //getting uniqueName of method/constructor that is accessing attribute
        CtMethod parentMethod = access.getParent(new TypeFilter<>(CtMethod.class));
        CtConstructor parentConstructor = access.getParent(new TypeFilter<>(CtConstructor.class));
        if(parentMethod != null){//parent/caller is a method
            uniqueNameMethod = parentMethod.getReference().getDeclaringType().getQualifiedName()+DELIMITER_METHOD+parentMethod.getReference();
        }else if(parentConstructor != null){//parent/caller is a constructor
            uniqueNameMethod = parentConstructor.getReference().toString();
        }else {
            return null;
        }

        FamixMethod method = (FamixMethod) famixEntities.get(uniqueNameMethod);
        FamixAttribute attribute = (FamixAttribute) famixEntities.get(uniqueNameField);
        if(method == null){
            throw new Exception("Unknown Method in parsing of attribute access!");
        }else if(attribute == null){
            attribute = new FamixAttribute(uniqueNameField);
            attribute.setType("attribute");
            attribute.setForeign(true);//necessary to be able to filter it away in visualisation
            famixEntities.put(uniqueNameField, attribute);
        }

        //creating famixAccess, setting correct type and returning
        FamixAccess famixAccess = new FamixAccess(method, attribute);
        famixAccess.setType("access");
        return famixAccess;
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
    public HashMap<Integer, FamixAssociation> getFamixAssociations() {
        return famixAssociations;
    }
}