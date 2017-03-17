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
    query introspectionQuery {
      __schema {
        queryType {
          ...FullType
        }
        mutationType {
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
      fields {
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
      fields {
        name
        description
        type {
          kind
          name
          description
          ...OftypeRef
        }
      }
      ofType {
        kind
        name
        fields {
          name
          description
          type {
            kind
            name
            description
          }
        }
        ofType {
          kind
          name
          fields {
            name
            description
            type {
              kind
              name
              description
            }
          }
          ofType {
            kind
            name
            fields {
              name
              description
              type {
                kind
                name
                description
              }
            }
            ofType {
              kind
              name
              fields {
                name
                description
                type {
                  kind
                  name
                  description
                }
              }
              ofType {
                kind
                name
                fields {
                  name
                  description
                  type {
                    kind
                    name
                    description
                  }
                }
                ofType {
                  kind
                  name
                  fields {
                    name
                    description
                    type {
                      kind
                      name
                      description
                    }
                  }
                  ofType {
                    kind
                    name
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
              }
            }
          }
        }
      }
    }

    fragment OftypeRef on __Type {
      ofType {
        kind
        name
        fields {
          name
          description
          type {
            kind
            name
            description
          }
        }
        ofType {
          kind
          name
          fields {
            name
            description
            type {
              kind
              name
              description
            }
          }
          ofType {
            kind
            name
            fields {
              name
              description
              type {
                kind
                name
                description
              }
            }
            ofType {
              kind
              name
              fields {
                name
                description
                type {
                  kind
                  name
                  description
                }
              }
              ofType {
                kind
                name
                fields {
                  name
                  description
                  type {
                    kind
                    name
                    description
                  }
                }
                ofType {
                  kind
                  name
                  fields {
                    name
                    description
                    type {
                      kind
                      name
                      description
                    }
                  }
                  ofType {
                    kind
                    name
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
              }
            }
          }
        }
      }
    }
`;

export const typeQuery = `
    query typeQuery($name: String!) {
        __type(name: $name) {
            fields {
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
    }

    fragment FullType on __Type {
        kind
        name
        description
        fields {
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
        fields {
            name
            description
        }
        ofType {
            kind
            name
            fields {
                name
                description
            }
            ofType {
                kind
                name
                fields {
                    name
                    description
                }
                ofType {
                    kind
                    name
                    fields {
                        name
                        description
                    }
                    ofType {
                        kind
                        name
                        fields {
                            name
                            description
                        }
                        ofType {
                            kind
                            name
                            fields {
                                name
                                description
                            }
                            ofType {
                                kind
                                name
                                fields {
                                    name
                                    description
                                }
                                ofType {
                                    kind
                                    name
                                    fields {
                                        name
                                        description
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

`;
