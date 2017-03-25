/**
 * @file editor 编辑器
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {Input, Button} from 'antd';
import lodash from 'lodash';

import store from '../../common/store';
import Bread from '../bread/Bread';
import {get, post} from '../../common/request';

import './Editor.styl';

const subscribe = editor => {
    store.subscribe(() => {
        const state = store.getState();
        editor.setState({
            breadVal: state.breadVal
        });
    });
};

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.handleSave = this.handleSave.bind(this);
        this.handleTextarea = lodash.debounce(this.handleTextarea.bind(this), 100);
    }

    state = {
        breadVal: [],
        textVal: ''
    }

    componentWillMount() {
        subscribe(this);
    }

    async handleSave(e) {
        const ret = await get('/cgql/update', {
            bread: this.state.breadVal.join('|'),
            text: this.state.textVal
        });
    }

    handleTextarea(val) {
        this.setState({
            textVal: val.trim()
        });
    }

    handleCancel = (e) => {
        console.log('cancel');
    }

    render() {
        return (
            <div className="editor-container">
                <Bread />
                <Input type="textarea" placeholder="请输入自定义resolve" rows={20} onChange={e => {
                    this.handleTextarea(e.target.value);
                }}/>
                <div className="editor-btn">
                    <Button type="primary" onClick={this.handleSave}>Save</Button>
                    <Button onClick={this.handleCancel}>Cancel</Button>
                </div>
            </div>
        )
    }
}
