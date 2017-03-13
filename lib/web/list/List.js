/**
 * @file 首页入口
 * @author li ang(liang07@baidu.com)
 */

import React, {Component} from 'react';

import 'antd/dist/antd.css';
import Selector from '../component/selector/Selector';
import Card from '../component/card/Card';
import Editor from '../component/editor/Editor';

import './List.styl';

export default class List extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="list row">
                <div className="col-xs-12 col-sm-12 col-md-2">
                    <Selector />
                </div>
                <div className="col-xs-12 col-sm-12 col-md-7 middle">
                    <Card />
                </div>
                <div className="col-xs-12 col-sm-12 col-md-3">
                    <Editor />
                </div>
            </div>
        )
    }
}
