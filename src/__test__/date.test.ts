import { getGradeExpirationRemainingTime } from '../date';

describe('getGradeExpirationRemainingTime', () => {
  // mock now time 설정
  const mockNow = new Date('2025-06-01T10:00:00');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('일 단위 표시 (24시간 이상, 반올림 적용)', () => {
    it('정확히 30일 남았을 때', () => {
      const endDate = new Date('2025-07-01T10:00:00');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30일 남았습니다.'
      );
    });

    it('29일 12시간 이상 남았을 때 30일로 반올림', () => {
      const endDate = new Date('2025-07-01T00:00:00'); // 29일 14시간
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30일 남았습니다.'
      );
    });

    it('29일 23시간 59분 남았을 때 30일로 반올림', () => {
      const endDate = new Date('2025-07-01T09:59:00'); // 29일 23시간 59분
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30일 남았습니다.'
      );
    });

    it('1일 12시간 남았을 때 2일로 반올림', () => {
      const endDate = new Date('2025-06-02T22:00:00'); // 1일 12시간
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 2일 남았습니다.'
      );
    });

    it('1일 11시간 59분일 때는 1일로 내림', () => {
      const endDate = new Date('2025-06-02T21:59:00'); // 1일 11시간 59분
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1일 남았습니다.'
      );
    });

    it('정확히 1일 남았을 때', () => {
      const endDate = new Date('2025-06-02T10:00:00'); // 정확히 24시간
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1일 남았습니다.'
      );
    });
  });

  describe('시간 단위 표시 (24시간 미만)', () => {
    it('23시간 59분 남았을 때는 시간 단위로 표시', () => {
      const endDate = new Date('2025-06-02T09:59:00');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 23시간 59분 남았습니다.'
      );
    });

    it('시간과 분이 모두 있을 때', () => {
      const endDate = new Date('2025-06-01T12:30:00');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 2시간 30분 남았습니다.'
      );
    });

    it('정확히 1시간 남았을 때', () => {
      const endDate = new Date('2025-06-01T11:00:00');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1시간 남았습니다.'
      );
    });
  });

  describe('분 단위 표시', () => {
    it('1시간 미만일 때는 분만 표시', () => {
      const endDate = new Date('2025-06-01T10:30:00');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30분 남았습니다.'
      );
    });

    it('정확히 1분 남았을 때', () => {
      const endDate = new Date('2025-06-01T10:01:00');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1분 남았습니다.'
      );
    });

    it('59분 남았을 때', () => {
      const endDate = new Date('2025-06-01T10:59:00');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 59분 남았습니다.'
      );
    });

    it('1분 미만 남았을 때 0분으로 표시', () => {
      const endDate = new Date('2025-06-01T10:00:30');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 0분 남았습니다.'
      );
    });
  });

  describe('경계 케이스', () => {
    it('이미 지난 날짜는 만료 메시지 반환', () => {
      const endDate = new Date('2025-05-31T10:00:00');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급이 만료되었습니다.'
      );
    });

    it('현재 시간과 동일한 경우 만료 메시지 반환', () => {
      const endDate = new Date('2025-06-01T10:00:00');
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급이 만료되었습니다.'
      );
    });
  });

  describe('입력 형식', () => {
    it('문자열 날짜 입력도 처리', () => {
      const endDate = '2025-07-01T10:00:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30일 남았습니다.'
      );
    });

    it('ISO 형식의 날짜 문자열 처리', () => {
      const endDate = '2025-06-02T10:00:00.000Z';
      const result = getGradeExpirationRemainingTime(endDate);
      expect(result).not.toBe('');
      expect(result).toContain('남았습니다.');
    });

    it('잘못된 날짜 문자열은 만료 메시지 반환', () => {
      const endDate = 'invalid-date';
      expect(getGradeExpirationRemainingTime(endDate)).toBe('');
    });
  });
});
