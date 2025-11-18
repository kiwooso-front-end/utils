// src/k-cow/__test__/format.test.ts
import { formatEarTagNumber, normalizeEarTagNumber } from '../format';

describe('formatEarTagNumber', () => {
  const validEarTagNo = '002123456789';

  describe('전체 포맷팅', () => {
    it('12자리 이표번호를 올바르게 포맷팅한다', () => {
      expect(formatEarTagNumber(validEarTagNo)).toBe('002 1234 5678 9');
    });

    it('다른 이표번호도 올바르게 포맷팅한다', () => {
      expect(formatEarTagNumber('001987654321')).toBe('001 9876 5432 1');
    });
  });

  describe('부분 추출', () => {
    it('part=1: 확장코드+코드구분(3자리)을 반환한다', () => {
      expect(formatEarTagNumber(validEarTagNo, 1)).toBe('002');
    });

    it('part=2: 일련번호 앞 4자리를 반환한다', () => {
      expect(formatEarTagNumber(validEarTagNo, 2)).toBe('1234');
    });

    it('part=3: 일련번호 뒤 4자리를 반환한다', () => {
      expect(formatEarTagNumber(validEarTagNo, 3)).toBe('5678');
    });

    it('part=4: 체크번호를 반환한다', () => {
      expect(formatEarTagNumber(validEarTagNo, 4)).toBe('9');
    });

    it('part=5: 일련번호+체크번호를 반환한다', () => {
      expect(formatEarTagNumber(validEarTagNo, 5)).toBe('1234 5678 9');
    });
  });

  describe('예외 처리', () => {
    it('12자리가 아닌 경우 원본을 반환한다', () => {
      expect(formatEarTagNumber('123')).toBe('123');
      expect(formatEarTagNumber('12345678901234')).toBe('12345678901234');
    });

    it('빈 문자열인 경우 빈 문자열을 반환한다', () => {
      expect(formatEarTagNumber('')).toBe('');
    });

    it('null이나 undefined를 처리한다', () => {
      expect(formatEarTagNumber(null as any)).toBe(null);
      expect(formatEarTagNumber(undefined as any)).toBe(undefined);
    });
  });
});

describe('normalizeEarTagNumber', () => {
  it('포맷팅된 이표번호의 공백을 제거한다', () => {
    expect(normalizeEarTagNumber('002 1234 5678 9')).toBe('002123456789');
  });

  it('여러 공백을 모두 제거한다', () => {
    expect(normalizeEarTagNumber('002  1234  5678  9')).toBe('002123456789');
  });

  it('공백이 없는 문자열은 그대로 반환한다', () => {
    expect(normalizeEarTagNumber('002123456789')).toBe('002123456789');
  });

  it('빈 문자열을 처리한다', () => {
    expect(normalizeEarTagNumber('')).toBe('');
  });
});
