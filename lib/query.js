/**
 * @file graphql 常用 query 集合
 * @author ielgnaw(wuji0223@gmail.com)
 */

/**
 * 简单的自省查询
 *
 * @type {string}
 */
export const simpleIntrospectionQuery = `
    query IntrospectionQuery {
        __schema {
            queryType {
                kind
                name
                description
                ...FullType
            }
            mutationType {
                kind
                name
                description
                ...FullType
            }
            types {
                ...FullType
            }
        }
    }

    fragment FullType on __Type {
        kind
        name
        description
        fields(includeDeprecated: true) {
            name
            description
            args {
                ...InputValue
            }
            type {
                ...TypeRef
            }
        }
    }

    fragment InputValue on __InputValue {
        name
        description
        type {
            ...TypeRef
        }
        defaultValue
    }

    fragment TypeRef on __Type {
        kind
        name
        ofType {
            kind
            name
            ofType {
            kind
                name
                ofType {
                    kind
                    name
                    ofType {
                        kind
                        name
                        ofType {
                            kind
                            name
                            ofType {
                                kind
                                name
                                ofType {
                                    kind
                                    name
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;
