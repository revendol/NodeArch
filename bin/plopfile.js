module.exports = function (plop) {
  plop.setGenerator('crud', {
    description: 'Generate CRUD files for a model',
    prompts: [
      {
        type: 'input',
        name: 'modelName',
        message: 'Model name?',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '../src/app/http/controllers/{{pascalCase modelName}}Controller.ts',
        templateFile: 'templates/controller.hbs',
      },
      {
        type: 'add',
        path: '../src/app/http/validators/{{pascalCase modelName}}Validator.ts',
        templateFile: 'templates/validator.hbs',
      },
      {
        type: 'add',
        path: '../src/app/db/repos/{{pascalCase modelName}}Repo.ts',
        templateFile: 'templates/repo.hbs',
      },
      {
        type: 'add',
        path: '../src/app/services/{{pascalCase modelName}}Service.ts',
        templateFile: 'templates/service.hbs',
      },
      {
        type: 'add',
        path: '../src/app/http/routes/{{pascalCase modelName}}Router.ts',
        templateFile: 'templates/route.hbs',
      },
    ],
  });
};
