FORMAT: 1A

# Return all the things
Lists all the things from the API

## Things [/api/things]

### Retrieve all the things [GET]

+ Response 200 (application/json;charset=UTF-8)

    + Body

            [
               {
                  "text":"Zip2",
                  "id": "1"
                },
               {
                  "text":"X.com",
                  "id": "2"
                },
               {
                  "text":"SpaceX",
                  "id": "3"
                },
               {
                  "text":"Solar City",
                  "id": "4"
                },
               {
                  "text":"Hyperloop",
                  "id": "5"
                }
            ]

## Things [/api/things/{thingId}]

+ Parameters
    + thingId (string, `12345`) ... ID of the desired thing.

### Retrieve all a thing by it's id [GET]

+ Response 200 (application/json;charset=UTF-8)

    + Body

            [
                {
                   "text":"Zip2",
                   "id": "1"
                }
            ]

### Update thing by it's id [POST]

+ Request ( application/json)
Update the text of the thing

    + Body

        {
            "text": "Hyperspeed jet",
            "id": "1"
        }

+ Response 200 (application/json;charset=UTF-8)

    + Body

        {
            "text": "Hyperspeed jet",
            "id": "1"
        }

## Likes [/api/things/{thingId}/like]

+ Parameters
    + thingId (string, `12345`) ... ID of the desired thing.

### Register a like on a thing [PUT]

+ Response 200 (application/json;charset=UTF-8)

    + Body

            { "like": true }
