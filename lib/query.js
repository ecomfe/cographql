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
        ...fullType
      }
      mutationType {
        ...fullType
      }
      types {
        ...fullType
      }
    }
  }

  fragment fullType on __Type {
    kind
    name
    fields {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...typeRef
      }
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type {
      ...typeRef
    }
    defaultValue
  }

  fragment typeRef on __Type {
    kind
    name
    description
    fields {
      name
      description
      type {
        kind
        name
        description
        fields {
          name
          description
          type {
            kind
            name
            description
            fields {
              name
              description
              type {
                kind
                name
                description
                fields {
                  name
                  description
                  type {
                    kind
                    name
                    description
                    ...ofTypeRef
                  }
                }
                ...ofTypeRef
              }
            }
            ...ofTypeRef
          }
        }
        ...ofTypeRef
      }
    }
    ...ofTypeRef
  }

  fragment ofTypeRef on __Type {
    ofType {
      kind
      name
      description
      fields {
        name
        description
        type {
          kind
          name
          description
          fields {
            name
            description
            type {
              kind
              name
              description
              fields {
                name
                description
                type {
                  kind
                  name
                  description
                  fields {
                    name
                    description
                    type {
                      kind
                      name
                      description
                      ...ofTypeRef1
                    }
                  }
                  ...ofTypeRef1
                }
              }
              ...ofTypeRef1
            }
          }
          ofType {
            kind
            name
            description
            fields {
              name
              description
              type {
                kind
                name
                description
                fields {
                  name
                  description
                  type {
                    kind
                    name
                    description
                    fields {
                      name
                      description
                      type {
                        kind
                        name
                        description
                        fields {
                          name
                          description
                          type {
                            kind
                            name
                            description
                            ...ofTypeRef1
                          }
                        }
                        ...ofTypeRef1
                      }
                    }
                    ...ofTypeRef1
                  }
                }
                ofType {
                  kind
                  name
                  description
                  fields {
                    name
                    description
                  }
                }
              }
            }
            ...ofTypeRef1
          }
        }
      }
      ...ofTypeRef1
    }
  }

  fragment ofTypeRef1 on __Type {
    ofType {
      kind
      name
      description
      fields {
        name
        description
        type {
          kind
          name
          description
          # fields {
          #   name
          #   description
          #   type {
          #     kind
          #     name
          #     description
          #   }
          # }
          ofType {
            kind
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
