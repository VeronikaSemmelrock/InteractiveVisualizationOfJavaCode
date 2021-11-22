package sieben;

import java.util.Random;
import java.util.Stack;

public class Consumer extends Thread {
    private Stack<Integer> stack;
    private Random r = new Random();
    private int amount = 0;
    private int result = 0;

    public Consumer(Stack<Integer> stack) {
        this.stack = stack;
    }

    public void run() {
        //if condition is met (stack is not empty) -> check how many are in stack and choose random amount of numbers
        //-> sum them up, write them out (i guess), then wait 10ms
        while(true) {
            synchronized (this) {//only pushing when stack is not operated on right now
                //while (stack.size() < 1) try { wait();} catch (InterruptedException e) { }; //waiting until there is something on the stack, in the meantime releasing "lock"
                if(stack.size() > 1){
                    System.out.println("Size "+stack.size());
                    amount = r.nextInt(stack.size() - 1) + 1; //(max-min)+min
                    System.out.print("Consumer is consuming "+amount+" values");
                    for (int i = 0; i < amount; i++) {
                        result += stack.pop();
                    }
                    System.out.println("Result: "+result);
                    result = 0;
                    try {
                        this.sleep(1000);//sleep for 10 ms
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }

            }
        }
    }
}