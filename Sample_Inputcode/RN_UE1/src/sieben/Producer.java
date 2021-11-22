package sieben;

import java.util.Random;
import java.util.Stack;

public class Producer extends Thread {
    private Stack<Integer> stack;
    private Random r = new Random();
    private int newvalue = 0;

    public Producer(Stack<Integer> stack) {
        this.stack = stack;
    }

    public void run() {
        // Produce numbers and write them onto stack!
        while(true) {
            synchronized (this) {//only pushing when stack is not operated on right now - there is no upper limit on the stack (well kinda)
                newvalue = r.nextInt(10) + 1;
                stack.push(newvalue); //pushing random numbers from 1 to 10
                System.out.println("Producer produced: "+newvalue);
                /*try {
                    this.sleep(2000);//for easier reading
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }*/
            }
        }
    }
}