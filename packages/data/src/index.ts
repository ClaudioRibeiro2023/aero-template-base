/**
 * @template/data — Data Access Layer agnóstico a provider.
 *
 * Exporta interfaces genéricas (IRepository, IAuthGateway, IDbClient)
 * e repositórios tipados por entidade.
 *
 * Para implementações de provider específico (Supabase, Prisma, etc.),
 * importar de '@template/data/supabase'.
 */

// ── Interfaces ──
export * from './interfaces'

// ── Repositórios por entidade ──
export * from './repositories'
