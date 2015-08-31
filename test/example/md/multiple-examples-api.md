FORMAT: 1A

# Return all the things
Lists all the things from the API

## Things [/api/multiple]

### Retrieve from GET [GET]
First GET example with header 

+ Request

    + Headers

        Custom-header: First
        

+ Response 200 (application/json;charset=UTF-8)

    + Body

            {"first": "response"}
            


### Retrieve from GET [GET]
Second GET example with header 

+ Request

    + Headers

        Custom-header: Second
        

+ Response 200 (application/json;charset=UTF-8)

    + Body

            {"second": "response"}

### Retrieve from GET [GET]
Get examples with a specific status code (eg. 400)

+ Response 400 (application/json;charset=UTF-8)

    + Body

            {"error": "Bad request"}

### Post to the first example [POST]

+ Request (application/json)
First POST example with body 

    + Body

        {"first": "example"}

+ Response 200 (application/json;charset=UTF-8)

    + Body

        {
            "first": "example",
            "status": "ok"
        }

### Post to the second example [POST]

+ Request (application/json)
Second POST example with body 

    + Body

        {"second": "example"}

+ Response 200 (application/json;charset=UTF-8)

    + Body

        {
            "second": "example",
            "status": "ok"
        }

### Post to the first non-json example [POST]

+ Request 
Second POST example with body

    + Headers

        content-type: application/x-www-form-urlencoded

    + Body

        first=non-json
        
+ Response 200 (application/json;charset=UTF-8)

    + Body

        {
            "first": "non-json",
            "status": "ok"
        }


### Post to the second non-json example [POST]

+ Request
Second POST example with body

    + Headers

        content-type: application/x-www-form-urlencoded

    + Body

        second=non-json

+ Response 200 (application/json;charset=UTF-8)

    + Body

        {
            "second": "non-json",
            "status": "ok"
        }
