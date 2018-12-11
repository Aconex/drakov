
//cache updated maps
const schemaMap = new Map();

exports.rejectUnknownProps = (req) => req.headers['reject-unknown-props'] === 'true';

exports.getStrictSchema = (schema) => {
    if (!schemaMap.has(schema)) {
        schemaMap.set(schema, setAdditionalPropsFalse(schema));
    }

    return schemaMap.get(schema);
};

function setAdditionalPropsFalse(schema) {
    let newSchema = Object.assign({}, schema, { additionalProperties: false });

    if (newSchema.properties) {
        newSchema.properties = Object.assign({}, newSchema.properties);
        Object.keys(newSchema.properties).forEach(key => {
            let child = newSchema.properties[key];
            if (child.type === 'object') {
                newSchema.properties[key] = setAdditionalPropsFalse(child);
            }
        });
    }

    return newSchema;
}
