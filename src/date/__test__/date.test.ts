import { getGradeExpirationRemainingTime, formatDate } from '..';

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
      const endDate = '2025-07-01T10:00:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30일 남았습니다.'
      );
    });

    it('29일 12시간 이상 남았을 때 30일로 반올림', () => {
      const endDate = '2025-07-01T00:00:00'; // 29일 14시간
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30일 남았습니다.'
      );
    });

    it('29일 23시간 59분 남았을 때 30일로 반올림', () => {
      const endDate = '2025-07-01T09:59:00'; // 29일 23시간 59분
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30일 남았습니다.'
      );
    });

    it('1일 12시간 남았을 때 2일로 반올림', () => {
      const endDate = '2025-06-02T22:00:00'; // 1일 12시간
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 2일 남았습니다.'
      );
    });

    it('1일 11시간 59분일 때는 1일로 내림', () => {
      const endDate = '2025-06-02T21:59:00'; // 1일 11시간 59분
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1일 남았습니다.'
      );
    });

    it('정확히 1일 남았을 때', () => {
      const endDate = '2025-06-02T10:00:00'; // 정확히 24시간
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1일 남았습니다.'
      );
    });
  });

  describe('시간 단위 표시 (24시간 미만)', () => {
    it('23시간 59분 남았을 때는 시간 단위로 표시', () => {
      const endDate = '2025-06-02T09:59:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 23시간 59분 남았습니다.'
      );
    });

    it('시간과 분이 모두 있을 때', () => {
      const endDate = '2025-06-01T12:30:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 2시간 30분 남았습니다.'
      );
    });

    it('정확히 1시간 남았을 때', () => {
      const endDate = '2025-06-01T11:00:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1시간 남았습니다.'
      );
    });
  });

  describe('분 단위 표시', () => {
    it('1시간 미만일 때는 분만 표시', () => {
      const endDate = '2025-06-01T10:30:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30분 남았습니다.'
      );
    });

    it('정확히 1분 남았을 때', () => {
      const endDate = '2025-06-01T10:01:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1분 남았습니다.'
      );
    });

    it('59분 남았을 때', () => {
      const endDate = '2025-06-01T10:59:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 59분 남았습니다.'
      );
    });

    it('1분 미만 남았을 때', () => {
      const endDate = '2025-06-01T10:00:30';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1분 미만 남았습니다.'
      );
    });

    it('59초 남았을 때도 1분 미만으로 표시', () => {
      const endDate = '2025-06-01T10:00:59';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 1분 미만 남았습니다.'
      );
    });
  });

  describe('경계 케이스', () => {
    it('이미 지난 날짜는 만료 메시지 반환', () => {
      const endDate = '2025-05-31T10:00:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급이 만료되었습니다.'
      );
    });

    it('현재 시간과 동일한 경우 만료 메시지 반환', () => {
      const endDate = '2025-06-01T10:00:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급이 만료되었습니다.'
      );
    });
  });

  describe('입력 형식', () => {
    it('문자열 날짜 입력 처리', () => {
      const endDate = '2025-07-01T10:00:00';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30일 남았습니다.'
      );
    });

    it('ISO 형식의 날짜 문자열 처리', () => {
      const endDate = '2025-06-02T10:00:00.000';
      const result = getGradeExpirationRemainingTime(endDate);
      expect(result).not.toBe('');
      expect(result).toContain('남았습니다.');
    });

    it('서버 응답 형식 처리 (나노초 포함)', () => {
      const endDate = '2025-07-01T10:00:00.999999999';
      expect(getGradeExpirationRemainingTime(endDate)).toBe(
        '등급 만료까지 30일 남았습니다.'
      );
    });

    it('잘못된 날짜 문자열은 빈 문자열 반환', () => {
      const endDate = 'invalid-date';
      expect(getGradeExpirationRemainingTime(endDate)).toBe('');
    });

    it('빈 문자열은 빈 문자열 반환', () => {
      const endDate = '';
      expect(getGradeExpirationRemainingTime(endDate)).toBe('');
    });
  });
});

