var drakov = require('./lib/drakov');
var drakovPort = require('./test/lib').port;

module.exports = function (grunt) {

    var properties = {
        drakov: {
            sourceFiles: 'test/example/**/*.md',
            serverPort: drakovPort,
            staticPaths: 'test/example/static',
            stealthmode: true
        }
    };

    grunt.initConfig({

        jshint: {
            options: {
                jshintrc: true,
                ignores: [
                    'describe',
                    'it'
                ]
            },
            files: [
                'lib/**/*.js',
                'test/**/*.js',
                'index.js'
            ]
        },

        simplemocha: {
            options: {
                globals: ['should'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'tap'
            },

            all: {src: 'test/*.js'}
        }
    });

    // For this to work, you need to have run `npm install grunt-simple-mocha`
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.task.registerTask('functional-test', 'Log stuff.', function () {
        drakov.run(properties.drakov, this.async());
        grunt.task.run('simplemocha');
    });

    grunt.task.registerTask('test', ['functional-test']);
    grunt.task.registerTask('default', ['jshint', 'test']);
};
