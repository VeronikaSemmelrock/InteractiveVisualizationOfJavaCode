/*
 * Copyright 2009 University of Zurich, Switzerland
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package model.entities;

import javax.persistence.*;
import java.util.*;

/**
 * Entity representing a method.
 * 
 * @author pinzger
 */
@Entity
public class FamixMethod extends AbstractFamixEntity {

    /**
     * The return type.
     */
    private FamixClass fDeclaredReturnClass;
    /**
     * List of contained anonymous classes.
     */
    private Set<FamixClass> fAnonymClasses = new HashSet<FamixClass>();
    /**
     * List of declared formal parameters.
     */
    private List<FamixParameter> fParameters = new LinkedList<FamixParameter>();
    /**
     * List of contained local variable declarations.
     */
    private Set<FamixLocalVariable> fLocalVariables = new HashSet<FamixLocalVariable>();

    /**
     * The default constructor.
     */
    public FamixMethod() {
        super();
    }

    /**
     * The constructor.
     * 
     * @param uniqueName
     *            Unique name.
     */
    public FamixMethod(String uniqueName) {
        super(uniqueName);
    }

    /**
     * The constructor.
     * 
     * @param uniqueName
     *            Unique name.
     * @param parent
     *            Parent entity containing the method (usually a class)
     */
    public FamixMethod(String uniqueName, AbstractFamixEntity parent) {
        super(uniqueName, parent);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public FamixMethod clone() {
        FamixMethod copy = (FamixMethod) super.clone();
        copyParentLinksTo(copy);
        return copy;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transient
    public Set<AbstractFamixEntity> getChildren() {
        Set<AbstractFamixEntity> children = new HashSet<AbstractFamixEntity>();
        children.addAll(getParameters());
        children.addAll(getAnonymClasses());
        children.addAll(getLocalVariables());
        return children;
    }

    /**
     * Helper method for cloning a method object.
     * 
     * @param newParent
     *            The new method object.
     */
    @Transient
    @Deprecated
    public void copyParentLinksTo(FamixMethod newParent) {
        Vector<AbstractFamixEntity> children = new Vector<AbstractFamixEntity>();
        children.addAll(fAnonymClasses); // copy all contained entities
        children.addAll(fParameters);
        children.addAll(fLocalVariables);
        for (AbstractFamixEntity child : children) {
            child.setParent(newParent);
        }
    }

    /**
     * Returns the return type.
     * 
     * @return The return type.
     */
    @ManyToOne
    public FamixClass getDeclaredReturnClass() {
        return fDeclaredReturnClass;
    }

    /**
     * Sets the return type.
     * 
     * @param declaredReturnClass
     *            The declared return type.
     */
    public void setDeclaredReturnClass(FamixClass declaredReturnClass) {
        this.fDeclaredReturnClass = declaredReturnClass;
    }

    /**
     * Returns the list of formal parameters.
     * 
     * @return The list of formal parameters.
     */
    @OneToMany(targetEntity = FamixParameter.class)
    @JoinTable(name = "Method_Parameter", joinColumns = {@JoinColumn(name = "method_id")}, inverseJoinColumns = @JoinColumn(name = "parameter_id"))
    public List<FamixParameter> getParameters() {
        return fParameters;
    }

    /**
     * Returns the list of local variables.
     * 
     * @return The list of local variables.
     */
    @OneToMany(targetEntity = FamixLocalVariable.class)
    @JoinTable(name = "Method_LocalVariable", joinColumns = {@JoinColumn(name = "method_id")}, inverseJoinColumns = @JoinColumn(name = "localvariable_id"))
    public Set<FamixLocalVariable> getLocalVariables() {
        return fLocalVariables;
    }

    /**
     * Returns the list of anonymous classes.
     * 
     * @return The list of anonymous classes.
     */
    @OneToMany
    @JoinTable(name = "Method_AnonymClass", joinColumns = {@JoinColumn(name = "method_id")}, inverseJoinColumns = @JoinColumn(name = "anonymClasses_id"))
    public Set<FamixClass> getAnonymClasses() {
        return fAnonymClasses;
    }

    /**
     * Sets the list of formal parameters.
     * 
     * @param parameters
     *            The list of formal parameters.
     */
    public void setParameters(List<FamixParameter> parameters) {
        this.fParameters = parameters;
    }

    /**
     * Sets the list of local variables.
     * 
     * @param localVariables
     *            The list of local variables.
     */
    public void setLocalVariables(Set<FamixLocalVariable> localVariables) {
        this.fLocalVariables = localVariables;
    }

    /**
     * Sets the list of anonymous classes.
     * 
     * @param anonymClasses
     *            The list of anonymous classes.
     */
    public void setAnonymClasses(Set<FamixClass> anonymClasses) {
        this.fAnonymClasses = anonymClasses;
    }
}
