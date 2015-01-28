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

            all: {src: 'test/*-test.js'}
        }
    });

    // For this to work, you need to have run `npm install grunt-simple-mocha`
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.task.registerTask('test', ['simplemocha']);
    grunt.task.registerTask('default', ['jshint', 'test']);
};
