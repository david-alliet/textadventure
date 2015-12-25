module.exports = function(grunt) {

   // Configure this grunt project:
   grunt.initConfig({
      // valid configuration options go here
      sass: {
         dist: {
            files: [{
               expand: true,
               cwd: 'scss',
               src: ['*.scss'],
               dest: "css",
               ext: ".css"
            }]
         }
      }
   });

   // Load plugins (example):
   grunt.loadNpmTasks('grunt-contrib-sass');

   // Default task(s).
   grunt.registerTask('default', ['sass']);
};
