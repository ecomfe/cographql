/**
 * @file 页面入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {Spin, Layout} from 'antd';

import 'antd/dist/antd.css';

import AppHeader from './component/header/Header';
import AppFooter from './component/footer/Footer';
import List from './list/List';
import store from './common/store';
import {get, post} from './common/request';

import './css/common.styl';

const {Header, Footer, Sider, Content} = Layout;

// const subscribe = app => {
//     let currValue;
//     store.subscribe(() => {
//         let state = store.getState();
//         app.setState({
//             schemaInfo: state.schemaInfo
//         });
//     });
// };

class App extends Component {
    constructor(props) {
        super(props);
        // subscribe(this);
    }

    state = {}

    async componentDidMount() {
    }

    render() {
        return (
            <Layout className="app-wrapper">
                <Header className="app-header"><AppHeader /></Header>
                <Content className="app-content">
                    {this.props.children}
                </Content>
                <Footer><AppFooter /></Footer>
            </Layout>
        );
    }
}

render(
    (
        <Router history={browserHistory}>
            <Route path="/cographql" component={App}>
                <IndexRoute component={List}/>
                <Route path="/cographql" component={List}/>
            </Route>
        </Router>
    ),
    document.getElementById('root'),
    () => {
        console.log('render done');
    }
);
