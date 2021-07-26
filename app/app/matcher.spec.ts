import { Matcher } from './Matcher';

describe('Matcher', () => {
  it('should create an instance', () => {
    let products: any;
    expect(new Matcher(products)).toBeTruthy();
  });
});
