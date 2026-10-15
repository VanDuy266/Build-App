const base = require('./app.json').expo;
module.exports = () => {
  if (process.env.EAS_BUILD === 'true') {
    const address = process.env.EXPO_PUBLIC_API_URL;
    let url;
    try { url = new URL(address); } catch { throw new Error('Set EXPO_PUBLIC_API_URL to your deployed HTTPS API in the EAS build environment.'); }
    if (url.protocol !== 'https:' || ['localhost','127.0.0.1','0.0.0.0','[::1]'].includes(url.hostname)) {
      throw new Error('Release builds require an externally reachable HTTPS API, not localhost.');
    }
  }
  return base;
};
