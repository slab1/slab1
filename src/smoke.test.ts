describe('System Smoke Test', () => {
    it('should pass if the test system is working', () => {
        expect(true).toBe(true);
    });

    it('should be able to import utilities', async () => {
        const { isValidString } = await import('@/utils/type-guards');
        expect(isValidString('hello')).toBe(true);
        expect(isValidString(123)).toBe(false);
    });
});
