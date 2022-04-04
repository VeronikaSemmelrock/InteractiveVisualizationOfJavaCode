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
 * Abstract base class of FAMIX entities and associations.
 * 
 * @author pinzger
 */
@MappedSuperclass
public abstract class AbstractFamixObject implements Cloneable {

    /** Delimiter for computing the hash string. */
    protected static final String HASH_STRING_DELIMITER = ":";

    /**
     * The location of the entity/association in the source code.
     */
    private SourceAnchor fSourceAnchor;

    /**
     * List of comments - currently not supported by the FAMIX importer.
     */
    private Set<String> fComments = new HashSet<String>();

    /**
     * Set of properties.
     */
    private Set<String> fProperties = new HashSet<String>();

    /**
     * The type of the assoctiation as String. For serialization.
     */
    private String fType;

    /**
     * Unique name of parent as string, because parent itself is left out of serialization (transient).
     */
    private String fParentAsString = "null";

    /**
     * The default constructor.
     */
    public AbstractFamixObject() {
        super();
    }

    /**
     * Returns the source anchor.
     * 
     * @return The source anchor.
     */
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(nullable = true, name = "sourceanchor_fk")
    public SourceAnchor getSourceAnchor() {
        return fSourceAnchor;
    }

    /**
     * Sets the source anchor.
     * 
     * @param sourceAnchor
     *            The source anchor.
     */
    public void setSourceAnchor(SourceAnchor sourceAnchor) {
        fSourceAnchor = sourceAnchor;
    }

    /**
     * Returns the comments.
     * 
     * @return The comments.
     */
    @Transient
    public Set<String> getComments() {
        return fComments;
    }

    /**
     * Sets the comments.
     * 
     * @param comments
     *            The comments.
     */
    public void setComments(Set<String> comments) {
        fComments = comments;
    }

    /**
     * Returns the properties.
     * 
     * @return The properties.
     */
    @Transient
    public Set<String> getProperties() {
        return fProperties;
    }

    /**
     * Sets the properties.
     * 
     * @param properties
     *            The properties.
     */
    public void setProperties(Set<String> properties) {
        fProperties = properties;
    }

    /**
     * Returns the type.
     * 
     * @return The FAMIX class name.
     */
    @Transient
    public String getType() {
        String fullClassName = this.getClass().getName();
        return fullClassName.substring(fullClassName.lastIndexOf(".") + 1);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AbstractFamixObject clone() {
        try {
            AbstractFamixObject copy = (AbstractFamixObject) super.clone();
            return copy;
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }

        return null;
    }

    /**
     * {@inheritDoc}
     */
    @Transient
    public String getLabel() {
        return null;
    }

    /**
     * {@inheritDoc}
     */
    @Transient
    public String getURI() {
        // Override in subclasses
        return null;
    }

    /**
     * Sets the type of the object.
     */
    public void setType(String type) {
        this.fType = type;
    }

    public String getfType() {
        return fType;
    }

    /**
     * Sets the unique name of the parent of the entitiy as fParentAsString.
     */
    public void setParentString(String fParentAsString) {
        this.fParentAsString = fParentAsString;
    }

}
