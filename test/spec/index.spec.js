/**
 * CoGraphQL
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file CoGraphQL 入口测试
 * @author Firede(firede@firede.us)
 */

import chai from 'chai';

import {CoServer, CoManager} from '../../lib/index';

const expect = chai.expect;

describe('index', () => {
    it('CoServer exists', () => {
        expect(typeof CoServer).to.equal('function');
    });

    it('CoManager exists', () => {
        expect(typeof CoManager).to.equal('function');
    });
});
