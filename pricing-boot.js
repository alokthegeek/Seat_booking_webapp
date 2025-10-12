import { pricingRules } from './pricingRules.js';
import { computePrice, zoneFor } from './pricingEngine.js';

// Expose a stable global for legacy code to call without becoming a module
window.pricing = Object.freeze({
  rules: pricingRules,
  computePrice,
  zoneFor
});
