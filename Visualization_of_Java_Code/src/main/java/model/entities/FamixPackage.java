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
 * Entity representing a package.
 * 
 * @author pinzger
 */
@Entity
public class FamixPackage extends AbstractFamixEntity  {

    /**
     * Contained top level fClasses.
     */
    private Set<FamixClass> fClasses = new HashSet<FamixClass>();

    /**
     * The default constructor.
     */
    public FamixPackage() {
        super();
    }

    /**
     * The constructor.
     * 
     * @param uniqueName Unique name.
     */
    public FamixPackage(String uniqueName) {
        super(uniqueName);
    }

    /**
     * The constructor
     * 
     * @param uniqueName Unique name.
     * @param parent The parent package.
     */
    public FamixPackage(String uniqueName, FamixPackage parent) {
        super(uniqueName, parent);
    }

    /**
     * Splits a given name in multiple sub-packages by tearing it at the dots.
     * 
     * @param name The package name.
     * @return An array of package names.
     */
    public static String[] splitName(String name) {
        return name.split("\\.");
    }

    /**
     * Check if a given name is a full name (containing dots separating parent/child) or a simple name of a package.
     * 
     * @param name The package name.
     * @return true, if given string is a simple name
     */
    public static boolean isSimpleName(String name) {
        return !(name.lastIndexOf('.') > -1);
    }

    /**
     * Returns the contained top-level classes.
     * 
     * @return The contained top-level classes.
     */
    @OneToMany
    @JoinTable(name = "Package_Class", joinColumns = { @JoinColumn(name = "package_id") }, inverseJoinColumns = @JoinColumn(name = "class_id"))
    public Set<FamixClass> getClasses() {
        return fClasses;
    }

    /** 
     * {@inheritDoc}
     */
    @Override
    @Transient
    public Set<AbstractFamixEntity> getChildren() {
        Set<AbstractFamixEntity> lEntities = new HashSet<AbstractFamixEntity>();
        lEntities.addAll(getClasses());

        return lEntities;
    }

    /**
     * Sets the set of top-level classes.
     * 
     * @param classes The contained top-level classes.
     */
    public void setClasses(Set<FamixClass> classes) {
        this.fClasses = classes;
    }

    /** 
     * {@inheritDoc}
     */

    @Transient
    public String getSource() {
        return null;
    }
}
