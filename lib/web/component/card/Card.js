/**
 * @file selector 组件
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Card, Tree, Collapse} from 'antd';
import _ from 'lodash';

import {get, post} from '../../common/request';
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
        const schemaTypes = state.schemaTypes;
        const schemaTypesMap = state.schemaTypesMap;
        const value = state.selectCardValue;

        if (card.state.isRender) {
            card.setState({
                show: data[value] ? value : 'all'
            });
            return;
        }

        const queryTypeData = data.queryType;
        const mutationTypeData = data.mutationType;

        const queryRootNode = schemaTypes.filter(schemaType => {
            return queryTypeData.name === schemaType.name;
        })[0];

        const mutationRootNode = schemaTypes.filter(schemaType => {
            return mutationTypeData.name === schemaType.name;
        })[0];

        card.eachFields(queryRootNode.fields, 'queryType', queryTypeData.name);
        card.eachFields(mutationRootNode.fields, 'mutationType', mutationTypeData.name);

        card.setState({
            queryType: data.queryType,
            mutationType: data.mutationType,
            schemaTypesMap: state.schemaTypesMap,
            types: state.schemaTypes,
            show: data[value] ? value : 'all',
            startupLoading: false,
            isRender: true
        });
    });
};

export default class Cards extends React.Component {
    constructor(props) {
        super(props);

        this.selectTree = this.selectTree.bind(this);
        this.loadTreeData = this.loadTreeData.bind(this);
        this.expandTree = this.expandTree.bind(this);
    }

    state = {
        queryType: {},
        mutationType: {},
        schemaTypesMap: {},
        types: [],
        show: 'all',
        startupLoading: true,
        queryTreeData: [],
        queryTreePathMap: {},
        mutationTreeData: [],
        mutationTreePathMap: {},
        isRender: false
    }

    componentWillMount() {
        subscribe(this);
    }

    /**
     * eventKey 有值时说明不是一级节点
     *
     * @type {String}
     */
    eachFields(fields, category, categoryName, eventKey = '') {
        const {queryTreePathMap, queryTreeData, mutationTreeData, mutationTreePathMap} = this.state;
        const treePathMap = category === 'queryType' ? queryTreePathMap : mutationTreePathMap;
        fields.forEach(field => {
            const child = {
                name: field.name,
                isLeaf: false,
                key: eventKey ? (eventKey + '-' + field.name + '-') : (field.name + '-'),
                path: eventKey ? treePathMap[eventKey].path : [],
                category: category,
                categoryName: categoryName
            };

            if (field.type.kind === 'LIST') {
                child.children = [];
                child.key = child.key + field.type.ofType.name;
                child.path = child.path.concat([field.name + '-' + field.type.ofType.name]);
                child.type = field.type.ofType.name;
            }
            else if (field.type.kind === 'NON_NULL') {
                if (field.type.ofType.kind === 'LIST') {
                    child.children = [];
                    child.key = child.key + field.type.ofType.ofType.name;
                    child.path = child.path.concat([field.name + '-' + field.type.ofType.ofType.name]);
                    child.type = field.type.ofType.ofType.name;
                }
                // SCALAR
                else {
                    child.isLeaf = true;
                    child.key = child.key + field.type.ofType.name;
                    child.path = child.path.concat([field.name + '-' + field.type.ofType.name]);
                    child.type = field.type.ofType.name;
                }
            }
            else if (field.type.kind === 'SCALAR') {
                child.isLeaf = true;
                child.key = child.key + field.type.name;
                child.path = child.path.concat([field.name + '-' + field.type.name]);
                child.type = field.type.name;
            }
            // OBJECT
            else {
                child.children = [];
                child.key = child.key + field.type.name;
                child.path = child.path.concat([field.name + '-' + field.type.name]);
                child.type = field.type.name;
            }

            if (eventKey) {
                if (!treePathMap[child.key]) {
                    treePathMap[eventKey].children.push(child);
                    treePathMap[child.key] = child;
                    this.setState({treePathMap});
                }
            }
            else {
                treePathMap[child.key] = child;
                if (category === 'queryType') {
                    queryTreeData.push(child);
                    this.setState({queryTreeData, treePathMap});
                }
                else {
                    mutationTreeData.push(child);
                    this.setState({mutationTreeData, treePathMap});
                }
            }
        });
    }

    async selectTree(checkedKeys, params) {
        const treeNode = params.node;
        const props = treeNode.props;
        if (props.isLeaf) {
            window.scrollTo(0, 0);
            const breadVal = [];
            props.path.forEach(item => {
                breadVal.push(item.split('-')[0]);
            });
            const breadText = [props.categoryName].concat(breadVal);
            store.dispatch({
                type: 'upDateBread',
                breadText: breadText,
                breadVal: breadVal.concat(props.type) // 最后这个 props.type 是类型
            });
        }
        else {
            treeNode.onExpand();
        }
    }

    async expandTree(expandedKeys, params) {
        const treeNode = params.node;
        if (!treeNode.props.expanded) {
            await this.loadTreeData(treeNode);
        }
    }

    async loadTreeData(treeNode) {
        const eventKey = treeNode.props.eventKey;
        const category = treeNode.props.category;
        const categoryName = treeNode.props.categoryName;
        const type = treeNode.props.type;
        const queryTreePathMap = this.state.queryTreePathMap;
        const ret = await get('/cographql/load-children', {
            type: type
        });

        this.eachFields(ret.data.fields, category, categoryName, eventKey);
    }

    render() {
        const {queryType, mutationType, show, startupLoading, queryTreeData, mutationTreeData} = this.state;

        const loop = data => data.map(item => {
            if (item.children) {
                return (
                    <TreeNode title={item.name}
                        categoryName={item.categoryName}
                        category={item.category}
                        path={item.path}
                        type={item.type}
                        key={item.key}
                    >
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    title={item.name}
                    categoryName={item.categoryName}
                    category={item.category}
                    path={item.path}
                    type={item.type}
                    key={item.key}
                    isLeaf={true}
                />
            );
        });

        let queryTypeContent = show === 'all' || show === 'queryType'
            ? (
                <Card key="querytype-card" title={queryType.name} style={{minWidth: 300, width: 'auto'}}>
                    <h3>{queryType.description}</h3>
                    <Tree onSelect={this.selectTree} onExpand={this.expandTree}>
                        {loop(queryTreeData)}
                    </Tree>
                </Card>
            )
            : null;

        let mutationTypeContent = show === 'all' || show === 'mutationType'
            ? (
                <Card key="mutation-card" title={mutationType.name} style={{minWidth: 300, width: 'auto'}}>
                    <h3>{mutationType.description}</h3>
                    <Tree onSelect={this.selectTree} onExpand={this.expandTree}>
                        {loop(mutationTreeData)}
                    </Tree>
                </Card>
            )
            : null;

        return (
            <div className="card-container">
                {
                    startupLoading
                        ? (
                            <div>
                                <Card loading title="loading" style={{minWidth: 300, width: 'auto'}}></Card>
                                <Card loading title="loading" style={{minWidth: 300, width: 'auto'}}></Card>
                            </div>
                        )
                        : (
                            <div>
                                {queryTypeContent}
                                {mutationTypeContent}
                            </div>
                        )
                }
            </div>
        );
    }
}
