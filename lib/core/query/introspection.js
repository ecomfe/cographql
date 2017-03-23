/**
 * @file 自省查询
 * @author ielgnaw(wuji0223@gmail.com)
 */

export const INTROSPECTION_QUERY = `
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
