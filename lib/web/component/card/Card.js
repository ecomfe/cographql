/**
 * @file selector 组件
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Card} from 'antd';

import store from '../../common/store';
import './Card.styl';

const getValue = (...args) => {
    return args.join(',');
};

const subscribe = card => {
    store.subscribe(() => {
        const state = store.getState();
        const data = state.schemaInfo.__schema;
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
            cards: ret
        });
    });
};

export default class Cards extends React.Component {
    constructor(props) {
        super(props);
        subscribe(this);
    }

    state = {
        cards: []
    }

    handleEdit = (e) => {
        store.dispatch({
            type: 'upDateBread',
            bread: e.target.getAttribute('value')
        });
    }

    render() {
        return (
            <div className="card-container">
            {
                this.state.cards.map(((item, index) => {
                    return (
                        <Card key={index} title={item.name} style={{ width: 300 }}>
                            <h3>{item.description}</h3>
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
