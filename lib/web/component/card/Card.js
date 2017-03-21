/**
 * @file selector 组件
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Card, Tree, Collapse} from 'antd';

import store from '../../common/store';
import './Card.styl';

const TreeNode = Tree.TreeNode;
const Panel = Collapse.Panel;

const getValue = (...args) => {
    return args.join(',');
};

const subscribe = card => {
    store.subscribe(() => {
        const state = store.getState();
        const data = state.schemaInfo;
        const value = state.selectCardValue;
        const ret = [];

        card.setState({
            queryType: data.queryType,
            mutationType: data.mutationType,
            types: state.schemaTypes,
            show: data[value] ? value : 'all',
            startupLoading: false
        });
    });
};

export default class Cards extends React.Component {
    constructor(props) {
        super(props);

        this.handleEdit = this.handleEdit.bind(this);
    }

    state = {
        queryType: {},
        mutationType: {},
        types: [],
        show: 'all',
        // 当前选择面包屑，用于 Save 时发送给后端给响应的字段做 mock
        curBread: '',
        startupLoading: true
    }

    componentWillMount() {
        subscribe(this);
    }

    handleEdit(e) {
        store.dispatch({
            type: 'upDateBread',
            bread: e.target.getAttribute('value')
        });
        console.log(e.target.getAttribute('value'));
    }


    render() {
        const {queryType, mutationType, show, startupLoading} = this.state;

        const queryTypeCollapseContent = queryType.fields
            ? (
                queryType.fields.map((queryTypeField, queryTypeFieldIdx) => {
                    // const dataFrom = queryTypeField.type.fields
                    //     ? queryTypeField.type
                    //     : queryTypeField.type.ofType;

                    let innerContent;
                    // 暂时不用 ? : 来写，分开写方便调试
                    // author
                    if (queryTypeField.type.fields) {
                        console.log(queryTypeField);
                        innerContent = (
                            <Collapse style={{marginBottom: 10}}>
                                <Panel header={<p>{queryTypeField.type.name}: {queryTypeField.type.kind}</p>}>
                                    {
                                        queryTypeField.type.fields.map((typeField, typeFieldIdx) => {
                                            let unable = false;
                                            if (queryType.fields.some(item => {
                                                return item.name === typeField.name
                                            })) {
                                                unable = true;
                                            }

                                            let str = `${typeField.name}: `;
                                            if (typeField.type.ofType) {
                                                str += `${typeField.type.ofType.name || typeField.type.ofType.kind} `
                                                    + `(${typeField.type.kind})`;
                                            }
                                            else {
                                                str += `${typeField.type.name} (${typeField.type.kind})`;
                                            }

                                            const value = getValue(
                                                queryType.name,
                                                queryTypeField.name,
                                                queryTypeField.type.name || queryTypeField.type.ofType.name,
                                                typeField.name
                                            );

                                            return unable
                                                ?  (
                                                    <p className="unable" key={typeFieldIdx}>
                                                        {str}
                                                    </p>
                                                )
                                                : (
                                                    <p onClick={this.handleEdit} key={typeFieldIdx} value={value}>
                                                        {str}
                                                        <span value={value}>
                                                            点击可编辑
                                                        </span>
                                                    </p>
                                                )
                                        })
                                    }
                                </Panel>
                            </Collapse>
                        );
                    }
                    else {
                        innerContent = (
                            <Collapse style={{marginBottom: 10}}>
                                <Panel header={<p>{queryTypeField.type.ofType.name}: {queryTypeField.type.ofType.kind}</p>}>
                                    {
                                        queryTypeField.type.ofType.fields.map((typeField, typeFieldIdx) => {
                                            let unable = false;
                                            if (queryType.fields.some(item => item.name === typeField.name)) {
                                                unable = true;
                                            }

                                            let str = `${typeField.name}: `;
                                            if (typeField.type.ofType) {
                                                str += `${typeField.type.ofType.name || typeField.type.ofType.kind} `
                                                    + `(${typeField.type.kind})`;
                                            }
                                            else {
                                                str += `${typeField.type.name} (${typeField.type.kind})`;
                                            }

                                            const value = getValue(
                                                queryType.name,
                                                queryTypeField.name,
                                                queryTypeField.type.name || queryTypeField.type.ofType.name,
                                                typeField.name
                                            );

                                            return unable
                                                ?  (
                                                    <p className="unable" key={typeFieldIdx}>
                                                        {str}
                                                    </p>
                                                )
                                                : (
                                                    <p onClick={this.handleEdit} key={typeFieldIdx} value={value}>
                                                        {str}
                                                        <span value={value}>
                                                            点击可编辑
                                                        </span>
                                                    </p>
                                                )
                                        })
                                    }
                                </Panel>
                            </Collapse>
                        );
                    }

                    return (
                        <Collapse style={{marginBottom: 10, marginTop: 10}} key={queryTypeFieldIdx}>
                            <Panel header={<p>{queryTypeField.name}: {queryTypeField.type.kind}</p>}
                                key={queryTypeField.name}>
                                {innerContent}
                            </Panel>
                        </Collapse>
                    )
                })
            )
            : null;

        const queryTypeCardContent = (show === 'all' || show === 'queryType')
            ? (
                <Card key="querytype-card" title={queryType.name} style={{width: 350}}>
                    <h3>{queryType.description}</h3>
                    {queryTypeCollapseContent}
                </Card>
            )
            : null;

        const mutationTypeCollapseContent = mutationType.fields
            ? (
                mutationType.fields.map((mutationTypeField, mutationTypeFieldIdx) => {
                    const dataFrom = mutationTypeField.type.fields
                        ? mutationTypeField.type
                        : mutationTypeField.type.ofType;

                    const innerContent = (
                        <Collapse style={{marginBottom: 10}}>
                            <Panel header={<p>{dataFrom.name}: {dataFrom.kind}</p>}>
                                {
                                    dataFrom.fields.map((typeField, typeFieldIdx) => {
                                        let unable = false;
                                        if (queryType.fields.some(item => {
                                            return item.name === typeField.name
                                        })) {
                                            unable = true;
                                        }
                                        let str = `${typeField.name}: `;
                                        if (typeField.type.ofType) {
                                            str += `${typeField.type.ofType.name || typeField.type.ofType.kind} `
                                                    + `(${typeField.type.kind})`;
                                        }
                                        else {
                                            str += `${typeField.type.name} (${typeField.type.kind})`;
                                        }

                                        const value = getValue(
                                            mutationType.name,
                                            mutationTypeField.name,
                                            mutationTypeField.type.name || mutationTypeField.type.ofType.name,
                                            typeField.name
                                        );

                                        return unable
                                            ?  (
                                                <p className="unable" key={typeFieldIdx}>
                                                    {str}
                                                </p>
                                            )
                                            : (
                                                <p onClick={this.handleEdit} key={typeFieldIdx} value={value}>
                                                    {str}
                                                    <span value={value}>
                                                        点击可编辑
                                                    </span>
                                                </p>
                                            )
                                    })
                                }
                            </Panel>
                        </Collapse>
                    )

                    return (
                        <Collapse style={{marginBottom: 10, marginTop: 10}} key={mutationTypeFieldIdx}>
                            <Panel header={<p>{mutationTypeField.name}: {mutationTypeField.type.kind}</p>}
                                key={mutationTypeField.name}>
                                {innerContent}
                            </Panel>
                        </Collapse>
                    )
                })
            )
            : null;

        const mutationTypeCardContent = (show === 'all' || show === 'mutationType')
            ? (
                <Card key="mutationtype-card" title={mutationType.name} style={{width: 350}}>
                    <h3>{mutationType.description}</h3>
                    {mutationTypeCollapseContent}
                </Card>
            )
            : null;

        return (
            <div className="card-container">
                {
                    startupLoading
                        ? (
                            <div>
                                <Card loading title="loading" style={{width: 350}}></Card>
                                <Card loading title="loading" style={{width: 350}}></Card>
                            </div>
                        )
                        : (
                            <div>
                                {queryTypeCardContent}
                                {mutationTypeCardContent}
                            </div>
                        )
                }
            </div>
        );
    }
}
