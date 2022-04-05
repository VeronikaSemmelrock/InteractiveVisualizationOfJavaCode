package junitTests;

import analysis.IVC;
import model.entities.*;
import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.Assert.assertEquals;

public class IntegrationTests {
    IVC ivc;
    private HashMap<String, AbstractFamixEntity> famixEntities;
    private HashMap<Integer, FamixAssociation> famixAssociations;

    @Before
    public void createIVC() throws Exception {
        ivc = new IVC();
        ivc.setProjectPath(System.getProperty("user.dir")+"\\src\\test\\resources\\IntegrationTestInputProject");
        ivc.startIVC();
        famixEntities = ivc.getEntities();
        famixAssociations = ivc.getAssociations();
    }

    @Test
    public void packageTest(){
        //Tests whether a package is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and subclasses
        assertTrue(famixEntities.containsKey("testpackage4"));

        FamixPackage parsedPackage = (FamixPackage) famixEntities.get("testpackage4");
        assertEquals("FamixPackage",parsedPackage.getType());
        assertEquals(null, parsedPackage.getParent());
        assertEquals("testpackage4", parsedPackage.getUniqueName());
        assertEquals(0, parsedPackage.getModifiers());
        assertEquals(1, parsedPackage.getClasses().size());
        assertTrue(parsedPackage.getClasses().contains(famixEntities.get("testpackage4.TestClass2")));
    }

    @Test
    public void subpackageTest(){
        //Tests whether a subpackage is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and subclasses

        assertTrue( famixEntities.containsKey("testpackage1.innerPackage"));
        FamixPackage parsedPackage = (FamixPackage) famixEntities.get("testpackage1.innerPackage");
        assertEquals("FamixPackage",parsedPackage.getType());
        assertEquals("package", parsedPackage.getfType());
        assertEquals(famixEntities.get("testpackage1"), parsedPackage.getParent());
        assertEquals("testpackage1.innerPackage", parsedPackage.getUniqueName());
        assertEquals(0, parsedPackage.getModifiers());
        assertEquals(1, parsedPackage.getClasses().size());
        assertTrue(parsedPackage.getClasses().contains(famixEntities.get("testpackage1.innerPackage.ClassInnerPackage")));
    }


