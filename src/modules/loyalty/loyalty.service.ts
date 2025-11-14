import { LoyaltyRepository  } from "./loyalty.repository";


export class LoyaltyService {
  private readonly repo = new LoyaltyRepository();

  async addPoints(userId: number, points: number, description: string) {
    return this.repo.addPoints(userId, points, description);
  }

  async redeemPoints(userId: number, points: number) {
    return this.repo.redeemPoints(userId, points);
  }

  async getHistory(userId: number) {
    return this.repo.getHistory(userId);
  }

  async getBalance(userId: number) {
    return this.repo.getBalance(userId);
  }
}

export const loyaltyService = new LoyaltyService();
