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
 * Entity representing a class attribute (i.e., field).
 * 
 * @author pinzger
 */
@Entity
public class FamixAttribute extends AbstractFamixVariable {

    /**
     * The default constructor.
     */
    public FamixAttribute() {
        super();
    }

    /**
     * The constructor.
     * 
     * @param uniqueName
     *            Unique name of the attribute.
     */
    public FamixAttribute(String uniqueName) {
        super(uniqueName);
    }

    /**
     * The constructor.
     * 
     * @param uniqueName
     *            Unique name of the attribute.
     * @param parent
     *            The parent entity of the attribute (usually a class).
     */
    public FamixAttribute(String uniqueName, AbstractFamixEntity parent) {
        super(uniqueName, parent);
    }
}
