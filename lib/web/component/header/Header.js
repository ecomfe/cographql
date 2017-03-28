/**
 * @file Header 组件
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React from 'react';

import './Header.styl';
import logo from '../../css/img/logo.png';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="header">
                <img src={logo} />
            </div>
        );
    }
}
