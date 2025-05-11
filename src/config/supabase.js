const { createClient } = require('@supabase/supabase-js');
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = require('../utils/constants');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = supabase;
