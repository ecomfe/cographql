/**
 * @file type 查询
 * @author ielgnaw(wuji0223@gmail.com)
 */

// export const TYPE_QUERY = `
//   query typeQuery($name: String!) {
//     __type(name: $name) {
//       name
//       fields {
//         name
//         description
//         type {
//           kind
//           name
//           description
//           fields {
//             name
//             description
//             type {
//               kind
//               name
//               description
//               ofType {
//                 kind
//                 name
//                 description
//               }
//             }
//           }
//           ...ofTypeRef
//         }
//       }
//     }
//   }
//   fragment ofTypeRef on __Type {
//     ofType {
//       kind
//       name
//       description
//       ofType {
//         kind
//         name
//         description
//         fields {
//           name
//           description
//         }
//       }
//     }
//   }
// `;

export const TYPE_QUERY = `
  query typeQuery($name: String!) {
    __type(name: $name) {
      name
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
              ofType {
                kind
                name
                description
              }
            }
          }
          ...ofTypeRef
        }
      }
    }
  }
  fragment ofTypeRef on __Type {
    ofType {
      kind
      name
      description
      ofType {
        kind
        name
        description
      }
    }
  }
`;
