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
    .controller('ManageTermCtrl', ['dictionaryModel', 'ENV', '$state', '$mdDialog', '$scope', '$http', function (dictionaryModel, ENV, $state, $mdDialog, $scope, $http) {
        var self = this;

        self.froalaOptions = {
            toolbarButtons: ['bold', 'italic', 'underline', '|', 'align', 'outdent', 'indent', 'formatOL', 'formatUL', 'quote', '|', 'insertTable', 'insertHR', 'insertLink', 'insertImage', 'insertFile', '|', 'undo', 'redo', 'clearFormatting', 'selectAll'/*, 'html'*/]
        };

        //Populate dropdowns
        dictionaryModel.fetch(ENV.categoryUrl).then(function (data) {
            self.categoryOptions = data;
        });

        //pagination vars
        self.pageSize = 5;
        self.pageOptions = ['5', '10', '25'];
        //TODO: load availableTermsList for related terms

        self.deleteFlag = 'N'; //new terms default to active
        self.historyObj = {};

        self.historyObj.termCreatedBy = 'Dubby';
        self.historyObj.termCreatedByDate = '05/24/2017';
        self.historyObj.termCreatedAppl = 'What is it?';
        self.historyObj.termUpdatedBy = 'Dubby';
        self.historyObj.termUpdatedByDate = '05/24/2016';
        self.historyObj.termUpdateAppl = 'What it is!';
        self.historyObj.termSource = "Source? We don't need no stinking source";

        $scope.historyObj = self.historyObj;
        self.pageType = $state.params.type;
      self.termTitle = self.pageType === 'acronym' ? 'Full-name' : 'Term';

        // TODO: these will be retrieved from the WS call for editing a term
        if ($state.params.result.id) {
            self.result = $state.params.result;
            self.termIDFound = self.result.id.length !== 0 ? true : false;

            self.deleteFlag = 'Y';
            self.noteText = 'This is the Note text';
            self.relatedTermsList = [{'id': '1', 'desc': 'CDM', 'category': 'Supply Change Management'}];

            /*        self.historyObj.termCreatedBy = 'Dubby';
             self.historyObj.termCreatedByDate = '05/24/2017';
             self.historyObj.termCreatedAppl = 'What is it?';
             self.historyObj.termUpdatedBy = 'Dubby';
             self.historyObj.termUpdatedByDate = '05/24/2016';
             self.historyObj.termUpdateAppl = 'What it is!';
             self.historyObj.termSource = "Source? We don't need no stinking source";*/

        }
        else {

            self.result = {};
            self.result.id = 9402; //TODO: will be retrieved from insert
            self.termIDFound = false;
            self.result.acronym = '';
            self.result.abbrev_simplified = '';
            self.result.term = '';
            self.result.definitionHTML = '';
            self.result.categories = [];
            self.relatedTermsList = [];

            self.deleteFlag = 'N';
            self.termAnchor = '';
            self.termRemoteURL = '';
            self.noteText = '';

            /*        self.historyObj.termCreatedBy = '';
             self.historyObj.termCreatedByDate = '';
             self.historyObj.termCreatedAppl = '';
             self.historyObj.termUpdatedBy = '';
             self.historyObj.termUpdatedByDate = '';
             self.historyObj.termUpdateAppl = '';
             self.historyObj.termSource = '';*/
        }

      self.acronymFound = ((self.result.acronym !== null && self.result.acronym.length > 0) || self.pageType === 'acronym') ? true : false;

      self.termSupersededBy = {'id': '', 'name': ''};

        self.availableTermsList = [
            {'id': '1', 'desc': 'CDM', 'category': 'Supply Change Management'},
            {'id': '501', 'desc': 'PLT', 'category': 'Human Resources'},
            {'id': '1234', 'desc': 'Leave', 'category': 'Facilities'},
            {'id': '2', 'desc': '9/80 Schedule', 'category': 'ES&H'},
            {'id': '333', 'desc': 'Schedule', 'category': 'Corporate Governance'},
            {'id': '44', 'desc': 'Paycheck', 'category': 'Finance'},
            {'id': '5', 'desc': 'Phones', 'category': 'Information Management & Cyber Security'},
            {'id': '12', 'desc': 'PEDs', 'category': 'Information Management & Cyber Security'},
            {'id': '2', 'desc': 'SNAFU', 'category': 'Other Corporate Terms'},
            {'id': '502', 'desc': '9/80 Schedule A', 'category': 'Human Resources'},
            {'id': '503', 'desc': '9/80 Schedule B', 'category': 'Human Resources'}
        ];
        self.numRecords = self.availableTermsList.length;

        //methods for category list
        //self.categoryOptions
        self.removeCategory = function (index) {
            self.result.categories.splice(index, 1);
        };

        self.addCategory = function (selectedCategory) {
            var found = -1;
            var count = self.result.categories.length;
            for (var a = 0; a < count; a++) {
                var category = self.result.categories[a];
                if (category.name === selectedCategory.name) {
                    found = a;
                    break;
                }
            }
            if (found === -1) {
                self.result.categories.push(selectedCategory);
            }
        };

        //methods for related terms list
        self.inList = function (id) {
            var position = -1;
            var len = self.relatedTermsList.length;
            for (var a = 0; a < len; a++) {
                var relatedTerm = self.relatedTermsList[a];
                if (relatedTerm.id === id) {
                    position = a;
                    break;
                }
            }
            return position;
        };

        self.updateTermList = function (id) {
            var thisID = id.id;
            var position = self.inList(thisID);
            if (position !== -1) {//found now remove
                self.relatedTermsList.splice(position, 1);
            } else {//not found now add
                self.relatedTermsList.push(id);
            }
        };

        self.replaceTerm = function (id) {
          self.termSupersededBy.id = id; //TODO: set name
        };

        //action buttons
        self.submitChange = function () {

          console.info("Acronym: " + self.result.acronym);

          console.info("Simplified: " + self.result.abbrev_simplified);
          console.info("Full-name: " + self.result.term);
          console.info("Status: " + self.deleteFlag);
          console.info("SupersededBy: " + self.termSupersededBy);
          console.info("Definition: " + self.result.definition);
          console.info("Categories: " + self.result.categories);
          console.info("Related terms: " + self.relatedTermsList);
          console.info("Reason for creation: " + self.noteText);


          $http.post('https://info-dev.sandia.gov/cadm/apis/cadm.php?action=getAcronym');


          /*
            $state.go('home', {
                'id': self.result.id
            });
           */
        };
        self.cancel = function () {
            $state.go('home');
        };

        self.popupHistoryDialog = function (ev) {
            console.log('history clicked');
            $mdDialog.show({
                clickOutsideToClose: false,
                parent: angular.element(document.body),
                targetEvent: ev,
                escapeToClose: true,
                templateUrl: 'app/components/admin/historyModal.tpl.html',
                controller: function ($scope, $mdDialog) {
                    var w = this;
                    w.historyObj = {};
                    w.historyObj = self.historyObj;
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };

                },
                controllerAs: 'ctrl'
            });

        };
    }])
;
function helpText(obj) {
    alert($(obj).attr('title'));
}
