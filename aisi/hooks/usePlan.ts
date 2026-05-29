import { useOnboarding } from './useOnboarding';

export function usePlan() {
  const { data } = useOnboarding();
  const isPaid = data.plan === 'paid';
  return { isPaid, plan: data.plan };
}
