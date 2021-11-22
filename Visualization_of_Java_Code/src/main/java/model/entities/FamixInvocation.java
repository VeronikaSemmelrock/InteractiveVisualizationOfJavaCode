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
 * Entity representing a method invocation.
 * 
 * @author pinzger
 */
@Entity
public class FamixInvocation extends FamixAssociation {

    /**
     * The default constructor
     */
    public FamixInvocation() {
        super();
    }

    /**
     * The constructor
     * 
     * @param caller
     *            method containing the call (i.e., caller)
     * @param callee
     *            method that is called (i.e., callee)
     */
    public FamixInvocation(FamixMethod caller, FamixMethod callee) {
        super(caller, callee);
    }

    /**
     * Returns the caller method.
     * 
     * @return The caller method.
     */
    @Transient
    public FamixMethod getInvokedBy() {
        return (FamixMethod) getFromEntity();
    }

    /**
     * Returns the callee method.
     * 
     * @return The callee method.
     */
    @Transient
    public FamixMethod getInvokes() {
        return (FamixMethod) getToEntity();
    }

    /**
     * Sets the callee method.
     * 
     * @param invokes
     *            The callee method.
     */
    public void setInvokes(FamixMethod invokes) {
        setToEntity(invokes);
    }

    /**
     * Sets the caller method.
     * 
     * @param invokedBy
     *            The caller method.
     */
    public void setInvokedBy(FamixMethod invokedBy) {
        setFromEntity(invokedBy);
    }
}
