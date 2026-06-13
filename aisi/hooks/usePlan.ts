import { useOnboarding } from './useOnboarding';

export function usePlan() {
  const { data, save } = useOnboarding();
  const isPaid = data.plan === 'paid';

  const setPlan = (plan: 'free' | 'paid') => save({ ...data, plan });

  return { isPaid, plan: data.plan, setPlan };
}
