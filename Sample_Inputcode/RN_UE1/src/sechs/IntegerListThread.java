package sechs;

import java.util.ArrayList;

public class IntegerListThread extends Thread {//thread class that always uses the same IntegerList instance
    protected static IntegerList il;
    protected int id;
    protected int value;

    public IntegerListThread(int id) {
        this.id = id;
    }

    public void run() {//generic tasks working with IntegerList
        this.il.add(this.id);//saving its own id into the list
        this.value = this.il.get(this.id); //reading from the index that corresponds to the threads id
        this.il.setCapacity(20); //just to see
    }

    public static void main(String[] args) throws InterruptedException {
        ArrayList<Thread> threads = new ArrayList<>();
        il = new IntegerList();

        //lets start 10 threads
        int i = 0;
        while(i<10){
            threads.add(new IntegerListThread(i));
            i++;
        }

        //starting
        for(Thread t : threads){
            t.start();
        }

        //joining
        for(Thread t: threads){
            t.join();
        }

    }
}
