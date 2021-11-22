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
 * Entity representing an instance of association, e.g., <code>object instanceof Type</code>.
 * 
 * @author pinzger
 */
@Entity
public class FamixCheckInstanceOf extends FamixAssociation {

    /**
     * The default constructor
     */
    public FamixCheckInstanceOf() {
        super();
    }

    /**
     * The constructor
     * 
     * @param from
     *            the method containing the instance
     * @param to
     *            the data type the check is for
     */
    public FamixCheckInstanceOf(FamixMethod from, FamixClass to) {
        super(from, to);
    }
}
