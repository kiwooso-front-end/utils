/**
 * 소 이표번호를 포맷팅합니다.
 * 포맷: 확장코드(2) + 코드구분(1) + 일련번호(8) + 체크번호(1)
 * @param earTagNo - 12자리 소 이표번호
 * @param part - 추출할 부분 (1: 확장코드+코드구분(3자리), 2: 일련번호 앞 4자리, 3: 일련번호 뒤 4자리, 4: 체크번호, 5: 일련번호+체크번호)
 * @returns 포맷팅된 이표번호 또는 특정 부분. 유효하지 않은 경우 원본 문자열 반환
 * @example
 * formatEarTagNumber('002123456789') // '002 1234 5678 9'
 * formatEarTagNumber('002123456789', 1) // '002'
 * formatEarTagNumber('002123456789', 5) // '1234 5678 9'
 * formatEarTagNumber('invalid') // 'invalid'
 */
export const formatEarTagNumber = (
  earTagNo: string,
  part?: 1 | 2 | 3 | 4 | 5
): string => {
  if (!earTagNo || earTagNo.length !== 12) {
    return earTagNo;
  }

  const prefix = earTagNo.substring(0, 3); // 확장코드(2) + 코드구분(1)
  const serialNo1 = earTagNo.substring(3, 7); // 일련번호 앞 4자리
  const serialNo2 = earTagNo.substring(7, 11); // 일련번호 뒤 4자리
  const checkDigit = earTagNo.substring(11, 12); // 위조방지 체크번호

  if (!part) {
    return `${prefix} ${serialNo1} ${serialNo2} ${checkDigit}`;
  }

  switch (part) {
    case 1:
      return prefix;
    case 2:
      return serialNo1;
    case 3:
      return serialNo2;
    case 4:
      return checkDigit;
    case 5:
      return `${serialNo1} ${serialNo2} ${checkDigit}`;
    default:
      return earTagNo;
  }
};

/**
 * 포맷팅된 이표번호에서 공백을 제거합니다.
 */
export const normalizeEarTagNumber = (formatted: string): string => {
  return formatted.replace(/\s/g, '');
};
