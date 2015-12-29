module.exports = function(grunt) {

   // Configure this grunt project:
   grunt.initConfig({
      // valid configuration options go here
      sass: {
         dist: {
            files: {
               'css/main.css': 'scss/main.scss',
               'css/textadventure.css': 'scss/textadventure.scss'
            }
         }
      },
      watch: {
         sass: {
            files: ['scss/{,**/}*.{scss,sass}'],
            tasks: ['sass']
         }
      },
      browserSync: {
         bsFiles: {
            src: ['css/*.css', 'js/*.js', 'gamedata/*.js', 'index.html']
         },
         options: {
            watchTask: true,
            server: {
               baseDir: './'
            }
         }
      }
   });

   // Load plugins (example):
   grunt.loadNpmTasks('grunt-contrib-sass');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-browser-sync');

   // Default task(s).
   grunt.registerTask('default', ['browserSync', 'watch']);
};
