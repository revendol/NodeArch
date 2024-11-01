import Repo from "./Repo";
import Security, {ISecurity} from "../models/Security";

class SecurityRepo extends Repo<ISecurity> {
  constructor() {
    super(Security);
  }
}

export default new SecurityRepo();