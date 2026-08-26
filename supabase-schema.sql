-- Workers table
CREATE TABLE public.workers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  role text,
  default_rate numeric DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Works table
CREATE TABLE public.works (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  client_name text,
  client_phone text,
  venue text,
  event_date date NOT NULL,
  guest_count integer,
  total_amount numeric DEFAULT 0,
  referred_by text,
  status text CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Work Assignments table (join table)
CREATE TABLE public.work_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id uuid REFERENCES public.works(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES public.workers(id) ON DELETE CASCADE,
  agreed_amount numeric DEFAULT 0,
  paid_status text CHECK (paid_status IN ('unpaid', 'partial', 'paid')) DEFAULT 'unpaid',
  amount_paid numeric DEFAULT 0,
  paid_date date,
  created_at timestamp with time zone DEFAULT now()
);

-- Row Level Security (RLS) setup
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies so only authenticated users can read/write
CREATE POLICY "Enable read access for authenticated users" ON public.workers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.workers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.workers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.workers FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.works FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.works FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.works FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.works FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.work_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.work_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.work_assignments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.work_assignments FOR DELETE TO authenticated USING (true);
