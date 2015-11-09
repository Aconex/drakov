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

+ Request

    + Headers

            Custom-header: Second
        

+ Response 200 (application/json;charset=UTF-8)

    + Body

            {"second": "response"}

+ Request

    + Headers

            Prefer: status=400

+ Response 400 (application/json;charset=UTF-8)
Get examples with a specific status code (eg. 400)
        
    + Body

            {"error": "Bad request"}
            
### Put to the first example [PUT]
            
+ Request (application/json)

    + Body

            {
                "id": 1,
                "title": "hello"
            }

    + Schema

            {
                "type": "object",
                "required": ["id"],
                "properties": {
                    "id": {"type": "number"},
                    "title": {"type": "string" }
                }
            } 
            
+ Response 201 (application/json)

+ Request (application/json)

    + Body

            {
                "id": 2,
                "title": "hello"
            }

    + Schema

            {
                "type": "object",
                "required": ["id"],
                "properties": {
                    "id": {"type": "number"},
                    "title": {"type": "string" }
                }
            }

+ Response 400 (application/json)

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
