/**
 * 한우 정액 코드의 유효성을 검사합니다.
 * @param semenName - 검사할 정액 코드 (예: KPN123, GPN1234)
 * @returns 유효한 한우 정액 코드인 경우 true, 아니면 false
 * @example
 * isValidKCowSemen('KPN950')  // true
 * isValidKCowSemen('GPN0100') // true
 * isValidKCowSemen('KPN12')   // false (2자리)
 * isValidKCowSemen('ABC123')  // false
 */
export function isValidKCowSemen(semenName: string): boolean {
  if (!semenName || typeof semenName !== 'string') {
    return false;
  }

  // 공백 제거 및 대문자 변환
  const normalized = semenName.trim().toUpperCase();

  // 한우 정액 코드 패턴: KPN, GPN, JBPN, JYG, YKG + 3~4자리 숫자
  const regex = /^(KPN|GPN|JBPN|JYG|YKG)\d{3,4}$/;

  return regex.test(normalized);
}
