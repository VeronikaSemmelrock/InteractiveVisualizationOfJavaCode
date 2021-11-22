package zwei;
import java.io.*;
import java.util.Scanner;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class zwei {

    public static void main(String[] args) {
        InputStream in;
        OutputStream out;
        ZipOutputStream zip;
        InputStreamReader r;
        OutputStreamWriter w;
        BufferedReader br;
        BufferedWriter bw;
        String line;

        //Reading input file name from user
        Scanner scanner = new Scanner(System.in);
        System.out.println("Please input the name of the input file!");
        String filein = scanner.nextLine();

        //Reading output file name from user
        System.out.println("Please input the name of the output file!");
        String fileout = scanner.nextLine();

        try {
            //creating underlying input and output streams with the file names
            in = new FileInputStream("input/"+filein);
            out = new FileOutputStream("out.zip");

            //creating a ZipOutputStream and a txt-file inside the zip directory and setting so the output stream writes to it
            zip = new ZipOutputStream(out);
            ZipEntry entry = new ZipEntry(fileout);
            zip.putNextEntry(entry);

            //using Readers and Writers for encoding
            r = new InputStreamReader(in, "UTF8");
            w = new OutputStreamWriter(zip, "ISO-8859-1");

            //using buffers for performance
            br = new BufferedReader(r);
            bw = new BufferedWriter(w);

            //processing
            while ((line = br.readLine()) != null) {//BufferedReader -> InputStreamReader -> InputStream is read
                //line no longer holds line feed. Adding carriage return and line feed is required
                line += "\r\n";
                bw.write(line); //writes to BufferedWriter -> OutputStreamWriter -> OutputStream
            }

            //closing
            bw.close();
            zip.close();
            br.close();
            r.close();
            w.close();
            in.close();
            out.close();
            scanner.close();

        } catch (FileNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            System.out.println("The input file could not be found!");
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
            System.out.println("Something went wrong in the zipping process!");
        }

    }
}



