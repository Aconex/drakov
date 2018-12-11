module.exports = function (grunt) {

    grunt.initConfig({

        eslint: {
            target: ['src/lib/**/*.js','src/test/**/*.js']
        },
        simplemocha: {
            options: {
                globals: ['should'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'tap'
            },
            api: {src: 'build/test/api/*-test.js'},
            unit: {src: 'build/test/unit/**/*-test.js'}
        },
        'blueprint-validator': {
            'contract-test':{
                mdFiles: 'build/test/example/**/*.md',
                failOnWarnings: true
            }
        }
    });

    // For this to work, you need to have run `npm install grunt-simple-mocha`
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-blueprint-validator');

    grunt.task.registerTask('unit-test', ['simplemocha:unit']);
    grunt.task.registerTask('test', ['blueprint-validator', 'simplemocha:unit', 'simplemocha:api']);
    grunt.task.registerTask('default', ['eslint', 'test']);
};
