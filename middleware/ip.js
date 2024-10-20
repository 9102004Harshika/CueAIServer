import geoip from 'geoip-lite';

export const captureLocation = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Check if IP is local (e.g., localhost)
  if (ip === '::1' || ip === '127.0.0.1') {
    req.location = {
      country: 'India',
      region: 'Maharashtra',
      city: 'Mumbai',
    };
    next();
    return;
  }

  geoip.lookup(ip, (err, geo) => {
    if (err || !geo) {
      req.location = {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
      };
    } else {
      req.location = {
        country: geo.country || 'Unknown',
        region: geo.region || 'Unknown',
        city: geo.city || 'Unknown',
      };
    }
    next();
  });
};
