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
package model;

import model.entities.*;

/**
 * The Evolizer model provider for the FAMIX model classes.
 * 
 * @author pinzger
 */
public class EvolizerFamixModelProvider{

    /** 
     * {@inheritDoc}
     */
    public Class<?>[] getAnnotatedClasses() {
        Class<?>[] annotatedClasses =
                {
                        FamixModel.class,
                        FamixAccess.class,
                        FamixAssociation.class,
                        FamixAttribute.class,
                        FamixCastTo.class,
                        FamixCheckInstanceOf.class,
                        FamixClass.class,
                        AbstractFamixEntity.class,
                        AbstractFamixObject.class,
                        FamixParameter.class,
                        AbstractFamixGeneralization.class,
                        FamixInheritance.class,
                        FamixInvocation.class,
                        FamixLocalVariable.class,
                        FamixMethod.class,
                        FamixPackage.class,
                        SourceAnchor.class,
                        AbstractFamixVariable.class,
                        FamixSubtyping.class};

        return annotatedClasses;
    }

}
