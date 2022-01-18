package analysis;

import spoon.Launcher;
import spoon.reflect.CtModel;
import spoon.reflect.declaration.CtPackage;

public class SpoonModel {
    /**
     * The CtModel that SpoonParser outputs after parsing the java-project code
     */
    private CtModel ctModel;

    /**
     * Constructor. Creates SpoonParser CtModel on call.
     * @param projectPath
     */
    public SpoonModel(String projectPath) {
        Launcher launcher = new Launcher();
        launcher.addInputResource(projectPath);
        launcher.buildModel();
        ctModel = launcher.getModel();
    }

    /**
     * Returns the ctModel (SpoonParser output.
     * @return ctModel (SpoonParser output)
     */
    public CtModel getSpoonModel(){
        return this.ctModel;
    }
}