    @Test
    public void classTest(){
        //Tests whether a class is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // inner classes, methods (constructors) and attributes

        assertTrue(famixEntities.containsKey("testpackage1.Testclass1"));
        FamixClass parsed = (FamixClass) famixEntities.get("testpackage1.Testclass1");
        assertEquals("FamixClass",parsed.getType());
        assertEquals("class", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1"), parsed.getParent());
        assertEquals("testpackage1.Testclass1", parsed.getUniqueName());
        assertEquals(1, parsed.getModifiers());
        assertEquals(1, parsed.getInnerClasses().size());
        assertTrue(parsed.getInnerClasses().contains(famixEntities.get("testpackage1.Testclass1$innerClass")));

        assertEquals(3, parsed.getMethods().size());
        assertTrue(parsed.getMethods().contains(famixEntities.get("testpackage1.Testclass1()")));//constructor
        assertTrue(parsed.getMethods().contains(famixEntities.get("testpackage1.Testclass1.testClass1Method(java.lang.String,int)")));
        assertTrue(parsed.getMethods().contains(famixEntities.get("testpackage1.Testclass1.run()")));

        assertEquals(1, parsed.getAttributes().size());
        assertTrue(parsed.getAttributes().contains(famixEntities.get("testpackage1.Testclass1#testClass1Attribute")));
    }

    @Test
    public void abstractClassTest(){
        //Tests whether an abstract class is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // inner classes, methods (constructors) and attributes

        assertTrue(famixEntities.containsKey("testpackage4.TestClass2"));
        FamixClass parsed = (FamixClass) famixEntities.get("testpackage4.TestClass2");
        assertEquals("FamixClass",parsed.getType());
        assertEquals("class", parsed.getfType());
        assertEquals(famixEntities.get("testpackage4"), parsed.getParent());
        assertEquals("testpackage4.TestClass2", parsed.getUniqueName());
        assertEquals(1025, parsed.getModifiers());//abstract
        assertEquals(0, parsed.getInnerClasses().size());

        assertEquals(1, parsed.getMethods().size());
        assertTrue(parsed.getMethods().contains(famixEntities.get("testpackage4.TestClass2()")));//constructor

        assertEquals(1, parsed.getAttributes().size());
        assertTrue(parsed.getAttributes().contains(famixEntities.get("testpackage4.TestClass2#test")));
    }

    @Test
    public void interfaceTest(){
        //Tests whether a class (in this case interface) is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers,
        // inner classes, methods (constructors) and attributes

        assertTrue(famixEntities.containsKey("testpackage2.TestInterface"));
        FamixClass parsed = (FamixClass) famixEntities.get("testpackage2.TestInterface");
        assertEquals("FamixClass",parsed.getType());
        assertEquals("class", parsed.getfType());
        assertEquals(famixEntities.get("testpackage2"), parsed.getParent());
        assertEquals("testpackage2.TestInterface", parsed.getUniqueName());
        assertEquals(16385, parsed.getModifiers());//interface
        assertEquals(0, parsed.getInnerClasses().size());

        assertEquals(0, parsed.getMethods().size());//no constructor

        assertEquals(1, parsed.getAttributes().size());
        assertTrue(parsed.getAttributes().contains(famixEntities.get("testpackage2.TestInterface#finalInt")));
    }

    @Test
    public void enumTest(){
        //Tests whether an enum is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // inner classes, methods (constructors) and attributes

        assertTrue(famixEntities.containsKey("testpackage3.TestEnum"));
        FamixClass parsed = (FamixClass) famixEntities.get("testpackage3.TestEnum");
        assertEquals("FamixClass",parsed.getType());
        assertEquals("class", parsed.getfType());
        assertEquals(famixEntities.get("testpackage3"), parsed.getParent());
        assertEquals("testpackage3.TestEnum", parsed.getUniqueName());
        assertEquals(32769, parsed.getModifiers());//enum
        assertEquals(0, parsed.getInnerClasses().size());
        assertEquals(1, parsed.getMethods().size());
        assertTrue(parsed.getMethods().contains(famixEntities.get("testpackage3.TestEnum()")));

        assertEquals(0, parsed.getAttributes().size());
    }


    @Test
    public void innerClassTest(){
        //Tests whether an innerclass is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // inner classes, methods (constructors) and attributes

        assertTrue(famixEntities.containsKey("testpackage1.Testclass1$innerClass"));
        FamixClass parsed = (FamixClass) famixEntities.get("testpackage1.Testclass1$innerClass");
        assertEquals("FamixClass",parsed.getType());
        assertEquals("class", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.Testclass1"), parsed.getParent());
        assertEquals("testpackage1.Testclass1$innerClass", parsed.getUniqueName());
        assertEquals(1, parsed.getModifiers());
        assertEquals(0, parsed.getInnerClasses().size());
        assertEquals(2, parsed.getMethods().size());
        assertTrue(parsed.getMethods().contains(famixEntities.get("testpackage1.Testclass1$innerClass()")));
        assertTrue(parsed.getMethods().contains(famixEntities.get("testpackage1.Testclass1$innerClass.innerClassTestMethod(java.lang.String)")));

        assertEquals(2, parsed.getAttributes().size());
        assertTrue(parsed.getAttributes().contains(famixEntities.get("testpackage1.Testclass1$innerClass#test")));
        assertTrue(parsed.getAttributes().contains(famixEntities.get("testpackage1.Testclass1$innerClass#testInt")));
    }

    @Test
    public void anonymousClassTest(){
        //Tests whether an innerclass is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // inner classes, methods (constructors) and attributes
        // have extra "1" in name after $ -> added by spoonparser to signal anonymous class

        assertTrue(famixEntities.containsKey("testpackage1.Testclass1$1anonymClass"));
        FamixClass parsed = (FamixClass) famixEntities.get("testpackage1.Testclass1$1anonymClass");
        assertEquals("FamixClass",parsed.getType());
        assertEquals("class", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.Testclass1.run()"), parsed.getParent());
        assertEquals("testpackage1.Testclass1$1anonymClass", parsed.getUniqueName());
        assertEquals(0, parsed.getModifiers());
        assertEquals(0, parsed.getInnerClasses().size());
        assertEquals(2, parsed.getMethods().size());
        assertTrue(parsed.getMethods().contains(famixEntities.get("testpackage1.Testclass1$1anonymClass.changeString()")));
        assertTrue(parsed.getMethods().contains(famixEntities.get("testpackage1.Testclass1$1anonymClass()")));

        assertEquals(0, parsed.getAttributes().size());
    }

    @Test
    public void methodTest(){
        //Tests whether a method is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // declared return class, anonymClass, parameters and local Variables

        assertTrue(famixEntities.containsKey("testpackage1.Testclass1.testClass1Method(java.lang.String,int)"));
        FamixMethod parsed = (FamixMethod) famixEntities.get("testpackage1.Testclass1.testClass1Method(java.lang.String,int)");
        assertEquals("FamixMethod",parsed.getType());
        assertEquals("method", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.Testclass1"), parsed.getParent());
        assertEquals("testpackage1.Testclass1.testClass1Method(java.lang.String,int)", parsed.getUniqueName());
        assertEquals(1, parsed.getModifiers());
        assertEquals(famixEntities.get("void"), parsed.getDeclaredReturnClass());
        assertEquals(0, parsed.getAnonymClasses().size());

        assertEquals(2, parsed.getParameters().size());
        assertTrue(parsed.getParameters().contains(famixEntities.get("testpackage1.Testclass1.testClass1Method(java.lang.String,int)'param1")));
        assertTrue(parsed.getParameters().contains(famixEntities.get("testpackage1.Testclass1.testClass1Method(java.lang.String,int)'param2")));

        assertEquals(2, parsed.getLocalVariables().size());
        assertTrue(parsed.getLocalVariables().contains(famixEntities.get("testpackage1.Testclass1.testClass1Method(java.lang.String,int)^param1")));
        assertTrue(parsed.getLocalVariables().contains(famixEntities.get("testpackage1.Testclass1.testClass1Method(java.lang.String,int)^param2")));
    }


    @Test
    public void constructorTest(){
        //Tests whether a constructor is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // declared return class, anonymClass, parameters and local Variables

        assertTrue(famixEntities.containsKey("testpackage1.Testclass1()"));
        FamixMethod parsed = (FamixMethod) famixEntities.get("testpackage1.Testclass1()");
        assertEquals("FamixMethod",parsed.getType());
        assertEquals("constructor", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.Testclass1"), parsed.getParent());
        assertEquals("testpackage1.Testclass1()", parsed.getUniqueName());
        assertEquals(1, parsed.getModifiers());
        assertEquals(null, parsed.getDeclaredReturnClass());
        assertEquals(0, parsed.getAnonymClasses().size());

        assertEquals(0, parsed.getParameters().size());
        assertEquals(0, parsed.getLocalVariables().size());
    }

    @Test
    public void attributeTest(){
        //Tests whether an attribute (class attribute) is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // declared return class

        assertTrue(famixEntities.containsKey("testpackage1.Testclass1#testClass1Attribute"));
        FamixAttribute parsed = (FamixAttribute) famixEntities.get("testpackage1.Testclass1#testClass1Attribute");
        assertEquals("FamixAttribute",parsed.getType());
        assertEquals("attribute", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.Testclass1"), parsed.getParent());
        assertEquals("testpackage1.Testclass1#testClass1Attribute", parsed.getUniqueName());
        assertEquals(1, parsed.getModifiers());
        assertEquals(famixEntities.get("java.lang.String"), parsed.getDeclaredClass());
    }

    @Test
    public void localVarTest(){
        //Tests whether a local Variable is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // declared return class

        assertTrue(famixEntities.containsKey("testpackage1.innerPackage.ClassInnerPackage(java.lang.String,int,testpackage1.Testclass1)^infoAmount"));
        FamixLocalVariable parsed = (FamixLocalVariable) famixEntities.get("testpackage1.innerPackage.ClassInnerPackage(java.lang.String,int,testpackage1.Testclass1)^infoAmount");
        assertEquals("FamixLocalVariable",parsed.getType());
        assertEquals("localVariable", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.innerPackage.ClassInnerPackage(java.lang.String,int,testpackage1.Testclass1)"), parsed.getParent());
        assertEquals("testpackage1.innerPackage.ClassInnerPackage(java.lang.String,int,testpackage1.Testclass1)^infoAmount", parsed.getUniqueName());
        assertEquals(0, parsed.getModifiers());
        assertEquals(famixEntities.get("int"), parsed.getDeclaredClass());
    }


    @Test
    public void parameterTest(){
        //Tests whether a parameter is contained in hashmap of entities,
        // has correctly set type, parent, uniqueName, modifiers and
        // declared return class and index of parameter in parameter list of method

        assertTrue(famixEntities.containsKey("testpackage1.innerPackage.ClassInnerPackage(java.lang.String,int,testpackage1.Testclass1)'parameter2"));
        FamixParameter parsed = (FamixParameter) famixEntities.get("testpackage1.innerPackage.ClassInnerPackage(java.lang.String,int,testpackage1.Testclass1)'parameter2");
        assertEquals("FamixParameter",parsed.getType());
        assertEquals("parameter", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.innerPackage.ClassInnerPackage(java.lang.String,int,testpackage1.Testclass1)"), parsed.getParent());
        assertEquals("testpackage1.innerPackage.ClassInnerPackage(java.lang.String,int,testpackage1.Testclass1)'parameter2", parsed.getUniqueName());
        assertEquals(-1, parsed.getModifiers());
        assertEquals(famixEntities.get("int"), parsed.getDeclaredClass());
        assertEquals((Integer)1, parsed.getParamIndex());
    }


    @Test
    public void inheritanceTest(){
        //Tests whether an extends-relationship (inheritance) is contained in hashmap of entities,
        // has correctly set type, fromEntity and toEntity
        //key 7
        assertTrue(famixAssociations.containsKey(7));
        FamixInheritance parsed = (FamixInheritance) famixAssociations.get(7);
        assertEquals("FamixInheritance",parsed.getType());
        assertEquals("extends", parsed.getfType());
        assertEquals(famixEntities.get("testpackage3.TestEnum"), parsed.getFromEntity());
        assertEquals(famixEntities.get("java.lang.Enum"), parsed.getToEntity());
    }

    @Test
    public void subtypingTest(){
        //Tests whether an implements-relationship (subtyping) is contained in hashmap of entities,
        // has correctly set type, fromEntity and toEntity
        //key 6
        assertTrue(famixAssociations.containsKey(6));
        FamixSubtyping parsed = (FamixSubtyping) famixAssociations.get(6);
        assertEquals("FamixSubtyping",parsed.getType());
        assertEquals("implements", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.innerPackage.ClassInnerPackage"), parsed.getFromEntity());
        assertEquals(famixEntities.get("java.lang.Runnable"), parsed.getToEntity());
    }

    @Test
    public void associationTest(){
        //Tests whether an association-relationship (e.g. return type relationship) is contained in hashmap of entities,
        // has correctly set type, fromEntity and toEntity
        //key 1
        assertTrue(famixAssociations.containsKey(1));
        FamixAssociation parsed = (FamixAssociation) famixAssociations.get(1);
        assertEquals("FamixAssociation",parsed.getType());
        assertEquals("returnType", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.Testclass1.testClass1Method(java.lang.String,int)"), parsed.getFromEntity());
        assertEquals(famixEntities.get("void"), parsed.getToEntity());
    }

    @Test
    public void invocationTest(){
        //Tests whether an invocation-relationship (method call) is contained in hashmap of entities,
        // has correctly set type, fromEntity and toEntity
        //key 12
        assertTrue(famixAssociations.containsKey(12));
        FamixInvocation parsed = (FamixInvocation) famixAssociations.get(12);
        assertEquals("FamixInvocation",parsed.getType());
        assertEquals("invocation", parsed.getfType());
        assertEquals(famixEntities.get("testpackage3.TestEnum()"), parsed.getFromEntity());
        assertEquals(famixEntities.get("java.lang.Enum(java.lang.String,int)"), parsed.getToEntity());
    }

    @Test
    public void accessTest(){
        //Tests whether an access-relationship (class attribute access) is contained in hashmap of entities,
        // has correctly set type, fromEntity and toEntity
        //key 13
        assertTrue(famixAssociations.containsKey(13));
        FamixAccess parsed = (FamixAccess) famixAssociations.get(13);;
        assertEquals("FamixAccess",parsed.getType());
        assertEquals("access", parsed.getfType());
        assertEquals(famixEntities.get("testpackage1.Testclass1$1anonymClass.changeString()"), parsed.getFromEntity());
        assertEquals(famixEntities.get("<unknown>#anonymClassString"), parsed.getToEntity());
    }
}
