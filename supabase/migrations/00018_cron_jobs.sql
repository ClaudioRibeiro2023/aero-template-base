-- Migration: Background jobs via pg_cron + tabela platform_metrics

-- Tabela de métricas semanais (computada por cron)
CREATE TABLE IF NOT EXISTS public.platform_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start date NOT NULL,
  active_users integer DEFAULT 0,
  tickets_created integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  avg_ticket_resolution_hours numeric(10,2),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(week_start)
);

ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_metrics_select" ON public.platform_metrics
  FOR SELECT TO authenticated USING (true);

-- Função: limpar sessões expiradas (auth.sessions com expired_at < now())
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Limpar tokens expirados de refresh_tokens
  DELETE FROM auth.refresh_tokens
  WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: purgar audit_logs antigos (> 180 dias)
CREATE OR REPLACE FUNCTION public.purge_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < now() - interval '180 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: computar métricas semanais
CREATE OR REPLACE FUNCTION public.compute_weekly_metrics()
RETURNS void AS $$
DECLARE
  v_week_start date := date_trunc('week', now())::date;
BEGIN
  INSERT INTO public.platform_metrics (week_start, active_users, tickets_created, tasks_completed)
  VALUES (
    v_week_start,
    (SELECT count(DISTINCT id) FROM public.profiles WHERE updated_at > now() - interval '7 days'),
    (SELECT count(*) FROM public.support_tickets WHERE created_at > now() - interval '7 days'),
    (SELECT count(*) FROM public.tasks WHERE status = 'done' AND updated_at > now() - interval '7 days')
  )
  ON CONFLICT (week_start) DO UPDATE SET
    active_users = EXCLUDED.active_users,
    tickets_created = EXCLUDED.tickets_created,
    tasks_completed = EXCLUDED.tasks_completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agendar cron jobs (requer extensão pg_cron)
-- Nota: pg_cron deve estar habilitado no Supabase Dashboard > Database > Extensions
DO $$
BEGIN
  -- Apenas executar se pg_cron estiver disponível
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Limpar sessões expiradas: diário às 02:00 UTC
    PERFORM cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT public.cleanup_expired_sessions()');

    -- Purgar audit logs antigos: 1º de cada mês às 03:00 UTC
    PERFORM cron.schedule('purge-audit-logs', '0 3 1 * *', 'SELECT public.purge_old_audit_logs()');

    -- Computar métricas semanais: sexta às 23:00 UTC
    PERFORM cron.schedule('weekly-metrics', '0 23 * * 5', 'SELECT public.compute_weekly_metrics()');
  END IF;
END $$;
