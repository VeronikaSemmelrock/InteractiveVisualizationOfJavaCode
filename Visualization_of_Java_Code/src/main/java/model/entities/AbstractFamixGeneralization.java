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

import javax.persistence.Entity;
import javax.persistence.Transient;

/**
 * Entity representing a generalization of a Java data type.
 * 
 * @author pinzger
 */
@Entity
public abstract class AbstractFamixGeneralization extends FamixAssociation {

    /**
     * The default constructor.
     */
    public AbstractFamixGeneralization() {
        super();
    }

    /**
     * The constructor.
     * 
     * @param subclass Sub-type.
     * @param superclass Super-type.
     */
    public AbstractFamixGeneralization(FamixClass subclass, FamixClass superclass) {
        super(subclass, superclass);
    }

    /**
     * Returns the sub-type.
     * 
     * @return The sub-type.
     */
    @Transient
    public FamixClass getSubclass() {
        return (FamixClass) getFromEntity();
    }

    /**
     * Returns the super-type.
     * 
     * @return The super-type.
     */
    @Transient
    public FamixClass getSuperclass() {
        return (FamixClass) getToEntity();
    }

    /**
     * Sets the super-type.
     * 
     * @param superclass The super-type.
     */
    public void setSuperclass(FamixClass superclass) {
        setToEntity(superclass);
    }

    /**
     * Sets the sub-type.
     * 
     * @param subclass The sub-type.
     */
    public void setSubclass(FamixClass subclass) {
        setFromEntity(subclass);
    }
}
