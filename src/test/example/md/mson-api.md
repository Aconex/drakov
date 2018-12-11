FORMAT: 1A

# Return all the things
Lists all the things from the API

## Things [/api/things]

+ Attributes (object)
    + text: Zip2
    + id: 1

### Retrieve all the things [GET]

+ Response 200 (application/json;charset=UTF-8)

    + Attributes(array[Things])

### Create a new thing [POST]

+ Request (application/json)
Create a new thing

    + Attributes (object)
        + text: Hyperspeed jet (string)

+ Response 200 (application/json;charset=UTF-8)

    + Attributes (object)
        + id: 1 (string)
        + text: Hyperspeed jet (string)

### Allow cross site origin [OPTIONS]

+ Response 200
    + Headers

            Access-Control-Allow-Origin: custom-domain.com

## Things [/api/things/{thingId}]

+ Parameters
    + thingId (string, `12345`) ... ID of the desired thing.

### Retrieve all a thing by it's id [GET]

+ Response 200 (application/json;charset=UTF-8)

    + Attributes (array[Things])

### Update thing by it's id [POST]

+ Request (application/json)
Update the text of the thing

    + Attributes (array[Things])

+ Response 200 (application/json;charset=UTF-8)

    + Attributes (array[Things])

## Likes [/api/things/{thingId}/like]

+ Parameters
    + thingId (string, `12345`) ... ID of the desired thing.

### Register a like on a thing [PUT]

+ Response 200 (application/json;charset=UTF-8)

    + Attributes (object)
        + like: true (boolean)


## Things undefined charset [/api/charsetless]

### Retrieve all the things and not add charset on the response [GET]

+ Response 200 (application/json)

    + Attributes (object)
        + id: 1
        + charset: not present
