FORMAT: 1A

# Return all the things
Lists all the things from the API

## Parametrized endpoint [/api/sababa/{itemid}]

+ Parameters
    + itemid (string, `12345`) ... ID of the desired thing.

### Retrieve item by id [GET]

+ Response 200 (application/json;charset=UTF-8)

    + Body

            { "response-type": "parametrized" }
            
## Static endpoint [/api/sababa/static]

### That is a static endpoint [GET]

+ Response 200 (application/json;charset=UTF-8)

    + Body

            { "response-type": "static" }
