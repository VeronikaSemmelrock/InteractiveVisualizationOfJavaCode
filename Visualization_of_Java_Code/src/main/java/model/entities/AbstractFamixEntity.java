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

//import model.resources.entities.misc.Content;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * The base class representing a FAMIX entity.
 * 
 * @author pinzger
 */
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
public abstract class AbstractFamixEntity extends AbstractFamixObject{

    /** Name of the default package. */
    public static final String DEFAULT_PACKAGE_NAME = "<DEFAULT PACKAGE>";

    /** Name of array types. */
    public static final String ARRAY_TYPE_NAME = "<Array>";

    /** Name of constructors. */
    public static final String CONSTRUCTOR_PREFIX = "<init>";

    /** Name of object initializer methods - each class contains one. */
    public static final String OBJECT_INIT_METHOD = "<oinit>()";

    /** Name of class initializer methods - each class contains one. */
    public static final String CLASS_INIT_METHOD = "<clinit>()";

    /** Java fModifiers (copied from the org.eclipse.jdt.core.dom.Modifier class) */
    public static final int MODIFIER_NONE = 0;

    /** The Constant MODIFIER_PUBLIC. */
    public static final int MODIFIER_PUBLIC = 1;

    /** The Constant MODIFIER_PRIVATE. */
    public static final int MODIFIER_PRIVATE = 2;

    /** The Constant MODIFIER_PROTECTED. */
    public static final int MODIFIER_PROTECTED = 4;

    /** The Constant MODIFIER_STATIC. */
    public static final int MODIFIER_STATIC = 8;

    /** The Constant MODIFIER_FINAL. */
    public static final int MODIFIER_FINAL = 16;

    /** The Constant MODIFIER_ABSTRACT. */
    public static final int MODIFIER_ABSTRACT = 1024;

    /** Additional modifier to mark an interface. */
    public static final int MODIFIER_INTERFACE = 16384;

    /** Additional modifier to mark enum. */
    public static final int MODIFIER_ENUM = 32768;

    /** Constant for an initializer block. */
    public static final int INIT_METHOD_MODIFIERS = 8; // 8 is the modifier integer of an initializer block

    /** Constant for unknown fModifiers. */
    public static final int UNKOWN_OR_NO_MODIFIERS = -1;

    /** Unique name delimiter. */
    public static final String NAME_DELIMITER = ".";

    /** Separator of anonymous classes. */
    public static final String ANONYMOUS_CLASS_SEPARATOR = "$";

    /**
     * Start of class parameter list.
     */
    public static final String CLASS_PARAMETER_START_BRACE = "<";
    /**
     * End of class parameter list.
     */
    public static final String CLASS_PARAMETER_END_BRACE = ">";
    /**
     * Separator of class parameters.
     */
    public static final String CLASS_PARAMETER_SEPARATOR = ",";
    
    /**
     * Start of the method argument list.
     */
    public static final String METHOD_START_BRACE = "(";
    /**
     * End of the method argument list.
     */
    public static final String METHOD_END_BRACE = ")";
    /**
     * Separator of method parameters.
     */
    public static final String METHOD_PARAMETER_SEPARATOR = ",";
    
    /**
     * Method array parameter
     */
    public static final String METHOD_PARAMETER_ARRAY = "[]";

    /**
     * The Hibernate ID of the FAMIX entity (set by Hibernate).
     */
    private Long fId;

    /**
     * Parent entity.
     * Transient for serialization.
     */
    private transient AbstractFamixEntity fParent;

    /**
     * Unique name.
     */
    private String fUniqueName;

    /**
     * Java modifiers - see {@link org.eclipse.jdt.core.dom.Modifier}.
     */
    private int fModifiers;

    /**
     * Source code of the FAMIX entity.

    private Content fContent = new Content();

    /**
     * The default constructor.
     */
    public AbstractFamixEntity() {}

    /**
     * The constructor.
     * 
     * @param uniqueName
     *            Unique name of the FAMIX entity.
     */
    public AbstractFamixEntity(String uniqueName) {
        fUniqueName = uniqueName;
    }

    /**
     * The constructor.
     * 
     * @param uniqueName
     *            unique name of the FAMIX entity
     * @param parent
     *            fParent entity
     */
    public AbstractFamixEntity(String uniqueName, AbstractFamixEntity parent) {
        fUniqueName = uniqueName;
        fParent = parent;
    }

    /**
     * Sets the Hibernate ID.
     * 
     * @param id
     *            Hibernate ID.
     */
    protected void setId(Long id) {
        fId = id;
    }

    /**
     * Returns the Hibernate ID.
     * 
     * @return The Hibernate ID.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public Long getId() {
        return fId;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public int hashCode() {
        String hashString = this.getClass().getName() + HASH_STRING_DELIMITER + getUniqueName();

        return hashString.hashCode();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (this == obj) {
            return true;
        }
        // if (fId == null) return false;
        if (!(obj instanceof AbstractFamixEntity)) {
            return false;
        }
        if (!(obj.getClass().getName().equals(this.getClass().getName()))) {
            return false;
            // if (this.getId() != null && this.getId().equals(((AbstractFamixEntity) obj).getId())) return true;
        }

        return getUniqueName().equals(((AbstractFamixEntity) obj).getUniqueName());
    }

    /**
     * Returns the short name of the entity.
     * 
     * @return the short name of the entity
     */
    @Transient
    public String getName() {
        int pos = 0;
        String name = getUniqueName();
        if (name.endsWith(")")) {
            name = name.substring(0, name.indexOf("("));
        }
        pos = name.lastIndexOf(".") + 1;
        return name.substring(pos);
    }

