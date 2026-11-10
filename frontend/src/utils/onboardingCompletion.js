export async function completeOnboardingFlow({
  saveProgress,
  markOnboardingComplete,
  onComplete,
}) {
  const saved = await saveProgress();
  if (!saved) return false;

  await markOnboardingComplete();
  onComplete();
  return true;
}
