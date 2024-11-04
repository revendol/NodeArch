import Service from "@services/Service";
import ProfileRepo from "@repos/ProfileRepo";
import { IProfile } from "@models/Profile";

class ProfileService extends Service<IProfile> {
  constructor() {
    super(ProfileRepo);
  }
  // Write custom functions here
}

export default new ProfileService();
