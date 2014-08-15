var fs = require('fs');
var protagonist = require('protagonist');

var route = require('./route');

exports.readFile = function (app, path) {
    return function(cb){
        fs.readFile(path, function (err, data) {
            if (err) throw err;

            protagonist.parse(new Buffer(data).toString('utf8'), function(error, result) {
                if (error) {
                    console.log(error);
                    return;
                }

                result.ast.resourceGroups.forEach(function(resourceGroup){
                    resourceGroup.resources.forEach(function(resource){
                        resource.actions.forEach(function(action){
                            route.setRoute(app, action.method, resource.uriTemplate, action);
                        });
                    });
                });

                cb();

            });

        });
    };

};
