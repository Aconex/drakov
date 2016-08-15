module.exports = function (grunt) {

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
            api: {src: 'test/api/*-test.js'},
            unit: {src: 'test/unit/*-test.js'}
        },
        'blueprint-validator': {
            'contract-test':{
                mdFiles: 'test/example/**/*.md',
                failOnWarnings: true
            }
        }
    });

    // For this to work, you need to have run `npm install grunt-simple-mocha`
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-blueprint-validator');

    grunt.task.registerTask('unit-test', ['simplemocha:unit']);
    grunt.task.registerTask('test', ['blueprint-validator', 'simplemocha:api', 'simplemocha:unit']);
    grunt.task.registerTask('default', ['jshint', 'test']);
};
