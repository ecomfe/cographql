/**
 * @file editor 面包屑导航
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Breadcrumb} from 'antd';

import store from '../../common/store';
import './Bread.styl';

let prevSelectCardValue = '';

const subscribe = (bread) => {
    store.subscribe(() => {
        let state = store.getState();
        if (prevSelectCardValue !== state.selectCardValue) {
            prevSelectCardValue = state.selectCardValue;
            bread.setState({
                breadText: [],
                breadVal: []
            });
        }
        else {
            bread.setState({
                breadText: state.breadText || [],
                breadVal: state.breadVal || []
            });
        }
    });
};

export default class Bread extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        breadText: [],
        breadVal: []
    }

    componentWillMount() {
        subscribe(this);
    }

    render() {
        return (
            <Breadcrumb separator=">">
                {
                    this.state.breadText.map((item, index) => {
                        return <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
                    })
                }
            </Breadcrumb>
        )
    }
}
