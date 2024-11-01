import Validators from './Validators';

class AuthValidator extends Validators {
  private static addRules = {
    name: 'required',
    email: 'required|email|unique:User,email',
    password: 'required|min:8'
  };

  private static editRules = {
    name: 'string',
    password: 'required|min:8'
  };

  constructor() {
    super(AuthValidator.addRules, AuthValidator.editRules);
  }
}

export default new AuthValidator();
