'use client'

/**
 * useOnboarding — Hook para controlar progresso do onboarding wizard
 *
 * Lê e persiste o step atual via /api/user/onboarding.
 * Integra com FirstRunWizard: exibe overlay se step < 5.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'

interface OnboardingState {
  step: number
  completed_at: string | null
  total_steps: number
}

const TOTAL_STEPS = 5

const onboardingKeys = {
  all: ['onboarding'] as const,
  status: () => [...onboardingKeys.all, 'status'] as const,
}

async function fetchOnboarding(): Promise<OnboardingState> {
  const res = await fetch('/api/user/onboarding')
  if (!res.ok) return { step: TOTAL_STEPS, completed_at: null, total_steps: TOTAL_STEPS }
  const json = await res.json()
  return {
    step: json.data?.step ?? 0,
    completed_at: json.data?.completed_at ?? null,
    total_steps: TOTAL_STEPS,
  }
}

async function updateOnboardingStep(step: number): Promise<void> {
  await fetch('/api/user/onboarding', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step }),
  })
}

export function useOnboarding() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: onboardingKeys.status(),
    queryFn: fetchOnboarding,
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  })

  const advanceStep = useMutation({
    mutationFn: updateOnboardingStep,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: onboardingKeys.all }),
  })

  const currentStep = data?.step ?? TOTAL_STEPS
  const isCompleted = currentStep >= TOTAL_STEPS
  const shouldShowWizard = !isLoading && !!user?.id && !isCompleted

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    isCompleted,
    isLoading,
    shouldShowWizard,
    advanceStep: (step: number) => advanceStep.mutateAsync(step),
    completeOnboarding: () => advanceStep.mutateAsync(TOTAL_STEPS),
    skipOnboarding: () => advanceStep.mutateAsync(TOTAL_STEPS),
    isPending: advanceStep.isPending,
  }
}
