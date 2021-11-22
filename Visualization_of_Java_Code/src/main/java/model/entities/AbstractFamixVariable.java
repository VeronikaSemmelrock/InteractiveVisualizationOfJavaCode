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
import javax.persistence.ManyToOne;

/**
 * Abstract base class of entities representing class attributes, local variables, and formal parameters. The different
 * types are represented by corresponding sub-classe.
 * 
 * @author pinzger
 */
@Entity
public abstract class AbstractFamixVariable extends AbstractFamixEntity {

    /**
     * The data type of the variable.
     */
    private FamixClass fDeclaredClass;

    /**
     * The default constructor.
     */
    public AbstractFamixVariable() {
        super();
    }

    /**
     * The constructor.
     * 
     * @param uniqueName Unique name.
     */
    public AbstractFamixVariable(String uniqueName) {
        super(uniqueName);
    }

    /**
     * The constructor.
     * 
     * @param uniqueName Unique name.
     * @param parent Parent entity.
     */
    public AbstractFamixVariable(String uniqueName, AbstractFamixEntity parent) {
        super(uniqueName, parent);
    }

    /**
     * Returns the declared data type.
     * 
     * @return The declared data type.
     */
    @ManyToOne
    public FamixClass getDeclaredClass() {
        return fDeclaredClass;
    }

    /**
     * Sets the declared data type.
     * 
     * @param declaredClass The declared data type.
     */
    public void setDeclaredClass(FamixClass declaredClass) {
        this.fDeclaredClass = declaredClass;
    }
}
