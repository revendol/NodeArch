import Repo from "@repos/Repo";
import Profile, { IProfile } from "@models/Profile";

class ProfileRepo extends Repo<IProfile> {
  constructor() {
    super(Profile);
  }
}

export default new ProfileRepo();
