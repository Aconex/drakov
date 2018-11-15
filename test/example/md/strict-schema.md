# Note [/notes]

## Add a Note [POST]

+ Request (application/json)

    + Schema

            {
                "type": "object",
                "required": ["id", "data"],
                "properties": {
                    "id": {"type": "number"},
                    "title": {"type": "string" },
                    "data": {
                        "type": "object",
                        "properties": {
                            "subdata": {
                                "type": "object",
                                "properties": {
                                    "subsubdata": {"type": "string"}
                                },
                                "required": ["subsubdata"]
                            }
                        },
                        "required": ["subdata"]
                    }
                }
            }


+ Response 201 (application/json)

  
