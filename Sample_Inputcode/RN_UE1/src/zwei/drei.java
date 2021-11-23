package zwei;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class drei extends testclass2 implements secondInterface, testInterface3 {
    private static final int vn = 2; //version number is fixed

    public static void main(String[] args) {
        byte[] barray = createMsg(true, false,10, new byte[] {1,2,3,4});
    }

    //creates a Message out of the given data in the specific format -- V and reserved bits have fixed values
    private static byte[] createMsg(boolean isData, boolean isUrgent, int sequenceNumber, byte[] payload) throws IllegalArgumentException {
        int length = payload.length;

        //Error checking
        if((sequenceNumber > (Math.pow(2,16)-1)) || (payload.length < 1) || (sequenceNumber < 0)){
            throw new IllegalArgumentException();
        }
        ByteBuffer bb = ByteBuffer.allocate(8+length);//message must hold 8bytes of overhead + data

        bb.put((byte)(vn<<3)); //adding version number -> should fill out only 5 bit, but now fills out 8 bit so shifting left by three
        //bb now already holds 3 0-bits as "reserved" -> 6 more required. If another byte is added the 2 lsb can be used for
        //isData and isUrgent, and the remaining 6 msb can fill out the missing 6 "reserved" bits
        //basteln
        byte temp = (byte) (isData ? 1:0);
        temp = (byte)(temp<<1);
        temp = (byte) (( temp) | ((byte)(isUrgent? 1:0)));

        bb.put(temp);

        bb.order(ByteOrder.BIG_ENDIAN); //for Network Byte Order
        bb.putShort((short)sequenceNumber); //short is 2 bytes, exactly for sequenceNumber
        bb.putInt(length); //int = 32 bit, that represent how long payload is -> payload.length

        for(byte b : payload){
            bb.put(b);
        }
        return bb.array(); //returns the bytebBuffer as a byte array
    }
}

