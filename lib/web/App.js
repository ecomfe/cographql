/**
 * @file 页面入口
 * @author ielgnaw(wuji0223@gmail.com)
 */

import React, {Component} from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';

import Header from './component/header/Header';
import Footer from './component/footer/Footer';
import List from './list/List';

import 'bootstrap/dist/css/bootstrap.css';
import './css/common.styl';

class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className="container-fluid">
                    <Header {...this.props} />
                </div>
                <div className="container-fluid main-wrapper">
                    {this.props.children}
                </div>
                <div className="container-fluid">
                    <Footer />
                </div>
            </div>
        );
    }
}

async function init() {
    try {
        render(
            (
                <Router history={browserHistory}>
                    <Route path="/" component={App}>
                        <IndexRoute component={List}/>
                        <Route path="/" component={List}/>
                    </Route>
                </Router>
            ),
            document.getElementById('root'),
            () => {
                console.log('render done');
            }
        );

        // const account = await reqwest({
        //     url: '/account',
        //     type: 'json',
        //     method: 'get',
        //     contentType: 'application/json',
        //     crossOrigin: true,
        //     withCredentials: true
        // });

        // render(
        //     (
        //         <Router history={browserHistory}>
        //             <Route path="/" component={App} username={account.data.username}>
        //                 <IndexRoute component={Main}/>
        //                 <Route path="/" component={Main}/>
        //                 <Route path="/generalModel" component={GeneralModel}/>
        //                 <Route path="/fastCustom" component={FastCustom}/>
        //                 <Route path="/completeCustom" component={CompleteCustom} username={account.data.username}/>
        //                 <Route path="/customManage" component={CustomManage} username={account.data.username}/>
        //                 <Route path="/document" component={Document}/>
        //             </Route>
        //         </Router>
        //     ),
        //     document.getElementById('root'),
        //     () => {
        //         console.log('render done');
        //     }
        // );
    }
    catch (e) {
        console.error('/account', e);
    }
}

init();
