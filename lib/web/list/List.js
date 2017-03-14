/**
 * @file 首页入口
 * @author li ang(liang07@baidu.com)
 */

import React, {Component} from 'react';

import {Layout} from 'antd';

import Selector from '../component/selector/Selector';
import Card from '../component/card/Card';
import Editor from '../component/editor/Editor';

import './List.styl';

const {Header, Sider, Content} = Layout;

export default class List extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Layout className="list">
                <Sider className="left-sider" width={280}>
                    <Selector />
                </Sider>
                <Content>
                    <Card />
                </Content>
                <Sider className="right-sider" width={300}>
                    <Editor />
                </Sider>
            </Layout>
        )
    }
}
