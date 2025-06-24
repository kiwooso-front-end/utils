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
