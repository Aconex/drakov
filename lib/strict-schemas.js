
//cache updated maps
const schemaMap = new Map();

exports.rejectUnknownProps = (req) => req.headers['reject-unknown-props'] === 'true';

exports.getStrictSchema = (schema) => {
    if (!schemaMap.has(schema)) {
        schemaMap.set(schema, addAddtionalPropsFalse(schema));
    }

    return schemaMap.get(schema);
};

function addAddtionalPropsFalse(schema) {
    let newSchema = Object.assign({}, schema, {additionalProperties: false});
    Object.keys(schema.properties).forEach(key =>{
        let child = schema.properties[key];
        if (child.type === 'object') {
            schema.properties[key] = addAddtionalPropsFalse(child);
        }
    });

    return newSchema;
}
