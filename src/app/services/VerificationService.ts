import Service from "./Service";
import VerificationRepo from "../db/repos/VerificationRepo";
import {IValidation} from "../db/models/Verification";

class VerificationService extends Service<IValidation> {
  constructor() {
    super(VerificationRepo);
  }
}

export default new VerificationService();
