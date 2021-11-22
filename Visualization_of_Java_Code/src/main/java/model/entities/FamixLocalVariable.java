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

import org.apache.log4j.Logger;

import javax.persistence.Entity;
import javax.persistence.Transient;

/**
 * Entity representing a local variable.
 * 
 * @author pinzger
 */
@Entity
public class FamixLocalVariable extends AbstractFamixVariable {

    /**
     * The logger.

    private static Logger sLogger = FamixModelPlugin.getLogManager().getLogger(FamixLocalVariable.class.getName());
*/
    /**
     * The default constructor.
     */
    public FamixLocalVariable() {
        super();
    }

    /**
     * The constructor.
     * 
     * @param uniqueName
     *            Unique name.
     */
    public FamixLocalVariable(String uniqueName) {
        super(uniqueName);
    }

    /**
     * The constructor.
     * 
     * @param uniqueName
     *            Unique name.
     * @param parent
     *            FamixMethod containing the local variable.
     */
    public FamixLocalVariable(String uniqueName, FamixMethod parent) {
        super(uniqueName, parent);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean equals(Object obj) {
        if (!super.equals(obj)) {
            return false;
        }
        if (getSourceAnchor() != null) {
            return getSourceAnchor().equals(((FamixLocalVariable) obj).getSourceAnchor());
        } else {
            //sLogger.warn("EQUALS: " + this.getClass().getName() + HASH_STRING_DELIMITER + getUniqueName()
              //      + " has no SourceAnchor");
            return true;
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public int hashCode() {
        String hashString = this.getClass().getName() + HASH_STRING_DELIMITER + getUniqueName();

        if (getSourceAnchor() == null) {
            //sLogger.warn("HASHCODE: " + this.getClass().getName() + HASH_STRING_DELIMITER + getUniqueName()
              //      + " has no SourceAnchor");
        } else {
            hashString += getSourceAnchor().getFile() + HASH_STRING_DELIMITER + getSourceAnchor().getEndPos();
        }

        return hashString.hashCode();
    }
    
    /**
     * {@inheritDoc}
     */
    @Transient
    @Override
    public String getURI() {
    	String uriString = getUniqueName();
    	if (getSourceAnchor() != null) {
    		uriString += HASH_STRING_DELIMITER + getSourceAnchor().getEndPos();
    	}
    	
    	return uriString;
    }
}
