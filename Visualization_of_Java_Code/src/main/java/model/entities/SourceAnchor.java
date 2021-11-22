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

/**
 * Reference to the location of a FAMIX entity/association in the source code. The reference has the form of:
 * "fFile:fStart:fEnd". The "fFile" denotes the source fFile and "fStart"/"fEnd" mark the position for the anchor.
 * 
 * @author pinzger
 */
@Entity
public final class SourceAnchor {

    /** Delimiter used to define source anchors. */
    public static final String SOURCE_ANCHOR_DELIMITER = ":";

    /**
     * The Hibernate ID.
     */
    private Long fId;

    /**
     * The name of the source file.
     */
    private String fFile;

    /**
     * The starting position (in number of chars).
     */
    private Integer fStartPos;

    /**
     * The end position (in number of chars).
     */
    private Integer fEndPos;

    /**
     * The default constructor.
     */
    @SuppressWarnings("unused")
    private SourceAnchor() {}

    /**
     * The constructor.
     * 
     * @param file
     *            The source fFile in which the anchor is valid.
     * @param startPos
     *            Start position of anchor.
     * @param endPos
     *            End position of anchor.
     */
    public SourceAnchor(String file, Integer startPos, Integer endPos) {
        setFile(file);
        setStartPos(startPos);
        setEndPos(endPos);
    }

    /**
     * Returns the file.
     * 
     * @return The name of the source file.
     */
    public String getFile() {
        return fFile;
    }

    /**
     * Sets the file.
     * 
     * @param file
     *            The name of the source fFile.
     */
    public void setFile(String file) {
        fFile = file;
    }

    /**
     * Returns the end.
     * 
     * @return The end position.
     */
    public Integer getEndPos() {
        return fEndPos;
    }

    /**
     * Sets the end.
     * 
     * @param endPos
     *            The end position.
     */
    public void setEndPos(Integer endPos) {
        fEndPos = endPos;
    }

    /**
     * Returns the start.
     * 
     * @return The start position.
     */
    public Integer getStartPos() {
        return fStartPos;
    }

    /**
     * Sets the start.
     * 
     * @param startPos
     *            The start position.
     */
    public void setStartPos(Integer startPos) {
        fStartPos = startPos;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String toString() {
        return getFile() + SOURCE_ANCHOR_DELIMITER + getStartPos() + SOURCE_ANCHOR_DELIMITER + getEndPos();
    }

    /**
     * {@inheritDoc}
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
        final int prime = 31;
        int result = 1;
        result = prime * result + ((fEndPos == null) ? 0 : fEndPos.hashCode());
        result = prime * result + ((fFile == null) ? 0 : fFile.hashCode());
        result = prime * result + ((fStartPos == null) ? 0 : fStartPos.hashCode());
        return result;
    }

    /**
     * {@inheritDoc}
     * 
     * The fStart position of ASTNodes can differ because of the use of simple and qualified names. Therefore we exclude
     * the fStart position.
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof SourceAnchor)) {
            return false;
        }
        if (getFile().equals(((SourceAnchor) obj).getFile())
        // && (this.getStart().equals(((SourceAnchor) obj).getStart()))
                && (getEndPos().equals(((SourceAnchor) obj).getEndPos()))) {
            return true;
        }
        return false;
    }

    /**
     * Sets the id.
     * 
     * @param id
     *            The ID of the source anchor.
     */
    public void setId(Long id) {
        fId = id;
    }

    /**
     * {@inheritDoc}
     */
    @Transient
    public String getLabel() {
        return getFile() + SOURCE_ANCHOR_DELIMITER + getStartPos() + SOURCE_ANCHOR_DELIMITER + getEndPos();
    }

    /**
     * {@inheritDoc}
     */
    @Transient
    public String getURI() {
        return getFile() + SOURCE_ANCHOR_DELIMITER + getStartPos() + SOURCE_ANCHOR_DELIMITER + getEndPos();
    }
}
