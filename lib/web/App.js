/**
 * @file 页面入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React from 'react';
import {render} from 'react-dom';
import AjaxButton from './components/AjaxButton';

import './App.styl';

render(
    <div>
        <ul>
            <li>112331</li>
            <li>eesde</li>
            <li>qwewe</li>
        </ul>
        <span className="ccc"></span>
        <img src="https://www.baidu.com/img/baidu_jgylogo3.gif" />
        {<img src={require('./css/img/react-logo.png')} style={{height: '50px', width: '50px'}}/>}
        <br/>
        <i className="icon-mute iconfont"></i>
        <br/>
        <AjaxButton start={1}/>
    </div>,
    document.getElementById('root')
);
