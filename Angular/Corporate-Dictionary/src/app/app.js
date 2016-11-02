'use strict';

/**
 * @ngdoc overview
 * @project CADM
 * @name corpDictApp
 * @description
 * # corpDictApp
 *
 * Main module of the application.
 */
angular
    .module('corpDictApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ui.router',
        'ngSanitize',
        'ngAria',
        'ngMaterial',
        'ngMessages',
      'froala',
        /*'material.svgAssetsCache',*/
        'corpDictApp.config.constants',
      'angularUtils.directives.dirPagination'
    ])
    .value('froalaConfig', {
      toolbarInline: false,
      placeholderText: 'Enter Text Here'
    })
    .run(['$rootScope', '$timeout', '$window', '$location', '$state', '$stateParams',
        function ($rootScope, $timeout, $window, $location, $state) {
            $rootScope.angular = angular;
        }
    ])
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$sceDelegateProvider', '$locationProvider',
      function ($stateProvider, $urlRouterProvider, $httpProvider, $sceDelegateProvider, $locationProvider) {
            $httpProvider.defaults.withCredentials = true; // Allow cookies with ajax

            // For any unmatched url, redirect to the home page
            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('home', {
                  url: '/?id',
                    templateUrl: 'app/components/viewTerms.tpl.html',
                  controller: 'ViewTermsCtrl as ctrl',
                  resolve: {
                    searchTerm: ['$stateParams', function ($stateParams) {
                      return $stateParams.id;
                    }]
                  }
                })
                .state('manageTerms', {
                  url: '/manageTerms',
                  params: {
                    result: {},
                    action: 'create',
                    type: 'definition'
                  },
                  templateUrl: 'app/components/admin/manageTerm.tpl.html',
                  controller: 'ManageTermCtrl as ctrl'
                })
                .state('manageCategories', {
                    url: '/manageCategories',
                    templateUrl: 'app/components/admin/manageCategories.tpl.html',
                  controller: 'ManageTermCtrl as ctrl'
                })
                .state('createChangeReport', {
                    url: '/createChangeReport',
                    templateUrl: 'app/components/report/createChangeReport.tpl.html',
                  controller: 'ManageTermCtrl as ctrl'
                })
                .state('createHistoryReport', {
                    url: '/createHistoryReport',
                    templateUrl: 'app/components/report/createHistoryReport.tpl.html',
                  controller: 'ManageTermCtrl as ctrl'
                })
                .state('createTermByDateReport', {
                    url: '/createTermByDateReport',
                    templateUrl: 'app/components/report/createTermByDateReport.tpl.html',
                  controller: 'ManageTermCtrl as ctrl'
                })
                .state('createReviewSpreadsheet', {
                    url: '/createReviewSpreadsheet',
                    templateUrl: 'app/components/report/createReviewSpreadsheet.tpl.html',
                  controller: 'ManageTermCtrl as ctrl'
                });
        }
    ])
;
