export function getCurrentTimeMs(headers: Headers): number {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode) {
    const testNowHeader = headers.get('x-test-now-ms');
    if (testNowHeader) {
      const testTime = parseInt(testNowHeader, 10);
      if (!isNaN(testTime)) {
        return testTime;
      }
    }
  }
  
  return Date.now();
}