/**
 * @file selector 组件
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Radio} from 'antd';

import store from '../../common/store';
import getData from '../../common/getData';
import {get, post} from '../../common/request';

import './Selector.styl';

const RadioGroup = Radio.Group;

const upDate = (data) => {
    return {
        type: 'upDateCard',
        cards: data
    }
};

const dispatch = value => {
    // console.log(getData(value));
    // store.dispatch(upDate(getData(value)));
    store.dispatch({
        type: 'SELECT_CARD',
        value: value
    });
};

// const subscribe = app => {
//     let currValue;
//     store.subscribe(() => {
//         let state = store.getState();
//     });
// };

export default class Selector extends React.Component {

    constructor(props) {
        super(props);
        // subscribe(this);
    }

    state = {
        value: 'All',
        options: ['All', 'queryType', 'mutationType']
        // options: ['All', 'Type', 'Input', 'Scalar', 'Interface', 'Union', 'Enum']
    }

    async componentDidMount() {
        const ret = await get('/cographql/schema-info');
        store.dispatch([
            {
                type: 'SCHEMA_INFO',
                schemaInfo: ret.data.data
            },
            {
                type: 'SELECT_CARD',
                value: this.state.value
            }
        ]);
    }

    onChange = (e) => {
        var value = e.target.value;

        this.setState({
            value: value,
        });

        dispatch(value);
    }

    render() {

        return (
            <RadioGroup onChange={this.onChange} value={this.state.value}>
                {
                    this.state.options.map((item, index) => {
                        return <Radio key={index} value={item}>{item}</Radio>
                    })
                }
            </RadioGroup>
        )
    }
}
