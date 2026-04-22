-- ============================================
-- Migration: 00025_ambient_weather
-- Objetivo: armazenar cidade/coordenadas padrão da organização
-- para o AmbientCluster do Omnibar (núcleo validado 2026-04-22).
-- ============================================

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS weather_city text DEFAULT 'SP',
  ADD COLUMN IF NOT EXISTS weather_lat numeric(9, 6) DEFAULT -23.547500,
  ADD COLUMN IF NOT EXISTS weather_lon numeric(9, 6) DEFAULT -46.636100;

COMMENT ON COLUMN public.organizations.weather_city IS
  'Label curto da cidade exibido no AmbientCluster (ex.: "SP", "RJ"). Design 2026-04-22.';
COMMENT ON COLUMN public.organizations.weather_lat IS
  'Latitude usada para consultar Open-Meteo (AmbientCluster).';
COMMENT ON COLUMN public.organizations.weather_lon IS
  'Longitude usada para consultar Open-Meteo (AmbientCluster).';

-- Backfill: organizações existentes recebem defaults já via ADD COLUMN DEFAULT.
