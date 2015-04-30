#Scarlet Apartments 

## Founders 
* Manan Bavishi - CEO
* Mushaheed Kapadia - CTO

## The Backend API

The Backend API is a RESTful API. Simply make `GET`, `POST`, `PUT`, and `DELETE` requests to certain URLs, and it'll give you back a JSON object letting you know if things happened.

### Base URL: 
URL: `http://.scarletapartments.me/api`

OR, if you're doing local development: 

URL: `http://localhost/api`

Side Note: The backend api runs on port 3000, so you can access it from there as well.


### Index Routes

URL suffix: `None`

#### Get Root Route

Type: `GET`

Route: `/`

Description: Returns a JSON that has the status of the API.

Response: 

    {
        'status' : true,
        'message' : "root route"
    }

#### Get Current User

Type: `GET`

Route: `/currentUser`

Description: Gets the current user that is logged in based on the session

Response: 

    {
        'status': true, 
        'user': user-object
    }


### Student Routes

URL suffix: '/students'

#### Get All Student Accounts

TYPE: `GET`

Route: `/`

Description: Gets all the student accounts

Response:

    {
        'status': true, 
        'students': array filled with student accounts
    }

#### Get Specific Student Account

TYPE: `GET`

Route: `/:username`

Description: Get the specified student account

Response:

    {
        'status': true, 
        'student': student account
    }
