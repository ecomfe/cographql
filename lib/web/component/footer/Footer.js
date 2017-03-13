/**
 * @file Footer 组件
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React from 'react';
import './Footer.styl';

export default class Footer extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="footer">
                Copyright &copy;2017 EFE. All Rights Reserved
            </div>
        );
    }
}
