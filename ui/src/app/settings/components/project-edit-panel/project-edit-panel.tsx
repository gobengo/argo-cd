import { FormField, FormSelect } from 'argo-ui';
import * as React from 'react';
import { Form, FormApi, Text } from 'react-form';

import { DataLoader } from '../../../shared/components';
import * as models from '../../../shared/models';
import { ProjectParams, services } from '../../../shared/services';

require('./project-edit-panel.scss');

function removeEl(items: any[], index: number) {
    items.splice(index, 1);
    return items;
}

export const ProjectEditPanel = (props: {
    nameReadonly?: boolean,
    defaultParams?: ProjectParams,
    submit: (params: ProjectParams) => any,
    getApi?: (formApi: FormApi) => void,
}) => (
    <div className='project-edit-panel'>
    <Form
        onSubmit={props.submit}
        getApi={props.getApi}
        defaultValues={{sourceRepos: [], destinations: [], roles: [], clusterResourceWhitelist: [], namespaceResourceBlacklist: [], ...props.defaultParams}}
        validateError={(params: ProjectParams) => ({
            name: !params.name && 'Project name is required',
        })}
        preSubmit={(params: ProjectParams) => {
            params.clusterResourceWhitelist.forEach((obj: models.GroupKind) => {
                obj.group = obj.group.trim();
                obj.kind = obj.kind.trim();
            });
            return params;
        }}>

        {(api) => (
            <form onSubmit={api.submitForm} role='form' className='width-control'>
                <h4>Summary:</h4>
                <div className='argo-form-row'>
                    <FormField formApi={api} label='Project Name' componentProps={{ readOnly: props.nameReadonly }} field='name' component={Text}/>
                </div>
                <div className='argo-form-row'>
                    <FormField formApi={api} label='Project Description' field='description' component={Text}/>
                </div>
                <DataLoader load={() => services.repos.list().then((repos) => repos.concat({repo: '*'} as models.Repository).map((repo) => repo.repo))}>
                    {(repos) => (
                        <React.Fragment>
                        <h4>Sources</h4>
                        <div>Git repositories where application manifests are permitted to be retrieved from</div>
                        {(api.values.sourceRepos as Array<string>).map((_, i) => (
                            <div key={i} className='row project-edit-panel__form-row'>
                                <div className='columns small-12'>
                                    <FormSelect field={['sourceRepos', i]} options={repos}/>
                                    <i className='fa fa-times' onClick={() => api.setValue('sourceRepos', removeEl(api.values.sourceRepos, i))}/>
                                </div>
                            </div>
                        ))}
                        <a onClick={() => api.setValue('sourceRepos', api.values.sourceRepos.concat(repos[0]))}>add source</a>
                        </React.Fragment>
                    )}
                </DataLoader>

                <DataLoader load={() => services.clusters.list().then((clusters) => clusters.concat({server: '*'} as models.Cluster).map((cluster) => cluster.server))}>
                    {(clusters) => (
                        <React.Fragment>
                            <h4>Destinations</h4>
                            <div>Cluster URLs and namespaces where applications are permitted to be deployed to</div>
                            <div className='argo-table-list__head'>
                                <div className='row'>
                                    <div className='columns small-5'>CLUSTER URL</div>
                                    <div className='columns small-5'>NAMESPACE</div>
                                </div>
                            </div>
                            {(api.values.destinations as Array<models.ApplicationDestination>).map((_, i) => (
                                <div key={i} className='row project-edit-panel__form-row'>
                                    <div className='columns small-5'>
                                        <FormSelect field={['destinations', i, 'server']} options={clusters}/>
                                    </div>
                                    <div className='columns small-5'>
                                        <Text className='argo-field' field={['destinations', i, 'namespace']}/>
                                    </div>
                                    <div className='columns small-2'>
                                        <i className='fa fa-times' onClick={() => api.setValue('destinations', removeEl(api.values.destinations, i))}/>
                                    </div>
                                </div>
                            ))}
                            <a onClick={() => api.setValue('destinations', api.values.destinations.concat({ server: clusters[0], namespace: 'default' }))}>add destination</a>
                        </React.Fragment>
                    )}
                </DataLoader>

                <React.Fragment>
                    <h4>Whitelisted Cluster Resources</h4>
                    <div>Cluster-scoped K8s API Groups and Kinds which are permitted to be deployed</div>
                    <div className='argo-table-list__head'>
                        <div className='row'>
                            <div className='columns small-5'>GROUP</div>
                            <div className='columns small-5'>KIND</div>
                        </div>
                    </div>
                    {(api.values.clusterResourceWhitelist as Array<models.GroupKind>).map((_, i) => (
                    <div key={i} className='argo-table-list__row'>
                        <div className='row'>
                            <div className='columns small-5'>
                                <Text className='argo-field' field={['clusterResourceWhitelist', i, 'group']}/>
                            </div>
                            <div className='columns small-5'>
                                <Text className='argo-field' field={['clusterResourceWhitelist', i, 'kind']}/>
                            </div>
                            <div className='columns small-2'>
                                <i className='fa fa-times' onClick={() => api.setValue('clusterResourceWhitelist', removeEl(api.values.clusterResourceWhitelist, i))}/>
                            </div>
                        </div>
                    </div>
                    ))}
                    <a onClick={() => api.setValue('clusterResourceWhitelist', api.values.clusterResourceWhitelist.concat({ group: '', kind: '' }))}>
                      whitelist new cluster resource
                    </a>
                </React.Fragment>

                <React.Fragment>
                    <h4>Blacklisted Namespaced Resources</h4>
                    <div>Namespace-scoped K8s API Groups and Kinds which are <strong>prohibited</strong> from being deployed</div>
                    <div className='argo-table-list__head'>
                        <div className='row'>
                            <div className='columns small-5'>GROUP</div>
                            <div className='columns small-5'>KIND</div>
                        </div>
                    </div>
                    {(api.values.namespaceResourceBlacklist as Array<models.GroupKind>).map((_, i) => (
                    <div key={i} className='argo-table-list__row'>
                        <div className='row'>
                            <div className='columns small-5'>
                                <Text className='argo-field' field={['namespaceResourceBlacklist', i, 'group']}/>
                            </div>
                            <div className='columns small-5'>
                                <Text className='argo-field' field={['namespaceResourceBlacklist', i, 'kind']}/>
                            </div>
                            <div className='columns small-2'>
                                <i className='fa fa-times' onClick={() => api.setValue('namespaceResourceBlacklist', removeEl(api.values.namespaceResourceBlacklist, i))}/>
                            </div>
                        </div>
                    </div>
                    ))}
                    <a onClick={() => api.setValue('namespaceResourceBlacklist', api.values.namespaceResourceBlacklist.concat({ group: '', kind: '' }))}>
                        blacklist new namespaced resource
                    </a>
                </React.Fragment>
            </form>
        )}
    </Form>
    </div>
);
