/**
 * @file store 管理数据
 * @author li ang(liang07@baidu.com)
 */

import {createStore} from 'redux';

const reducer = (state = {}, action) => {
    switch (action.type) {
        case 'upDateCard':
            var newState = Object.assign({}, state, {
                cards: action.cards
            });

            return newState;

        case 'upDateBread':
            var newState = Object.assign({}, state, {
                bread: action.bread
            });

            return newState;

        default:

            return state;
    }
};

const store = createStore(reducer);

export default store;
