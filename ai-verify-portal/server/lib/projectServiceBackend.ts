import { gql } from "@apollo/client";
import graphqlClient from "src/lib/graphqlClient";

import Project, { Report } from 'src/types/project.interface';
import { getByGID } from '../pluginManager';
import { ReportWidget } from "src/types/plugin.interface";
import _ from 'lodash';
import ProjectTemplate from "src/types/projectTemplate.interface";

export const GET_PROJECTS = gql`
    query Query {
        projects {
            id
            template {
                id
                projectInfo {
                    name
                    description
                    company
                }
            }
            createdAt
            updatedAt
            projectInfo {
                name
                description
            }
            report {
                status
                tests {
                    algorithmGID
                }
            }
            modelAndDatasets {
                groundTruthColumn
                model {
                    id
                    filename
                    filePath
                    modelType
                    name
                    status
                }
                testDataset {
                    id
                    filename
                    filePath
                    name
                    status
                }
                groundTruthDataset {
                    id
                    filename
                    filePath
                    name
                    status
                }
            }
        }
    }
`

export const GET_PROJECT = gql`
    query Query($id: ObjectID!) {
        project(id: $id) {
            id
            projectInfo {
                name
                description
                reportTitle
                company
            }
            globalVars {
                key
                value
            }
            inputBlockData
            testInformationData {
                algorithmGID
                testArguments
            }
            report {
                status
            }
            pages {
                layouts {
                    h
                    i
                    isBounded
                    isDraggable
                    isResizable
                    maxH
                    maxW
                    minH
                    minW
                    resizeHandles
                    static
                    w
                    x
                    y
                }
                reportWidgets {
                    widgetGID
                    key
                    layoutItemProperties {
                        justifyContent
                        alignItems
                        textAlign
                        color
                        bgcolor
                    }
                    properties
                }
            }
            modelAndDatasets {
                groundTruthColumn
                model {
                    id
                    filename
                    filePath
                    modelType
                    name
                    status
                    ctime
                }
                testDataset {
                    id
                    filename
                    filePath
                    dataColumns { label, name, datatype }
                    name
                    status
                    ctime
                }
                groundTruthDataset {
                    id
                    filename
                    filePath
                    dataColumns { label, name, datatype }
                    name
                    status
                    ctime
                }
            }
        }
    }
`

async function populateProject (project: Project|ProjectTemplate): Promise<Project|ProjectTemplate> {
    if (project.pages) {
        for (let page of project.pages) {
            for (let item of page.reportWidgets) {
                // console.log("item", item)
                item.widget = await getByGID(item.widgetGID) as ReportWidget;
                // console.log("-> widget", item.widget)
            }
        }
    }
    return project;
}

export async function listProjects(): Promise<Project[]> {
    const client = graphqlClient(true)
    const { data } = await client.query({
        query: GET_PROJECTS,
    });
    // console.log("data", data.projects)
    let projects = data.projects as Project[];
    for (let proj of projects) {
        await populateProject(proj);
    }
    // let projects = (data.projects as Project[]).map(async proj => { await populateProject(proj); return proj })
    // let projects = data.projects as Project[];
    // console.log("projects", projects)
    return projects; 
}

export async function getProject(id: string): Promise<Project> {
    console.log("getProject")
    const client = graphqlClient(true)
    try {
        const { data } = await client.query({
            query: GET_PROJECT,
            variables: {
                id,
            }
        });
        return await populateProject(_.cloneDeep(data.project)) as Project;     
    } catch (err) {
        console.error("getProject error", JSON.stringify(err, null, 2));
        return Promise.reject(err);
    }
    // return data.project; 
}

