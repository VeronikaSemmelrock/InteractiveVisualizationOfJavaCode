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
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a Java class, interface, inner class, or anonymous class.
 * 
 * @author pinzger
 */
@Entity
public class FamixClass extends AbstractFamixEntity {

    /**
     * List of contained inner classes.
     */
    private Set<FamixClass> fInnerClasses = new HashSet<FamixClass>();
    /**
     * List of declared methods.
     */
    private Set<FamixMethod> fMethods = new HashSet<FamixMethod>();

    /**
     * List of declared attributes.
     */
    private Set<FamixAttribute> fAttributes = new HashSet<FamixAttribute>();

    /**
     * The default constructor.
     */
    public FamixClass() {
        super();
    }

    /**
     * The constructor.
     * 
     * @param uniqueName Unique name of the class.
     */
    public FamixClass(String uniqueName) {
        super(uniqueName);
    }

    /**
     * The constructor.
     * 
     * @param uniqueName Unique name of the class.
     * @param parent Parent entity contained the class declaration.
     */
    public FamixClass(String uniqueName, AbstractFamixEntity parent) {
        super(uniqueName, parent);
    }

    /**
     * Returns the list of attributes.
     * 
     * @return The list of attributes.
     */
    @OneToMany
    @JoinTable(name = "Class_Attribute", joinColumns = { @JoinColumn(name = "class_id") }, inverseJoinColumns = @JoinColumn(name = "attribute_id"))
    public Set<FamixAttribute> getAttributes() {
        return fAttributes;
    }

    /** 
     * {@inheritDoc}
     */
    @Override
    @Transient
    public Set<AbstractFamixEntity> getChildren() {
        Set<AbstractFamixEntity> lEntities = new HashSet<AbstractFamixEntity>();
        lEntities.addAll(getInnerClasses());
        lEntities.addAll(getMethods());
        lEntities.addAll(getAttributes());

        return lEntities;
    }

    /**
     * Returns the list of inner classes.
     * 
     * @return The list of inner classes.
     */
    @OneToMany
    @JoinTable(name = "Class_InnerClasse", joinColumns = { @JoinColumn(name = "class_id") }, inverseJoinColumns = @JoinColumn(name = "innerclass_id"))
    public Set<model.entities.FamixClass> getInnerClasses() {
        return fInnerClasses;
    }

    /**
     * Returns the list of methods.
     * 
     * @return The list of methods.
     */
    @OneToMany
    @JoinTable(name = "Class_Method", joinColumns = { @JoinColumn(name = "class_id") }, inverseJoinColumns = @JoinColumn(name = "method_id"))
    public Set<FamixMethod> getMethods() {
        return fMethods;
    }

    /**
     * Sets the list of attributes.
     * 
     * @param attributes The list of attributes.
     */
    public void setAttributes(Set<FamixAttribute> attributes) {
        this.fAttributes = attributes;
    }

    /**
     * Sets the list of inner classes.
     * 
     * @param innerClasses The list of inner classes.
     */
    public void setInnerClasses(Set<FamixClass> innerClasses) {
        this.fInnerClasses = innerClasses;
    }

    /**
     * Sets the list of methods.
     * 
     * @param methods The list of methods.
     */
    public void setMethods(Set<FamixMethod> methods) {
        this.fMethods = methods;
    }

    /**
     * Checks whether the class is an interface.
     * 
     * @return True, if the entity is an interface.
     */
    @Transient
    public boolean isInterface() {
        return (getModifiers() & AbstractFamixEntity.MODIFIER_INTERFACE) == AbstractFamixEntity.MODIFIER_INTERFACE;
    }

    /**
     * Checks, whether the class is an enum.
     * 
     * @return True, if the entity is an enum.
     */
    @Transient
    public boolean isEnum() {
        return (getModifiers() & AbstractFamixEntity.MODIFIER_ENUM) == AbstractFamixEntity.MODIFIER_ENUM;
    }

    /**
     * Sets the source code.
     * 
     * @param source The source code of the class.

    public void setSource(String source) {
        getContent().setSource(source);
    }
    */
}
