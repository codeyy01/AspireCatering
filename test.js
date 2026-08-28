const { createClient } = require('@supabase/supabase-js')
const supabase = createClient('https://glgwbqvphdxndhxhjidn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZ3dicXZwaGR4bmRoeGhqaWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NjQzMjksImV4cCI6MjEwMzM0MDMyOX0.PQ1_YSXObtHx5w264_MhsbWsVGEIlVp9wP8HugzhEOU')

async function test() {
  // Let's just fetch exactly what the page fetches to see if we can trigger the crash locally!
  // Wait, I can't read it because of RLS.
  // BUT I CAN use the service role key! Wait, I don't have the service role key.
}

test()