    /**
     * Unique name consists of the full path and the name of the entity. We currently set the SQL column type by hand
     * because Hibernate by default sets it to VARCHAR(255) which is too short.
     * 
     * @return Returns the unique name.
     */
    @Lob
    public String getUniqueName() {
        return fUniqueName;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String toString() {
        return getUniqueName();
    }

    /**
     * Returns the parent entity.
     * 
     * @return The parent entity
     */
    @ManyToOne
    @JoinColumn(name = "parent_id")
    public AbstractFamixEntity getParent() {
        return fParent;
    }

    /**
     * Sets the parent of the entity.
     * 
     * @param parent
     *            The parent entity
     */
    public void setParent(AbstractFamixEntity parent) {
        fParent = parent;
    }

    /**
     * Sets the uniqueName of the entity.
     * 
     * @param uniqueName
     *            The unique name.
     */
    public void setUniqueName(String uniqueName) {
        fUniqueName = uniqueName;
    }

    /**
     * Returns the modifiers.
     * 
     * @return The Java modifiers.
     */
    public int getModifiers() {
        return fModifiers;
    }

    /**
     * Sets the modifiers.
     * 
     * @param modifiers
     *            The Java modifiers.
     */
    public void setModifiers(int modifiers) {
        fModifiers = modifiers;
    }

    /**
     * This method should not be used anymore, as it will be deleted in future releases of Evolizer. Not all
     * FamixEntities have children.
     * 
     * @return the set of contained entities
     * 
     * @deprecated
     */
    @Deprecated
    @Transient
    public Set<? extends AbstractFamixEntity> getChildren() {
        return new HashSet<AbstractFamixEntity>();
    }

    /**
     * {@inheritDoc}
     */
    @Transient
    @Override
    public String getLabel() {
        return getName();
    }

    /**
     * {@inheritDoc}
     */
    @Transient
    @Override
    public String getURI() {
        return getUniqueName();
    }

    /**
     * Returns the source.
     * 
     * @return The source code.

    @Transient
    public String getSource() {
        String source = "";
        if (getSourceAnchor() != null) {
            AbstractFamixEntity topLevelEntity = this;
            while (topLevelEntity.getParent() != null && !(topLevelEntity.getParent() instanceof FamixPackage)) {
                topLevelEntity = topLevelEntity.getParent();
            }
    
            if (topLevelEntity instanceof FamixClass) {
                source = topLevelEntity.getContent().getSource().substring(getSourceAnchor().getStartPos(), getSourceAnchor().getEndPos());
            }
        }

        return source;
    }

    /**
     * Returns the source code of the Java file that contains the entity.
     * The Java source code is stored with top level FAMIX classes.
     * 
     * @return The source code of the Java file containing the entity.

    @Transient
    public String getJavaFileSourceCode() {
        String source = "";
        if (getSourceAnchor() != null) {
            AbstractFamixEntity topLevelEntity = this;
            while (topLevelEntity.getParent() != null && !(topLevelEntity.getParent() instanceof FamixPackage)) {
                topLevelEntity = topLevelEntity.getParent();
            }
    
            if (topLevelEntity instanceof FamixClass) {
                source = topLevelEntity.getContent().getSource();
            }
        }
        
        return source;
    }

    /**
     * Sets the content.
     *
     * @param content
     *            The content.

    public void setContent(Content content) {
        fContent = content;
    }

    /**
     * Returns the content.
     *
     * @return The content.

    // @OneToOne(cascade = CascadeType.ALL, optional=false)
    // @org.hibernate.annotations.LazyToOne(org.hibernate.annotations.LazyToOneOption.PROXY) //Needed for one-to-one
    // lazy fetching with proxies.
    @OneToOne(cascade = CascadeType.ALL, optional = false)
    @JoinColumn(name = "content_id")
    @org.hibernate.annotations.LazyToOne(org.hibernate.annotations.LazyToOneOption.PROXY)
    // Needed for one-to-one lazy fetching with proxies.
    public Content getContent() {
        return fContent;
    }

    /**
     * Checks if is abstract.
     * 
     * @return True, if the entity is declared as abstract.
     */
    @Transient
    public boolean isAbstract() {
        return (getModifiers() & AbstractFamixEntity.MODIFIER_ABSTRACT) == AbstractFamixEntity.MODIFIER_ABSTRACT;
    }

    /**
     * Checks if is public.
     * 
     * @return True, if the entity is declared as public
     */
    @Transient
    public boolean isPublic() {
        return (getModifiers() & AbstractFamixEntity.MODIFIER_PUBLIC) == AbstractFamixEntity.MODIFIER_PUBLIC;
    }

    /**
     * Checks if is private.
     * 
     * @return True, if the entity is declared as private.
     */
    @Transient
    public boolean isPrivate() {
        return (getModifiers() & AbstractFamixEntity.MODIFIER_PRIVATE) == AbstractFamixEntity.MODIFIER_PRIVATE;
    }

    /**
     * Checks if is protected.
     * 
     * @return True, if the entity is declared as protected.
     */
    @Transient
    public boolean isProtected() {
        return (getModifiers() & AbstractFamixEntity.MODIFIER_PROTECTED) == AbstractFamixEntity.MODIFIER_PROTECTED;
    }

    /**
     * Checks if is static.
     * 
     * @return True, if the entity is declared as static.
     */
    @Transient
    public boolean isStatic() {
        return (getModifiers() & AbstractFamixEntity.MODIFIER_STATIC) == AbstractFamixEntity.MODIFIER_STATIC;
    }

    /**
     * Checks if is final.
     * 
     * @return True, if the entity is declared as final.
     */
    @Transient
    public boolean isFinal() {
        return (getModifiers() & AbstractFamixEntity.MODIFIER_FINAL) == AbstractFamixEntity.MODIFIER_FINAL;
    }
}
