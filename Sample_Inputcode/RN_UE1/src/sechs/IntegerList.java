package sechs;

public class IntegerList { //same instance of this class is used by multiple threads -> class must be implemented thread-safe!
    protected int[] data;
    protected int size;
    private static final int DEFAULT_SIZE = 10;

    protected int nextfree = 0; //list is filled from index 0 on, values are always added to "next free" index, if list is full adding starts at index 0 again

    public IntegerList( ) {
        data = new int[DEFAULT_SIZE];
        size = DEFAULT_SIZE;
        for (int i =0; i<size; i++){
            data[i] = i;
        }
    }


    /*public IntegerList(IntegerList toCopy) {
        /** * copy the original */
    //}

    public synchronized int get(int index){ //return integer stored at index
        return data[index];
    }

    public synchronized void add(int value){ //add a new value to the integer list
        this.data[this.nextfree] = value;
        this.nextfree++;
        if(this.nextfree > (size-1)){
            this.nextfree = 0;
        }
    }

    public synchronized void clear(){ //deletes all integers (sets them to 0)
        for(int i =0; i<this.data.length; i++){
            this.data[i] = 0;
        }
    }

    public synchronized void setCapacity(int n){ //Reallocates the data array increasing or decreasing its size to n
        int[] temp = new int[n];

        if(n>=data.length){//if the new array is bigger, fill the new spaces with 0
            for(int i = 0; i<this.data.length; i++){
                temp[i] = this.data[i];
            }
            for(int i = this.data.length; i<temp.length; i++){
                temp[i] = 0;
            }
        }else{
            for(int i = 0; i<temp.length; i++){
                temp[i] = this.data[i];
            }
        }

        //fix nextfree index
        if(this.nextfree > (n-1)){
            nextfree = n-1;
        }
        this.size = n;
        this.data = temp;
    }

    public synchronized int[] toArray(){ //Returns a copy of the integer list and returns it
        return this.data;
    }

}
