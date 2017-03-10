/**
 * @file 首页入口
 * @author li ang(liang07@baidu.com)
 */

import React from 'react';
import {render} from 'react-dom';
import Selector from './components/selector/selector';
import Card from './components/card/card';
import Editor from './components/editor/editor';

import './App.styl';
import './css/list.styl';
import 'antd/dist/antd.css'; 
import './components/selector/selector.styl'; 
import './components/card/card.styl'; 
import './components/editor/editor.styl';

render(
    <div>
        <div className="nav"></div>
        <div className="main">
            <div className="content">
                <div className="left"><Selector /></div>
                <div className="center"><Card /></div>
                <div className="right"><Editor /></div>
            </div>
        </div>
    </div>,
    document.getElementById('root')
);
