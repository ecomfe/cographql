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

        console.log(state);

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
        this.generatePanelChildren = this.generatePanelChildren.bind(this);
        this.generateCollapseChildren = this.generateCollapseChildren.bind(this);
    }

    state = {
        cards: [],
        types: [],
        children: {}
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

    generatePanelChildren(key, fields) {
        const curChildren = fields.map((value, index) => {
            console.error(value);

            return (
                // {<Collapse key={index} bordered={false} onChange={this.handleTreeSelect}>}
                    <Panel header={<p key={index}>{value.name}: {value.type.kind}</p>} key={value.name}>
                        {/*<Collapse bordered={false}>*/}
                            {/*<Panel header={'This is panel nest panel'} key={`${index}dsadsa`}>*/}
                                <p>edit</p>
                            {/*</Panel>*/}
                        {/*</Collapse>*/}
                    </Panel>
                // {</Collapse>}
            )
        });

        const children = this.state.children;
        children[key] = curChildren;
        this.setState({children});
    }

    generateCollapseChildren(key, ofType) {
        console.warn(key, ofType);
        const curChildren = ofType.fields.map((value, index) => {
                            return (
                                // {<Collapse key={index} bordered={false} onChange={this.handleTreeSelect}>}
                                    <Panel header={<p key={index}>{value.name}: {value.type.kind}</p>} key={value.name}>
                                        {/*<Collapse bordered={false}>*/}
                                            {/*<Panel header={'This is panel nest panel'} key={`${index}dsadsa`}>*/}
                                                <p>22222</p>
                                            {/*</Panel>*/}
                                        {/*</Collapse>*/}
                                    </Panel>
                                // {</Collapse>}
                            )
                        })

        const children = this.state.children;
        children[key] = curChildren;
        this.setState({children});
    }

    handleTreeSelect(activeKey) {
        if (!activeKey.length) {
            return;
        }

        const {types, cards, children} = this.state;

        console.log(activeKey);
        console.log(children);

        const eachFields = (fields) => {
            for (const field of fields) {
                if (field.name !== activeKey[0]) {
                    continue;
                }
                console.log(field);

                const ofType = field.type.ofType;
                if (!ofType) {
                    const typeFields = field.type.fields;
                    this.generatePanelChildren(activeKey[0], typeFields);
                }
                else {
                    // this.generateCollapseChildren(ofType.name, ofType);
                    // this.generateCollapseChildren(activeKey[0], ofType);
                    this.generatePanelChildren(activeKey[0], ofType.fields);
                }
            }
        }

        for (const card of cards) {
            eachFields(card.fields);
        }

        // let ret = [];
        // for (const typeItem of types) {
        //     // console.log(typeItem);
        //     ret = typeItem.fields.filter(field => {
        //         return field.name === activeKey[0];
        //     });

        //     if (ret.length) {
        //         break;
        //     }
        // }

        // if (!ret[0].type.ofType) {
        //     // console.log(ret);
        //     let s;
        //     for (const typeItem of types) {
        //         if (typeItem.name === ret[0].type.name) {
        //             s = typeItem;
        //             break;
        //         }
        //     }
        //     ret[0].children = s;
        //     // console.log(s);
        // }

        // console.log(cards, types);
    }

    render() {
        const {cards, children} = this.state;
        return (
            <div className="card-container">
                {
                    cards.map((item, index) => {
                        return (
                            <Card key={index} title={item.name} style={{width: 300}}>
                                <h3>{item.description}</h3>
                                {
                                    item.fields.map((itemField, itemFieldIndex) => {
                                        return (
                                            <Collapse style={{marginBottom: 10}} onChange={this.handleTreeSelect} key={itemFieldIndex}>
                                                <Panel header={<p>{itemField.name}: {itemField.type.kind}</p>} key={itemField.name}>
                                                    {
                                                        children[itemField.name]
                                                            ? (
                                                                <Collapse bordered={false} onChange={this.handleTreeSelect}>
                                                                    {
                                                                        children[itemField.name].map((item, index) => {
                                                                            return item;
                                                                        })
                                                                    }
                                                                </Collapse>
                                                            )
                                                            : null
                                                    }
                                                </Panel>
                                            </Collapse>
                                        )
                                    })
                                }
                                {/*<h3>{item.description}</h3>
                                <Collapse bordered={false} onChange={this.handleTreeSelect}>
                                    <Panel header={'This is panel nest panel'} key={item.name + 1}>
                                        <Collapse bordered={false} onChange={this.handleTreeSelect}>
                                            <Panel header={'This is panel nest panel'} key={item.name + 3}>
                                                <p>aaa</p>
                                            </Panel>
                                            <Panel header={'This is panel nest panel'} key={item.name + 4}>
                                                <p>bbb</p>
                                            </Panel>
                                        </Collapse>
                                    </Panel>
                                </Collapse>
                                <Collapse bordered={false} onChange={this.handleTreeSelect}>
                                    <Panel header={'This is panel nest panel'} key={item.name}>
                                        <p>3333</p>
                                    </Panel>
                                    <Panel header={'This is panel nest panel'} key={item.name + 1}>
                                        <p>4444</p>
                                    </Panel>
                                </Collapse>*/}
                            </Card>
                        )
                    })
                }
            </div>
        )
    }
}
