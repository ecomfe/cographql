/**
 * @file graphql 常用 query 集合
 * @author ielgnaw(wuji0223@gmail.com)
 */

/**
 * 简单的自省查询
 *
 * @type {string}
 */
export const simpleIntrospectionQuery = `{
    __schema {
        queryType {
            name
            description
            fields {
                name
                description
                type {
                    kind
                    name
                    description
                }
            }
        },
        mutationType {
            name
            description
            fields {
                name
                description
                type {
                    kind
                    name
                    description
                }
            }
        }
    }
}`;
