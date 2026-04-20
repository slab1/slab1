import { loyaltyProgramsApi } from './loyaltyPrograms';

describe('loyaltyProgramsApi integration', () => {
  it('runs loyalty programs integration tests', async () => {
    // 1. Add a new loyalty program
    const program = await loyaltyProgramsApi.addProgram({
      restaurant_id: 'test-restaurant',
      name: 'Test Program',
      description: 'Test description',
      is_active: true,
      points_per_visit: 50,
      points_per_spend: 10,
      reward_tiers: { Bronze: 0, Silver: 200, Gold: 500, Platinum: 1000 },
    });
    console.log('AddProgram:', program);

    // 2. Get programs for restaurant
    const all = await loyaltyProgramsApi.getPrograms('test-restaurant');
    console.log('GetPrograms:', all);

    // 3. Update program
    if (program?.id) {
      const updated = await loyaltyProgramsApi.updateProgram(program.id, { name: 'Updated Program' });
      console.log('UpdateProgram:', updated);
    }
  });
});
