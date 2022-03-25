package junitTests;

import analysis.IVC;
import org.junit.Before;
import org.junit.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.Assert.assertEquals;

public class IntegrationTests {
    IVC ivc;
    @Before
    public void createIVC() throws Exception {
        ivc = new IVC();
        ivc.setProjectPath("C:\\Users\\semme\\Documents\\IntegrationTest");
        ivc.startIVC();

    }

    @Test
    public void pathTest(){

        assertThrows(ArithmeticException.class,
                () -> {
                    //;
                });
    }


}
