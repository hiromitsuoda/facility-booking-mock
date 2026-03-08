import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zoszzugouhwgvreqhsvc.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_hq43J3pPtH3P2M7TWgxp4g_oJ8sKDlU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
