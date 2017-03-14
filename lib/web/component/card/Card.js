/**
 * @file selector 组件
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Card, Tree} from 'antd';

import store from '../../common/store';
import './Card.styl';

const TreeNode = Tree.TreeNode;

const getValue = (...args) => {
    return args.join(',');
};

const subscribe = card => {
    store.subscribe(() => {
        const state = store.getState();
        const data = state.schemaInfo;
        const value = state.selectCardValue;
        const ret = [];

        if (data[value]) {
            ret.push(data[value]);
        }
        else {
            for (const key of Object.keys(data)) {
                ret.push(data[key]);
            }
        }
        card.setState({
            cards: ret,
            types: state.schemaTypes
        });
    });
};

export default class Cards extends React.Component {
    constructor(props) {
        super(props);
        subscribe(this);

        this.handleTreeCheck = this.handleTreeCheck.bind(this);
        this.handleTreeSelect = this.handleTreeSelect.bind(this);
        this.handleTreeLoadData = this.handleTreeLoadData.bind(this);
    }

    state = {
        cards: [],
        types: []
    }

    handleEdit = (e) => {
        store.dispatch({
            type: 'upDateBread',
            bread: e.target.getAttribute('value')
        });
    }

    handleTreeCheck(checkedKeys) {
        console.log('checkedKeys', checkedKeys);
    }

    handleTreeSelect(selectedKeys, info) {
        console.log(selectedKeys, info);
    }

    handleTreeLoadData(treeNode) {
        console.log(treeNode);
    }

    render() {
        return (
            <div className="card-container">
                {
                    this.state.cards.map(((item, index) => {
                        return Array.isArray(item)
                            ? null
                            : (
                                <Card key={index} title={item.name} style={{width: 300}}>
                                    <h3>{item.description}</h3>
                                    {/*<Tree>
                                        <TreeNode title="parent 1" key="0-0">
                                          <TreeNode title="parent 1-1" key="0-0-1">
                                            <TreeNode title={<span style={{ color: '#08c' }}>sss</span>} key="0-0-1-0" />
                                          </TreeNode>
                                        </TreeNode>
                                      </Tree>*/}
                                    <Tree onCheck={this.handleTreeCheck} onSelect={this.handleTreeSelect} loadData={this.handleTreeLoadData}>
                                        {
                                            item.fields.map((v, i) => {
                                                console.log(v);
                                                return (
                                                    <TreeNode title={<p key={i}>{v.name}: {v.type.kind}</p>} key={v.name}>
                                                    </TreeNode>
                                                );
                                            })
                                        }
                                    </Tree>
                                    {item.fields.map(((value, number) => {
                                        return <p key={number}>{value.name}: {value.type.kind}
                                        <a onClick={this.handleEdit} value={getValue(item.name, value.name)}>Edit</a></p>
                                    }).bind(this))}
                                </Card>
                            )
                    }).bind(this))
                }
            </div>
        )
    }
}
