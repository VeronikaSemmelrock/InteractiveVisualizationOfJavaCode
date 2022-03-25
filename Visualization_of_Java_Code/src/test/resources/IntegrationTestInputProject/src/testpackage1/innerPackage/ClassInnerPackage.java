package testpackage1.innerPackage;

import testpackage1.Testclass1;

public class ClassInnerPackage extends Testclass1 implements Runnable{
    private static int innerClassAttribute = 10;

    public ClassInnerPackage(String parameter1, int parameter2, Testclass1 parameter3){
        //constructor test
        int infoAmount = 10;
        testClass1Method("Test", infoAmount);
        infoAmount = 12;
        int newAmount = infoAmount+10;
    }
}
