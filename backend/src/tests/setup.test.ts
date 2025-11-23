describe('Jest Setup', () => {
  it('should be configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should support TypeScript', () => {
    const message: string = 'Jest is working with TypeScript!';
    expect(message).toContain('TypeScript');
  });
});
