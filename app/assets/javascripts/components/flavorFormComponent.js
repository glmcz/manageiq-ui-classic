ManageIQ.angular.app.component('flavorFormComponent', {
  controller: flavorFormController,
  controllerAs: 'vm',
  templateUrl: '/static/flavor/flavor_form.html.haml',
  bindings: {
    'repositoryId': '@',
  },
});
flavorFormController.$inject = ['miqService', 'API'];

function flavorFormController(miqService, API ) {
  var vm = this;

  var init = function() {

   vm.afterGet = false;

   vm.flavorModel = {
      name: '',
      ram: '',
      vcpus: '',
      disk: '',
      swap: '',
      rxtx_factor: '1.0',
      is_public: true,
      ems_id: '',
    };
    
    vm.model = 'flavorModel';
    vm.ems_list = [];

    ManageIQ.angular.scope = vm;

    vm.saveable = miqService.saveable;
    vm.newRecord = vm.repositoryId === 'new';
	
    vm.scm_credentials = [{name: __('Select credentials'), value: null}];
    API.get('/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending')
      .then(getCredentials)
      .catch(miqService.handleFailure);

    if (vm.repositoryId !== 'new') {
      API.get('/api/configuration_script_sources/' + vm.repositoryId + '?attributes=' + vm.attributes.join(','))
        .then(getRepositoryFormData)
        .catch(miqService.handleFailure);
    } else {
      API.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager')
        .then(getManagerResource)
        .catch(miqService.handleFailure);
    }
  };
  vm.cancelClicked = function() {
    miqService.sparkleOn();
    var message = __('Add of Flavor cancelled by user.');
    var url = '/flavor/show_list';
    miqService.redirectBack(message, 'warn', url);
  };

  vm.addClicked = function() {
    miqService.sparkleOn();
    API.post('/api/providers/' + vm.flavorModel.ems.id + '/flavors', vm.flavorModel)
      .then(getBack)
      .catch(miqService.handleFailure);
  };

  function setForm() {
    vm.afterGet = true;
    miqService.sparkleOff();
  }

  function onError(response) {
    var url = '/flavor/show_list';
    var message = __('Unable to add Flavor ') + vm.flavorModel.name + ' .' + response.results[0].message;
    miqService.redirectBack(message, 'error', url);
    miqService.sparkleOff();
  }

  function nonError() {
    var url = '/flavor/show_list';
    var message = sprintf(__('Add of Flavor \"%s\" was successfully initialized.'), vm.flavorModel.name);
    miqService.redirectBack(message, 'success', url);
  }

  var getBack = function(response) {
    var err = false;
    if (response.hasOwnProperty('results')) {
      err = ! response.results[0].success;
    }

    if (err) {
      onError(response);
    } else {
      nonError();
    }
  };

  function getEmsFormDataComplete(response) {
    vm.ems_list = response.data.ems_list;
    if (foundEms()) {
      setEms();
    }
  }

  function foundEms() {
    return vm.ems_list.length > 0;
  }

  function setEms() {
    vm.flavorModel.ems = vm.ems_list[0];
  }
  vm.$onInit = init;
};
