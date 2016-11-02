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
angular.module('corpDictApp')
    .controller('ViewTermsCtrl', ['$state', 'ENV', 'dictionaryModel', 'searchTerm', function ($state, ENV, dictionaryModel, searchTerm) {
        var self = this;
      self.statusOptions = [{value: 'N', option: 'Active'}, {value: 'Y', option: 'Inactive'}, {value: '', option: 'Any Status'}];

        dictionaryModel.fetch(ENV.categoryUrl).then(function (data) {
            self.categoryOptions = data;
        });

        self.loadAlphaPage = function () {
            dictionaryModel.fetchFilteredTerms(ENV.termByIndexUrl + self.alphaIndex.value).then(function (data) {
                self.terms = data;
            });
        };

      self.loadFilteredResults = function () {
        console.log('calling search ws with filter: ' + self.search.text + ' searching Term: ' + self.search.term + ' searching definition: ' + self.search.definition + ' searching id: ' + self.search.id);
        dictionaryModel.fetchFilteredTerms(ENV.termByFilterUrl, self.search.text, self.search.term, self.search.definition, self.search.id).then(function (data) {
                self.terms = data;
            });
        };

      self.editTerm = function (result) {
        //console.log("results: " + results);
        $state.go('manageTerms', {result: result});
      };

      self.search = {'term': true, 'definition': true, 'id': false, 'active': self.statusOptions[0]};

      if (searchTerm) {
        console.log("searching for term with id " + searchTerm);
        self.search.text = searchTerm;
        self.search.term = false;
        self.search.definition = false;
        self.search.id = true;
        self.loadFilteredResults();
        console.log("searching for term with id " + self.search.text);
      }

    }])

    .service('dictionaryModel', ['$q', '$http', function DictionaryModel($q, $http) {
        var dictionaryModel = this;

        dictionaryModel.fetch = function ($url) {
            return $http.get($url).then(function (response) {
                return response.data;
            });
        };

      dictionaryModel.fetchFilteredTerms = function ($url, filterText) {
            //TODO: add logic to construct $url based on filter criteria
            console.info("running fetchFilteredTerms: " + $url + filterText);
        return $http.get($url + filterText).then(function (response) {
                return response.data;
            });
      };

    }]);

