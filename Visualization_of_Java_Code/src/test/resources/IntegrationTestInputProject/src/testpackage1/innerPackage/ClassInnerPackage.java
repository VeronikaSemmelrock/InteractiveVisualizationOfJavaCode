package testpackage1.innerPackage;

import model.entities.FamixClass;
import org.junit.Test;
import testpackage1.Testclass1;

import static org.junit.Assert.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ClassInnerPackage extends Testclass1 implements Runnable{
    private static int innerClassAttribute = 10;

    public ClassInnerPackage(String parameter1, int parameter2, Testclass1 parameter3){
        int infoAmount = 10;
        testClass1Method("Test", infoAmount);
        infoAmount = 12;
        int newAmount = infoAmount+10;
    }
}
