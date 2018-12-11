FORMAT: 1A

# Accept Form Urlencoded
Accept form urlencoded request type

## Things [/api/urlencoded]

### Accept urlencoded request using schema [POST]

+ Request (application/x-www-form-urlencoded)

    + Body

            random_number=4&static=not_random

+ Response 200 (application/json;charset=UTF-8)

    + Body

            {
              "success": true
            }