export const GET_REPORT = gql`
    query Query($projectID: ObjectID!) {
        report(projectID: $projectID) {
            projectID
            status
            timeStart
            timeTaken
            totalTestTimeTaken
            inputBlockData
            projectSnapshot {
                projectInfo {
                    name
                    description
                }
                globalVars {
                    key
                    value
                }
                inputBlockData
                testInformationData {
                    algorithmGID
                    testArguments
                }
                modelAndDatasets {
                    testDataset {
                        filename
                        name
                        size
                        description
                        type
                        dataFormat
                    }
                    model {
                        name
                        filename
                        description
                        size
                        type
                        modelType
                        modelFormat
                    }
                    groundTruthColumn
                    groundTruthDataset {
                        filename
                        name
                        size
                        description
                        type
                        dataFormat
                    }
                }
                pages {
                    layouts {
                        h
                        i
                        isBounded
                        isDraggable
                        isResizable
                        maxH
                        maxW
                        minH
                        minW
                        resizeHandles
                        static
                        w
                        x
                        y
                    }
                    reportWidgets {
                        widgetGID
                        key
                        layoutItemProperties {
                            justifyContent
                            alignItems
                            textAlign
                            color
                            bgcolor
                        }
                        properties
                    }
                }
            }
            tests {
                algorithmGID
                algorithm {
                    gid
                    name
                    description
                }
                testArguments
                status
                progress
                timeStart
                timeTaken
                output
                errorMessages {
                    id
                    description
                }
            }
        }
    }
`

export async function getReport(projectID: string): Promise<Report> {
    const client = graphqlClient(true)
    const { data } = await client.query({
        query: GET_REPORT,
        variables: {
            projectID,
        }
    });
    return data.report; 
}

export const GET_PROJECT_TEMPLATES = gql`
    query Query {
        projectTemplates {
            id
            fromPlugin
            createdAt
            updatedAt
            projectInfo {
                name
                description
                company
            }
        }
    }
`

export const GET_PROJECT_TEMPLATE = gql`
    query Query($id: ObjectID!) {
        projectTemplate(id: $id) {
            id
            fromPlugin
            projectInfo {
                name
                description
                company
            }
            globalVars {
                key
                value
            }
            pages {
                layouts {
                    h
                    i
                    isBounded
                    isDraggable
                    isResizable
                    maxH
                    maxW
                    minH
                    minW
                    resizeHandles
                    static
                    w
                    x
                    y
                }
                reportWidgets {
                    widgetGID
                    key
                    layoutItemProperties {
                        justifyContent
                        alignItems
                        textAlign
                        color
                        bgcolor
                    }
                    properties
                }
            }
        }
    }
`
export async function listProjectTemplates(): Promise<ProjectTemplate[]> {
    const client = graphqlClient(true)
    const { data } = await client.query({
        query: GET_PROJECT_TEMPLATES,
    });
    // console.log("data", data.projects)
    let templates = data.projectTemplates as ProjectTemplate[];
    for (let template of templates) {
        await populateProject(template);
    }
    return templates; 
}

export async function getProjectTemplate(id: string): Promise<ProjectTemplate> {
    const client = graphqlClient(true)
    const { data } = await client.query({
        query: GET_PROJECT_TEMPLATE,
        variables: {
            id,
        }
    });
    return await populateProject(_.cloneDeep(data.projectTemplate)); 
    // return data.project; 
}

export const CREATE_PROJECT_TEMPLATE = gql`
mutation Mutation($projectTemplate: ProjectTemplateInput!) {
    createProjectTemplate(projectTemplate: $projectTemplate) {
        id
    }
}
`
export async function createProjectTemplate(projectTemplate: ProjectTemplate): Promise<string> {
    // console.log("createProjectTemplate", projectTemplate)
    const client = graphqlClient(true)
    const { data } = await client.mutate({
        mutation: CREATE_PROJECT_TEMPLATE,
        variables: {
            projectTemplate,
        }
    });
    return data.createProjectTemplate.id; 
    // return data.project; 
}

export const DELETE_PROJECT_TEMPLATE = gql`
mutation Mutation($id: ObjectID!) {
    deleteProjectTemplate(id: $id)
}
`

export async function deleteProjectTemplate(id: string): Promise<string> {
    // console.log("createProjectTemplate", projectTemplate)
    const client = graphqlClient(true)
    const { data } = await client.mutate({
        mutation: DELETE_PROJECT_TEMPLATE,
        variables: {
            id,
        }
    });
    return data; 
    // return data.project; 
}
