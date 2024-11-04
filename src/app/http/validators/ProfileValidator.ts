import Validators from '@http/validators/Validators';

class ProfileValidator extends Validators {
    // Define rules for each validation type
    private static addRules = {};
    private static editRules = {};

    constructor() {
        super(ProfileValidator.addRules, ProfileValidator.editRules);
    }
    // Write custom validator methods here if needed
}

export default new ProfileValidator();