describe('formatDate', () => {
  const testDate = '2025-01-15T14:30:45';
  const testDateWithoutTime = '2025-01-15';

  describe('한국어 포맷', () => {
    it('YYYY년 MM월 DD일 포맷으로 변환', () => {
      expect(formatDate(testDate, 'YYYY년 MM월 DD일')).toBe('2025년 01월 15일');
    });

    it('YY년 MM월 DD일 포맷으로 변환 (2자리 연도)', () => {
      expect(formatDate(testDate, 'YY년 MM월 DD일')).toBe('25년 01월 15일');
    });

    it('YYYY년 MM월 DD일 HH시 MM분 포맷으로 변환', () => {
      expect(formatDate(testDate, 'YYYY년 MM월 DD일 HH시 MM분')).toBe(
        '2025년 01월 15일 14시 30분'
      );
    });

    it('YYYY년 MM월 DD일 HH시 MM분 SS초 포맷으로 변환', () => {
      expect(formatDate(testDate, 'YYYY년 MM월 DD일 HH시 MM분 SS초')).toBe(
        '2025년 01월 15일 14시 30분 45초'
      );
    });

    it('YYYY년 MM월 DD일 HH:MM 포맷으로 변환', () => {
      expect(formatDate(testDate, 'YYYY년 MM월 DD일 HH:MM')).toBe(
        '2025년 01월 15일 14:30'
      );
    });
  });

  describe('하이픈(-) 구분자 포맷', () => {
    it('YYYY-MM-DD 포맷으로 변환', () => {
      expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2025-01-15');
    });

    it('YYYY-MM-DD HH:MM 포맷으로 변환', () => {
      expect(formatDate(testDate, 'YYYY-MM-DD HH:MM')).toBe('2025-01-15 14:30');
    });

    it('YYYY-MM-DD HH:MM:SS 포맷으로 변환', () => {
      expect(formatDate(testDate, 'YYYY-MM-DD HH:MM:SS')).toBe(
        '2025-01-15 14:30:45'
      );
    });
  });

  describe('점(.) 구분자 포맷', () => {
    it('YYYY.MM.DD 포맷으로 변환', () => {
      expect(formatDate(testDate, 'YYYY.MM.DD')).toBe('2025.01.15');
    });

    it('YY.MM.DD 포맷으로 변환 (2자리 연도)', () => {
      expect(formatDate(testDate, 'YY.MM.DD')).toBe('25.01.15');
    });
  });

  describe('슬래시(/) 구분자 포맷', () => {
    it('MM/DD/YYYY 포맷으로 변환 (미국식)', () => {
      expect(formatDate(testDate, 'MM/DD/YYYY')).toBe('01/15/2025');
    });

    it('DD/MM/YYYY 포맷으로 변환 (유럽식)', () => {
      expect(formatDate(testDate, 'DD/MM/YYYY')).toBe('15/01/2025');
    });
  });

  describe('에러 케이스', () => {
    it('빈 문자열 입력 시 빈 문자열 반환', () => {
      expect(formatDate('', 'YYYY-MM-DD')).toBe('');
    });

    it('유효하지 않은 날짜 문자열 입력 시 빈 문자열 반환', () => {
      expect(formatDate('invalid-date', 'YYYY-MM-DD')).toBe('');
    });

    it('연도 범위 초과 시 빈 문자열 반환', () => {
      expect(formatDate('12345-01-01', 'YYYY-MM-DD')).toBe(''); // 연도 범위 초과
      expect(formatDate('1800-01-01', 'YYYY-MM-DD')).toBe(''); // 너무 과거
      expect(formatDate('2200-01-01', 'YYYY-MM-DD')).toBe(''); // 너무 미래
    });
  });

  describe('패딩 확인', () => {
    it('한 자리 월/일/시/분/초가 0으로 패딩되는지 확인', () => {
      const singleDigitDate = '2025-01-05T09:08:07';
      expect(formatDate(singleDigitDate, 'YYYY-MM-DD HH:MM:SS')).toBe(
        '2025-01-05 09:08:07'
      );
      expect(formatDate(singleDigitDate, 'YY년 MM월 DD일')).toBe(
        '25년 01월 05일'
      );
    });
  });

  describe('서버 응답 형식 처리', () => {
    it('나노초 포함된 날짜 문자열 처리', () => {
      const serverDate = '2025-11-30T23:59:59.999999999';
      expect(formatDate(serverDate, 'YYYY-MM-DD')).toBe('2025-11-30');
      expect(formatDate(serverDate, 'YYYY-MM-DD HH:MM:SS')).toBe(
        '2025-11-30 23:59:59'
      );
    });

    it('밀리초 포함된 날짜 문자열 처리', () => {
      const dateWithMs = '2025-01-15T14:30:45.123';
      expect(formatDate(dateWithMs, 'YYYY-MM-DD HH:MM:SS')).toBe(
        '2025-01-15 14:30:45'
      );
    });
  });
});
