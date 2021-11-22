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

/**
 * Entity representing a formal parameter.
 * 
 * @author pinzger
 */
@Entity
public class FamixParameter extends AbstractFamixVariable {

    /**
     * Position of the parameter in the method declaration.
     */
    private Integer fParamIndex;

    /**
     * Default constructor.
     */
    public FamixParameter() {
        super();
    }

    /**
     * The constructor.
     * 
     * @param uniqueName
     *            Unique name.
     */
    public FamixParameter(String uniqueName) {
        super(uniqueName);
    }

    /**
     * The constructor.
     * 
     * @param name
     *            Unique name.
     * @param parent
     *            FamixMethod declaring the formal parameter.
     * @param paramIndex
     *            Position of the parameter.
     */
    public FamixParameter(String name, FamixMethod parent, Integer paramIndex) {
        super(name, parent);
        this.fParamIndex = paramIndex;
    }

    /**
     * Returns the position.
     * 
     * @return The position.
     */
    public Integer getParamIndex() {
        return fParamIndex;
    }

    /**
     * Sets the position.
     * 
     * @param position
     *            The position.
     */
    public void setParamIndex(Integer paramIndex) {
        this.fParamIndex = paramIndex;
    }
}
