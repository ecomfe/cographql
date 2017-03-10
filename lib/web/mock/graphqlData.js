const data = {
  "data": {
    "__schema": {
      "queryType": {
        "name": "BlogSchema",
        "description": "Root of the Blog Schema",
        "fields": [
          {
            "name": "posts",
            "description": "List of posts in the blog",
            "type": {
              "kind": "LIST",
              "name": null,
              "description": null
            }
          },
          {
            "name": "latestPost",
            "description": "Latest post in the blog",
            "type": {
              "kind": "OBJECT",
              "name": "Post",
              "description": "Represent the type of a blog post"
            }
          },
          {
            "name": "recentPosts",
            "description": "Recent posts in the blog",
            "type": {
              "kind": "LIST",
              "name": null,
              "description": null
            }
          },
          {
            "name": "post",
            "description": "Post by _id",
            "type": {
              "kind": "OBJECT",
              "name": "Post",
              "description": "Represent the type of a blog post"
            }
          },
          {
            "name": "authors",
            "description": "Available authors in the blog",
            "type": {
              "kind": "LIST",
              "name": null,
              "description": null
            }
          },
          {
            "name": "author",
            "description": "Author by _id",
            "type": {
              "kind": "OBJECT",
              "name": "Author",
              "description": "Represent the type of an author of a blog post or a comment"
            }
          }
        ]
      },
      "mutationType": {
        "name": "BlogMutations",
        "description": null,
        "fields": [
          {
            "name": "createPost",
            "description": "Create a new blog post",
            "type": {
              "kind": "OBJECT",
              "name": "Post",
              "description": "Represent the type of a blog post"
            }
          },
          {
            "name": "createAuthor",
            "description": "Create a new author",
            "type": {
              "kind": "OBJECT",
              "name": "Author",
              "description": "Represent the type of an author of a blog post or a comment"
            }
          }
        ]
      }
    }
  }
};

export default data;