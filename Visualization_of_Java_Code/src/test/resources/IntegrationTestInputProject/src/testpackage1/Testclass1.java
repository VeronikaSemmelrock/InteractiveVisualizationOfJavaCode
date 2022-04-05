package testpackage1;

import testpackage2.TestInterface;
import testpackage3.TestEnum;

public class Testclass1 implements TestInterface {
    public String testClass1Attribute = "testClassAttribute";

    @Override
    public void run() {
        class anonymClass{
           public void changeString(){
               anonymClassString = anonymClassString+" rest of String";
           }
        }
        class anonymClass2{

        }
    }



    public void testClass1Method(String param1, int param2){
        innerClass.innerClassTestMethod("Test");
    }


    public class innerClass{
        private String test;
        public int testInt = 4;

        public static int innerClassTestMethod(String string){
            System.out.println(string);
            return 0;
        }
    }
}
