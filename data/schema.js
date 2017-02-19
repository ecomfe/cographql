/**
 * @file schema 定义
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {GraphQLObjectType, GraphQLSchema, GraphQLString} from 'graphql';
import data from './user.json';
console.log(data);

// user type
const userType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: {type: GraphQLString},
        name: {type: GraphQLString},
    }
});

// query
const query = new GraphQLObjectType({
    name: 'Query',
    fields: {
        user: {
            type: userType,
            args: {
                id: { type: GraphQLString }
            },
            resolve: (_, args) => data[args.id]
        }
    }
});

// schema
const schema = new GraphQLSchema({
    query: query
});

export default schema;
