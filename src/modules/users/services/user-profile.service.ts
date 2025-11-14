import { userProfileRepository, UserProfileBase, UserProfileFine, UserProfileRide } from "../repositories/user-profile.repository";

export interface UserProfileData {
  userId: number;
  fullName: string;
  email: string;
  balance: number;
  fines: UserProfileFine[];
  lastRides: UserProfileRide[];
}

export class UserProfileService {
  constructor(private readonly repo = userProfileRepository) {}

  async getProfile(userId: number): Promise<UserProfileData> {
    const base = await this.repo.findUserProfileBase(userId);

    if (!base) {
      const error = new Error("USER_NOT_FOUND");
      (error as any).code = "USER_NOT_FOUND";
      throw error;
    }

    const [fines, lastRides] = await Promise.all([
      this.repo.findUserFines(userId),
      this.repo.findUserLastRides(userId),
    ]);

    const profile: UserProfileData = {
      userId: base.userId,
      fullName: base.fullName,
      email: base.email,
      balance: base.balance,
      fines,
      lastRides,
    };

    return profile;
  }
}

export const userProfileService = new UserProfileService();
