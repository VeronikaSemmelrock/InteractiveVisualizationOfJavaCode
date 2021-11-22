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
 * FAMIX entity representing field read/write access relationships.
 * 
 * @author pinzger
 */
@Entity
public class FamixAccess extends FamixAssociation {

    /**
     * The default constructor.
     */
    public FamixAccess() {
        super();
    }

    /**
     * The constructor.
     * 
     * @param method The accessor method.
     * @param variable The variable that is being accessed.
     */
    public FamixAccess(FamixMethod method, AbstractFamixVariable variable) {
        super(method, variable);
    }

    /**
     * Returns the accessor method.
     * 
     * @return Returns the accessor method.
     */
    @Transient
    public FamixMethod getAccessedIn() {
        return (FamixMethod) getFromEntity();
    }

    /**
     * Returns the accessed field.
     * 
     * @return Returns the accessed field.
     */
    @Transient
    public AbstractFamixVariable getAccesses() {
        return (AbstractFamixVariable) getToEntity();
    }

    /**
     * Sets the accessed field.
     * 
     * @param accesses The accessed field.
     */
    public void setAccesses(AbstractFamixVariable accesses) {
        setToEntity(accesses);
    }

    /**
     * Sets the accessor method.
     * 
     * @param method The accessor method.
     */
    public void setAccessedIn(FamixMethod method) {
        setFromEntity(method);
    }
}
