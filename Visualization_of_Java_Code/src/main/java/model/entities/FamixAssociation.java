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

import javax.persistence.*;

/**
 * Entity representing general associations between FAMIX entities
 * 
 * @author pinzger
 */
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
public class FamixAssociation extends AbstractFamixObject {

    /**
     * The entity ID (set by Hibernate).
     */
    private Long fId;
    /**
     * The source entity of a FAMIX association.
     */
    private AbstractFamixEntity fFromEntity;

    /**
     * The target entity of a FAMIX association.
     */
    private AbstractFamixEntity fToEntity;

    /**
     * The source code statement implementing the association.
     */
//    private String fStatement;

    private String fType;

    /**
     * The default constructor.
     */
    public FamixAssociation() {
        super();
    }

    /**
     * The constructor
     * 
     * @param from The source entity.
     * @param to The target entity.
     */
    public FamixAssociation(AbstractFamixEntity from, AbstractFamixEntity to) {
        this.fFromEntity = from;
        this.fToEntity = to;
    }

    /**
     * Sets the Hibernate ID.
     * 
     * @param id The Hibernate ID.
     */
    protected void setId(Long id) {
        this.fId = id;
    }

    /**
     * Returns the Hibernate ID
     * 
     * @return Returns The Hibernate ID.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public Long getId() {
        return fId;
    }

    /**
     * Returns the source entity.
     * 
     * @return Returns The source entity.
     */
    @ManyToOne
    public AbstractFamixEntity getFromEntity() {
        return fFromEntity;
    }

    /**
     * Sets the source entity.
     * 
     * @param from The source entity.
     */
    public void setFromEntity(AbstractFamixEntity from) {
        this.fFromEntity = from;
    }

    /**
     * Returns the target entity.
     * 
     * @return Returns The target entity.
     */
    @ManyToOne
    public AbstractFamixEntity getToEntity() {
        return fToEntity;
    }

    /**
     * Sets the target entity.
     * 
     * @param to The target entity.
     */
    public void setToEntity(AbstractFamixEntity to) {
        this.fToEntity = to;
    }

    /** 
     * {@inheritDoc}
     */
    @Override
    public int hashCode() {
        String hashString =
                this.getClass().getName() + HASH_STRING_DELIMITER + getFromEntity().getUniqueName() + HASH_STRING_DELIMITER
                        + getToEntity().getUniqueName();

        /**if (getSourceAnchor() == null) {
            sLogger.warn("HASHCODE: " + this.getClass().getName() + " association from " + getFromEntity().getUniqueName()
                    + " to " + getToEntity().getUniqueName() + " has no SourceAnchor");
        } else {
            hashString += getSourceAnchor().getFile() + HASH_STRING_DELIMITER + getSourceAnchor().getEndPos();
        }
         */
        return hashString.hashCode();

    }

    /** 
     * {@inheritDoc}
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof FamixAssociation)) {
            return false;
        }
        if (!(obj.getClass().getName().equals(this.getClass().getName()))) {
            return false;
        }
        if (!getFromEntity().equals(((FamixAssociation) obj).getFromEntity())) {
            return false;
        }
        if (!getToEntity().equals(((FamixAssociation) obj).getToEntity())) {
            return false;
        }
        if (getSourceAnchor() != null) {
            return getSourceAnchor().equals(((FamixAssociation) obj).getSourceAnchor());
        } else {
            //sLogger.warn("EQUALS: " + this.getClass().getName() + " association fFromEntity " + getFromEntity().getUniqueName()
              //      + " fToEntity " + getToEntity().getUniqueName() + " has no SourceAnchor");
            return true;
        }
    }

    /**
     * Returns the source code statement.
     * 
     * @return The source code statement representing the association.
     */
//    @Lob
//    public String getStatement() {
//        return fStatement;
//    }

    /**
     * Sets the source code statement.
     * 
     * @param statement The source code statement.
     */
//    public void setStatement(String statement) {
//        this.fStatement = statement;
//    }

    /** 
     * {@inheritDoc}
     */
    @Override
    public String toString() {
        return getType() + ": " + getFromEntity().toString() + " -> " + getToEntity().toString();
    }

    /** 
     * {@inheritDoc}
     */
    @Transient
    @Override
    public String getLabel() {
        return getType() + ": " + getFromEntity().getLabel() + " -> " + getToEntity().getLabel();
    }

    /** 
     * {@inheritDoc}
     */
    @Transient
    @Override
    public String getURI() {
        String uri =
                getType() + ": " + getFromEntity().getURI() + " -> " + getToEntity().getURI() + ": " + getSourceAnchor().getURI();
        return uri;
    }

    public void setType(String type) {
        this.fType = type;
    }
}
