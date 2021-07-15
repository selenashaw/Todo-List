How to use the TodoList API:
(Postman on localhost:3000/)

--------------------------------------------------------
Users:
--------------------------------------------------------

To register a user:
  post request to '/register' with a json body like the example below:
    {
      "username": "username",
      "password": "password"
    }

To login:
  post request to '/login' with the same json body as was used for registration
  !!! Once this is finished a token is sent to the user, this will be needed in 
  the x-auth-token key-value header pair for other operations including deleting
  a user and all of the list functions.!!!

To delete a user:
  post request to '/deleteuser', user must be logged in to be deleted

I also added a boolean '/tokenIsValid' route for token checking

(I did not add logout functionality on the backend because it looks like since it is handled by the token it should be done on the front end)

--------------------------------------------------------
Todo Lists:
--------------------------------------------------------

To add a list: 
  post request to '/newlist' with a json body like the example below:
    {
      "title": "Title string",
      "content": "All the content for the todolist",
    } 
  - must be logged in with token in x-auth-token in header

To get all of the lists associated with a user:
  get request to '/lists' - must be logged in with token in x-auth-token in header

To get a specific list associated with a user:
  get request to '/lists/:id' where 'id' is a mongodb generated id for a specific list - must be logged in with token in x-auth-token in header

To delete a specific list:
  delete request to '/deletelist/:id' where 'id' is a mongodb generated id for a specific list - must be logged in with token in x-auth-token in header




Resources:
https://www.youtube.com/watch?app=desktop&v=zb3Qk8SG5Ms&list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU - suggested by Cedrick, explained express and mongodb 
https://www.youtube.com/watch?v=-MriYSYBmg0 - super helpful with understanding bcrypt and jwt for username/password/token implementation