import Repo from "./Repo";
import Verification, {IValidation} from "../models/Verification";

class VerificationRepo extends Repo<IValidation> {
  constructor() {
    super(Verification);
  }
}

export default new VerificationRepo();