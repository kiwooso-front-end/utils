/**
 * Date 관련 유틸리티 함수들
 */

/**
 * 목표 날짜까지 남은 시간을 계산하여 적절한 형식으로 반환하는 함수
 *
 * @description
 * - 24시간 이상: 일 단위로 표시 (반올림 적용)
 * - 24시간 미만: 시간/분 단위로 정확히 표시
 * - 반올림 방식: 0.5일(12시간) 기준으로 반올림
 *   예) 1일 12시간 → 2일, 1일 11시간 → 1일
 *
 * @param endDate 목표 날짜와 시간 (string 또는 Date 객체)
 * @returns 남은 기간 문자열 또는 만료 메시지
 *
 * @example
 * 기준 '2025-06-01T10:00:00'
 * getGradeExpirationRemainingTime('2025-07-01T10:00:00')
 * // "등급 만료까지 30일 남았습니다."
 *
 * getGradeExpirationRemainingTime('2025-06-02T15:30:00')
 * // "등급 만료까지 5시간 30분 남았습니다."
 */
export function getGradeExpirationRemainingTime(
  endDate: string | Date
): string {
  const now = new Date();
  const end = new Date(endDate);

  // 유효하지 않은 날짜 체크
  if (isNaN(end.getTime())) {
    return '';
  }

  // 밀리초 단위의 차이 계산
  const differenceInTime = end.getTime() - now.getTime();

  // 이미 지난 시간인 경우
  if (differenceInTime <= 0) {
    return '등급이 만료되었습니다.';
  }

  // 전체 시간을 시간 단위로 변환
  const totalHours = differenceInTime / (1000 * 60 * 60);

  // 24시간 이상인 경우: 일 단위로 표시 (반올림 적용)
  if (totalHours >= 24) {
    const differenceInDays = Math.round(totalHours / 24);
    return `등급 만료까지 ${differenceInDays}일 남았습니다.`;
  }

  // 24시간 미만인 경우: 시간/분 단위로 표시
  const hours = Math.floor(totalHours);
  const remainingMinutes = (differenceInTime % (1000 * 60 * 60)) / (1000 * 60);
  const minutes = Math.floor(remainingMinutes);

  // 1시간 이상인 경우
  if (hours > 0) {
    if (minutes > 0) {
      return `등급 만료까지 ${hours}시간 ${minutes}분 남았습니다.`;
    }
    return `등급 만료까지 ${hours}시간 남았습니다.`;
  }

  // 1시간 미만인 경우: 분 단위로만 표시
  return `등급 만료까지 ${minutes}분 남았습니다.`;
}

/**
 * 날짜 포맷 타입 정의
 */
type DateFormat =
  | 'YYYY년 MM월 DD일'
  | 'YY년 MM월 DD일'
  | 'YYYY년 MM월 DD일 HH시 MM분'
  | 'YYYY년 MM월 DD일 HH시 MM분 SS초'
  | 'YYYY년 MM월 DD일 HH:MM'
  | 'YYYY-MM-DD'
  | 'YYYY-MM-DD HH:MM'
  | 'YYYY-MM-DD HH:MM:SS'
  | 'YYYY.MM.DD'
  | 'YY.MM.DD'
  | 'MM/DD/YYYY'
  | 'DD/MM/YYYY';

/**
 * 날짜 문자열을 지정된 포맷으로 변환하는 함수
 *
 * @description
 * 다양한 날짜 포맷을 지원하는 유틸리티 함수입니다.
 * 빈 문자열이나 유효하지 않은 날짜가 입력되면 빈 문자열을 반환합니다.
 * 연도는 1900~2100 범위만 허용합니다.
 *
 * @param dateString 변환할 날짜 문자열 (ISO 8601 형식 권장)
 * @param format 출력할 날짜 포맷
 * @returns 포맷된 날짜 문자열, 유효하지 않은 경우 빈 문자열
 *
 * @example
 * formatDate('2024-01-15T14:30:00', 'YYYY년 MM월 DD일')
 * // "2024년 01월 15일"
 *
 * formatDate('2024-01-15', 'YY.MM.DD')
 * // "24.01.15"
 *
 * formatDate('2024-01-15T14:30:00', 'YYYY-MM-DD HH:MM')
 * // "2024-01-15 14:30"
 *
 * formatDate('', 'YYYY-MM-DD')
 * // ""
 *
 * formatDate('12345', 'YYYY-MM-DD')
 * // "" (연도 범위 초과)
 */
export function formatDate(dateString: string, format: DateFormat): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // 유효하지 않은 날짜인 경우 빈 문자열 반환
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();

  // 비현실적인 연도 범위 체크 (예: 1900~2100)
  if (year < 1900 || year > 2100) return '';

  const yearShort = String(year).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'YYYY년 MM월 DD일':
      return `${year}년 ${month}월 ${day}일`;
    case 'YY년 MM월 DD일':
      return `${yearShort}년 ${month}월 ${day}일`;
    case 'YYYY년 MM월 DD일 HH시 MM분':
      return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
    case 'YYYY년 MM월 DD일 HH시 MM분 SS초':
      return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분 ${seconds}초`;
    case 'YYYY년 MM월 DD일 HH:MM':
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'YYYY-MM-DD HH:MM':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    case 'YYYY-MM-DD HH:MM:SS':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case 'YYYY.MM.DD':
      return `${year}.${month}.${day}`;
    case 'YY.MM.DD':
      return `${yearShort}.${month}.${day}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    default:
      return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분`;
  }
}
