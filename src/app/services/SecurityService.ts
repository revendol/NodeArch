import Service from "./Service";
import SecurityRepo from "../db/repos/SecurityRepo";
import {ISecurity} from "../db/models/Security";

class SecurityService extends Service<ISecurity> {
  constructor() {
    super(SecurityRepo);
  }
}

export default new SecurityService();