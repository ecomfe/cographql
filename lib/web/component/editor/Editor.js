/**
 * @file editor 编辑器
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Input, Button} from 'antd';

import store from '../../common/store';
import Bread from '../bread/Bread';
import {get, post} from '../../common/request';

import './Editor.styl';

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        // store.subscribe(() => {
        //     console.log(store.getState())
        //     this.setState({
        //         cards: store.getState()
        //     });
        // });
        this.handleSave = this.handleSave.bind(this);
    }

    state = {
        text: ''
    }

    async handleSave(e) {
        const ret = await get('/cographql/test', {testTitle: 'testTitle'});
        console.log(ret);
    }

    handleCancel = (e) => {
        console.log('cancel');
    }

    render() {
        return (
            <div className="editor-container">
                <Bread />
                <Input type="textarea" placeholder="请输入自定义resolve" rows={20} />
                <div className="editor-btn">
                    <Button type="primary" onClick={this.handleSave}>Save</Button>
                    <Button onClick={this.handleCancel}>Cancel</Button>
                </div>
            </div>
        )
    }
}
