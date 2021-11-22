package sieben;

import java.util.ArrayList;
import java.util.Stack;
import java.lang.Thread;

public class Main {
    public static final int num_producer = 1;
    public static final int num_consumer = 1;

    public static void main(String[] args) throws InterruptedException {
        Stack<Integer> sharedStack = new Stack<>();

        Thread[] threads = new Thread[num_producer+num_consumer];
        //create consumers
        for(int i = 0; i<num_consumer; i++){
            threads[i] = new Consumer(sharedStack);
        }
        //create producers
        for(int i = num_consumer; i<num_producer+num_consumer; i++){
            threads[i] = new Producer(sharedStack);
        }

        //start threads
        for( int i = 0; i<num_consumer+num_producer; i++){
            threads[i].start();
        }

        //join threads
        for( int i = 0; i<num_consumer+num_producer; i++)
            threads[i].join();
        }

}