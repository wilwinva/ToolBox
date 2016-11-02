'use strict';

/**
 * @ngdoc directive
 * @name corpDictApp.directive:snlAdminActions
 * @description
 * # snlAdminActions
 */
angular.module('corpDictApp')
    .directive('snlAdminActions', function () {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'app/components/admin/actions/adminActions.tpl.html',
            controller: 'AdminCtrl as ctrl'
        };
    })
    .controller('AdminCtrl', ['$scope', '$state', function ($scope, $state) {
        var self = this;
      self.action = "";


      self.actionSelected = function () {

        if (self.action === 'definition') {
          $state.go('manageTerms', {type: 'definition', action: 'create', result: {}}, {reload: true});
            }
        else if (self.action === 'acronym') {
          $state.go('manageTerms', {type: 'acronym', action: 'create', result: {}}, {reload: true});
        }
        else if (self.action === 'categories') {
          $state.go('manageCategories', {}, {reload: true});
        }
      }

    }]);
