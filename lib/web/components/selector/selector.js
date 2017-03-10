/**
 * @file selector 组件
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Radio} from 'antd';
import store from '../../common/store';
import getData from '../../common/getData';

const RadioGroup = Radio.Group;

const upDate = (data) => {
    return {
        type: 'upDateCard',
        cards: data
    }
};

const dispatch = (value) => {
    store.dispatch(upDate(getData(value)));
};

export default class Selector extends React.Component {

    constructor(props) {
        super(props)
    }

    state = {
        value: 'All',
        options: ['All', 'queryType', 'mutationType']
        // options: ['All', 'Type', 'Input', 'Scalar', 'Interface', 'Union', 'Enum']
    }

    componentDidMount() {
        dispatch(this.state.value);
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