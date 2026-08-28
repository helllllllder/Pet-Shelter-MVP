export function formatPetAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  if (years <= 0) {
    if (months <= 1) return "less than a month";
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  const yearLabel = `${years} year${years === 1 ? "" : "s"}`;
  if (months === 0) return yearLabel;
  const monthLabel = `${months} month${months === 1 ? "" : "s"}`;
  return `${yearLabel} ${monthLabel}`;
}
