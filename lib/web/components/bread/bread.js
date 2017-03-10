/**
 * @file editor 面包屑导航
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Breadcrumb} from 'antd';
import store from '../../common/store';

const subscribe = (bread) => {

    let currValue;

    store.subscribe(() => {
        let preValue = currValue;
        let state = store.getState();

        currValue = state.bread;

        if (preValue !== currValue) {
            bread.setState({
                breads: currValue.split(',')
            });
        }
    });
};

export default class Bread extends React.Component {
    constructor(props) {
        super(props);
        subscribe(this);
    }

    state = {
        breads: []
    }

    render() {
        return (
            <Breadcrumb separator=">">
                {
                    this.state.breads.map((item, index) => {
                        return <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
                    })
                }
            </Breadcrumb>
        )
    }
}