var drakov = require('./lib/drakov');

module.exports = function (grunt) {

  var properties = {
    drakov: {
        sourceFiles: 'test/example/**/*.md',
        serverPort: 3000,
        staticPaths: 'test/example/static'
      }
  };

  grunt.initConfig({
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 3000,
        ignoreLeaks: false,
        //grep: '*-test',
        ui: 'bdd',
        reporter: 'tap'
      },

      all: { src: 'test/*.js' }
    }
  });

  // For this to work, you need to have run `npm install grunt-simple-mocha`
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.task.registerTask('functional-test', 'Log stuff.', function() {
    drakov.run(properties.drakov, this.async());
    grunt.task.run('simplemocha');
  });

  grunt.task.registerTask('test', ['functional-test']);

  grunt.task.registerTask('default', ['test']);
};
