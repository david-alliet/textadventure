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
      },
      watch: {
         sass: {
            files: ['scss/{,**/}*.{scss,sass}'],
            tasks: ['sass']
         }
      }
   });

   // Load plugins (example):
   grunt.loadNpmTasks('grunt-contrib-sass');
   grunt.loadNpmTasks('grunt-contrib-watch');

   // Default task(s).
   grunt.registerTask('default', ['watch']);
};
