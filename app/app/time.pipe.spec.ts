import { TimePipe } from './time.pipe';

describe('TimeFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new TimePipe();
    expect(pipe).toBeTruthy();
  });
});
