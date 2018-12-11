FORMAT: 1A

# Return all the things
Lists all the things from the API

## Things [/headers]

### Retrieve a dummy object [GET]
Check Authorization header

+ Request

    + Headers

            Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==

+ Response 200

+ Request

    + Headers

            Authorization: Basic foo

+ Response 401

### Delete a dummy object [DELETE]
Respond to deletion of object

+ Response 200


## Things [/ignore_headers]

### Retrieve a dummy object [GET]
Check Cookie header

+ Request

    + Headers

            Cookie: key=value

+ Response 200

## Things [/things]

### Retrieve all the things with no header [GET]

+ Response 200 (application/json;charset=UTF-8)

    + Body

            {
              "header":"absent"
            }

+ Request JSON Message

    + Headers

            content-type: application/json


+ Response 200

    + Headers

            content-type: application/json;charset=UTF-8

    + Body

            {
                 "header":"json"
            }
