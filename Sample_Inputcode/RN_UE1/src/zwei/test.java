package zwei;


import javax.lang.model.SourceVersion;
import javax.tools.*;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Writer;
import java.nio.charset.Charset;
import java.util.Locale;
import java.util.Set;

public class test extends Thread implements JavaCompiler {

    @Override
    public CompilationTask getTask(Writer out, JavaFileManager fileManager, DiagnosticListener<? super JavaFileObject> diagnosticListener, Iterable<String> options, Iterable<String> classes, Iterable<? extends JavaFileObject> compilationUnits) {
        return null;
    }

    @Override
    public StandardJavaFileManager getStandardFileManager(DiagnosticListener<? super JavaFileObject> diagnosticListener, Locale locale, Charset charset) {
        return null;
    }

    @Override
    public int isSupportedOption(String option) {
        return 0;
    }

    @Override
    public int run(InputStream in, OutputStream out, OutputStream err, String... arguments) {
        return 0;
    }

    @Override
    public Set<SourceVersion> getSourceVersions() {
        return null;
    }
}
