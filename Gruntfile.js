#!/usr/bin/env node
'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      target: {
        files: {
          'www/dist/vendor.min.js': [
          'www/lib/ionic/js/ionic.bundle.js',
          'www/lib/firebase/firebase-debug.js',
          'www/lib/angularfire/dist/angularfire.js',
          'www/lib/angular-file-upload/dist/angular-file-upload.js',
          'www/lib/ngCordova/dist/ng-cordova.js',
          'www/lib/aws-sdk/dist/aws-sdk.min.js'
          ]
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['uglify']);
};