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
    return args.join('|');
};

const subscribe = card => {
    store.subscribe(() => {
        const state = store.getState();
        const data = state.schemaInfo;
        const value = state.selectCardValue;
        const ret = [];

        console.log(data);

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
        this.generateContent = this.generateContent.bind(this);
    }

    state = {
        queryType: {},
        mutationType: {},
        types: [],
        show: 'all',
        startupLoading: true
    }

    componentWillMount() {
        subscribe(this);
    }

    handleEdit(e) {
        window.scrollTo(0, 0);
        const val = e.target.getAttribute('value');
        store.dispatch({
            type: 'upDateBread',
            bread: val
        });
    }

    generateContent(fields, name, kind, title, firstTypeName, queryOrMutation, index) {
        return (
            <Collapse style={{marginBottom: 10}} key={index}>
                <Panel header={<p>{title}</p>}>
                    {
                        fields.map((typeField, typeFieldIdx) => {
                            let unable = false;

                            if (queryOrMutation === 'mutationType') {
                                if (typeField.type.fields && typeField.type.fields.some(item => {
                                    if (item.type && item.type.ofType && item.type.ofType.ofType && item.type.ofType.ofType.fields) {
                                        return item.type.ofType.ofType.fields.some(_item => {
                                            return typeField.name === _item.name;
                                        });
                                    }
                                    return false;
                                })) {
                                    unable = true;
                                }
                            }
                            else {
                                if (this.state.queryType.fields.some(item => {
                                    return item.name === firstTypeName && item.name === typeField.name;
                                })) {
                                    unable = true;
                                }
                            }

                            let type;
                            let str = `${typeField.name}: `;
                            if (typeField.type.ofType) {
                                str += `${typeField.type.ofType.name || typeField.type.ofType.kind} `
                                    + `(${typeField.type.kind})`;
                                type = typeField.type.ofType.name || typeField.type.ofType.kind;
                            }
                            else {
                                str += `${typeField.type.name} (${typeField.type.kind})`;
                                type = typeField.type.name;
                            }

                            let value;
                            if (name) {
                                value = getValue(
                                    this.state.queryType.name,
                                    firstTypeName,
                                    name,
                                    typeField.name,
                                    type
                                );
                            }
                            else {
                                value = getValue(
                                    this.state.queryType.name,
                                    firstTypeName,
                                    typeField.name,
                                    type
                                )
                            }

                            if (unable) {
                                return (
                                    <p className="unable" key={typeFieldIdx}>
                                        {str}
                                    </p>
                                );
                            }
                            else {
                                if (typeField.type.fields) {
                                    return (
                                        this.generateContent(
                                            typeField.type.fields,
                                            typeField.name,
                                            typeField.type.kind,
                                            `${typeField.name}: [${typeField.type.name}: ${typeField.type.kind}] (${typeField.type.kind})`,
                                            firstTypeName,
                                            'queryType',
                                            typeFieldIdx
                                        )
                                    );
                                }
                                if (typeField.type.ofType && typeField.type.ofType.ofType && typeField.type.ofType.ofType.fields) {
                                    return (
                                        this.generateContent(
                                            typeField.type.ofType.ofType.fields,
                                            typeField.name,
                                            typeField.type.ofType.kind,
                                            `${typeField.name}: [${typeField.type.ofType.ofType.name}: ${typeField.type.ofType.ofType.kind}] (${typeField.type.ofType.kind})`,
                                            firstTypeName,
                                            'queryType',
                                            typeFieldIdx
                                        )
                                    );
                                }
                                return (
                                    <p onClick={this.handleEdit} key={typeFieldIdx} value={value}>
                                        {str}
                                        <span value={value}>
                                            点击可编辑
                                        </span>
                                    </p>
                                );
                            }
                        })
                    }
                </Panel>
            </Collapse>
        )
    }

    render() {
        const {queryType, mutationType, show, startupLoading} = this.state;

        const queryTypeCollapseContent = !startupLoading && queryType.fields
            ? (
                queryType.fields.map((queryTypeField, queryTypeFieldIdx) => {
                    // const dataFrom = queryTypeField.type.fields
                    //     ? queryTypeField.type
                    //     : queryTypeField.type.ofType;

                    let innerContent;
                    // 暂时不用 ? : 来写，分开写方便调试
                    // author
                    if (queryTypeField.type.fields) {
                        innerContent = this.generateContent(
                            queryTypeField.type.fields,
                            // queryTypeField.type.name,
                            '',
                            queryTypeField.type.kind,
                            `${queryTypeField.type.name}: ${queryTypeField.type.kind}`,
                            queryTypeField.name,
                            'queryType',
                            0
                        );
                    }
                    else {
                        innerContent = this.generateContent(
                            queryTypeField.type.ofType.fields,
                            // queryTypeField.type.ofType.name,
                            '',
                            queryTypeField.type.ofType.kind,
                            `${queryTypeField.type.ofType.name}: ${queryTypeField.type.ofType.kind}`,
                            queryTypeField.name,
                            'queryType',
                            0
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
                <Card key="querytype-card" title={queryType.name} style={{width: 400}}>
                    <h3>{queryType.description}</h3>
                    {queryTypeCollapseContent}
                </Card>
            )
            : null;

        const mutationTypeCollapseContent = !startupLoading && mutationType.fields
            ? (
                mutationType.fields.map((mutationTypeField, mutationTypeFieldIdx) => {
                    const dataFrom = mutationTypeField.type.fields
                        ? mutationTypeField.type
                        : mutationTypeField.type.ofType;

                    const innerContent = this.generateContent(
                        dataFrom.fields,
                        // queryTypeField.type.ofType.name,
                        '',
                        dataFrom.kind,
                        `${dataFrom.name}: ${dataFrom.kind}`,
                        dataFrom.name,
                        'mutationType',
                        0
                    );

                    /*const innerContent = (
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

                                        let type;
                                        let str = `${typeField.name}: `;
                                        if (typeField.type.ofType) {
                                            str += `${typeField.type.ofType.name || typeField.type.ofType.kind} `
                                                    + `(${typeField.type.kind})`;
                                            type = typeField.type.ofType.name || typeField.type.ofType.kind;
                                        }
                                        else {
                                            str += `${typeField.type.name} (${typeField.type.kind})`;
                                            type = typeField.type.name;
                                        }

                                        const value = getValue(
                                            mutationType.name,
                                            mutationTypeField.name,
                                            // mutationTypeField.type.name || mutationTypeField.type.ofType.name,
                                            typeField.name,
                                            type
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
                    )*/

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
                <Card key="mutationtype-card" title={mutationType.name} style={{width: 400}}>
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
                                <Card loading title="loading" style={{width: 400}}></Card>
                                <Card loading title="loading" style={{width: 400}}></Card>
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
