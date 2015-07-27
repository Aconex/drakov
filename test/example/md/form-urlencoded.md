FORMAT: 1A

# Accept Form Urlencoded
Accept form urlencoded request type

## Things [/api/urlencoded]

### Accept urlencoded request using schema [POST]

+ Request (application/x-www-form-urlencoded)

    + Body

            {
                "random_number": "4",
                "static": "not_random"
            }

    + Schema

            {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "id": "http://jsonschema.net",
                "type": "object",
                "properties": {
                    "random_number": {
                        "id": "http://jsonschema.net/random_number",
                        "type": "string",
                        "description": "chosen by fair dice roll. guaranteed to be random"
                    },
                    "static": {
                        "id": "http://jsonschema.net/static",
                        "type": "string",
                        "description": "not random"
                    }
                },
                "required": [
                "random_number",
                "static"
                ]
            }

+ Response 200 (application/json;charset=UTF-8)

    + Body

            {
              "success": true
            }
