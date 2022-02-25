package vier;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;

public class TheRealThing extends Thread {
    private static float result = 0;
    private String filename;
    private int start;
    private int end;
    private static FileInputStream in;
    private static InputStreamReader r;
    private static BufferedReader br;
    private static float[] data;

    /** * Creates a new TheRealThing thread which operates on the indexes start to end. */
    public TheRealThing(String filename, int start, int end) {
        this.filename = filename;
        this.start = start;
        this.end = end;
    }

    /** * Performs "eine komplizierte Berechnung" on array and * returns the result */
    public float eine_leichte_Berechnung(float[] array) {//easy calc for error checking
        float tempresult = (float) 0.0;
        for(int i = 0; i<array.length; i++){
            tempresult += array[i];
        }
        return tempresult;

    }


    public void run() {
        //extract sub float-array from float[] data - only the indexes that this thread has to process!
        float[] threaddata = new float[end-start+1]; //e.g. thread has to process 1-3 -> 3-1 = 2 +1 = 3 entries
        int j = 0;
        for(int i = start; i<= end; i++, j++){
            threaddata[j] = data[i];
        }

        //call calculation
        float threadresult = eine_leichte_Berechnung(threaddata);

        //add threadresult to global result - mutual exclusion!
        add(threadresult);

        //then thread is done
    }

    public synchronized void add(float threadresult){
        result += threadresult;
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        String pathToFile = "./input/data.dat";
        int numThreads = 12;

        //reading from file and parsing it into a float-array and extracting all other info
        in = new FileInputStream(pathToFile);
        r = new InputStreamReader(in);
        br = new BufferedReader(r);
        String line = br.readLine();
        String[] input = line.split(",");
        String desc = input[0];
        int id = Integer.parseInt(input[1]);
        int arraySize = Integer.parseInt(input[2]);
        data = new float[arraySize];
        for(int i = 3; i<arraySize+3; i++){
            data[i-3] = Float.parseFloat(input[i]);
        }

        //dividing up the array for the threads
        int left = arraySize%numThreads; //calculating how much left overs have to be divided up between threads
        int normalSlice = (arraySize-left)/numThreads;//division without leftovers
        int[] sliceSizes = new int[numThreads]; //array that holds how many entries each thread has to process
        for(int i = 0; i<sliceSizes.length; i++){//filling array
            sliceSizes[i] = normalSlice;
        }
        if(left!=0){//if there is something left (during division) that needs to be divided up
            for(int i =0; i<left; i++){
                sliceSizes[i]++;//thread has to process one more entry
            }
        }


        //creating the threads with their specific indexes what they need to process depending on their sliceSizes and adding to list
        //attention! Handling indexes!
        ArrayList<Thread> threads = new ArrayList<>();
        int start = 0;
        for(int i = 0; i<numThreads; i++){
            threads.add(new TheRealThing(pathToFile, start, start+sliceSizes[i]-1));
            start += sliceSizes[i];
        }

        //starting
        for(Thread t : threads){
            t.start();
        }

        //joining again
        for(Thread t : threads){
            t.join();
        }

        //printing result
        System.out.print("Result of the calculations: "+result);

    }
}