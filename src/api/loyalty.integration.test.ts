import { loyaltyApi } from './loyalty';

describe('loyaltyApi integration', () => {
  it('runs loyalty integration tests', async () => {
    // 1. Create user points (if not exists)
    const points = await loyaltyApi.createUserPoints('test-user');
    console.log('CreateUserPoints:', points);

    // 2. Add points
    const added = await loyaltyApi.addPoints('test-user', 100, 'Test add');
    console.log('AddPoints:', added);

    // 3. Get user points with history
    const withHistory = await loyaltyApi.getUserPointsWithHistory('test-user');
    console.log('GetUserPointsWithHistory:', withHistory);

    // 4. Get available rewards
    const rewards = await loyaltyApi.getAvailableRewards();
    console.log('GetAvailableRewards:', rewards);

    // 5. Redeem a reward (if available)
    if (rewards.length > 0) {
      const redeem = await loyaltyApi.redeemReward('test-user', rewards[0].id);
      console.log('RedeemReward:', redeem);
    }

    // 6. Get redemption history
    const history = await loyaltyApi.getUserRedemptionHistory('test-user');
    console.log('GetUserRedemptionHistory:', history);
    
    // This is an integration test that might fail if Supabase is not connected
    // But we at least want it to be a valid Jest test
  });
});
