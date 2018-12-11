## Login [/login]

A Question object has the following attributes:

### Login [POST]

+ username (string) - A user name.
+ password (string) - A password.

+ Request (text/plain)

    + Headers

            noredirect: true

    + Body

            username=username&password=password
                        
+ Response 200 (application/json)

            {"status":"ok"}
