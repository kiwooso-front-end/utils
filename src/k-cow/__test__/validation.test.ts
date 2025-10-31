import { isValidKCowSemen } from '..';

describe('isValidKCowSemen', () => {
  describe('유효한 케이스', () => {
    it('KPN으로 시작하는 3~4자리 정액 코드를 허용해야 함', () => {
      expect(isValidKCowSemen('KPN950')).toBe(true);
      expect(isValidKCowSemen('KPN1420')).toBe(true);
      expect(isValidKCowSemen('KPN123')).toBe(true);
      expect(isValidKCowSemen('KPN9999')).toBe(true);
    });

    it('GPN으로 시작하는 3~4자리 정액 코드를 허용해야 함', () => {
      expect(isValidKCowSemen('GPN0100')).toBe(true);
      expect(isValidKCowSemen('GPN567')).toBe(true);
      expect(isValidKCowSemen('GPN1234')).toBe(true);
    });

    it('JBPN으로 시작하는 3~4자리 정액 코드를 허용해야 함', () => {
      expect(isValidKCowSemen('JBPN123')).toBe(true);
      expect(isValidKCowSemen('JBPN4567')).toBe(true);
    });

    it('JYG로 시작하는 3~4자리 정액 코드를 허용해야 함', () => {
      expect(isValidKCowSemen('JYG999')).toBe(true);
      expect(isValidKCowSemen('JYG1234')).toBe(true);
    });

    it('YKG로 시작하는 3~4자리 정액 코드를 허용해야 함', () => {
      expect(isValidKCowSemen('YKG777')).toBe(true);
      expect(isValidKCowSemen('YKG1234')).toBe(true);
    });

    it('소문자 입력도 허용해야 함', () => {
      expect(isValidKCowSemen('kpn950')).toBe(true);
      expect(isValidKCowSemen('gpn0100')).toBe(true);
      expect(isValidKCowSemen('jbpn123')).toBe(true);
    });

    it('공백이 포함된 입력도 처리해야 함', () => {
      expect(isValidKCowSemen(' KPN950 ')).toBe(true);
      expect(isValidKCowSemen('  GPN0100  ')).toBe(true);
    });

    it('앞자리가 0으로 시작해도 허용해야 함', () => {
      expect(isValidKCowSemen('KPN0123')).toBe(true);
      expect(isValidKCowSemen('GPN0100')).toBe(true);
    });
  });

  describe('유효하지 않은 케이스', () => {
    it('잘못된 기관 코드를 거부해야 함', () => {
      expect(isValidKCowSemen('ABC123')).toBe(false);
      expect(isValidKCowSemen('XYZ999')).toBe(false);
      expect(isValidKCowSemen('KPX123')).toBe(false);
    });

    it('2자리 이하 숫자를 거부해야 함', () => {
      expect(isValidKCowSemen('KPN12')).toBe(false);
      expect(isValidKCowSemen('GPN1')).toBe(false);
      expect(isValidKCowSemen('KPN')).toBe(false);
    });

    it('5자리 이상 숫자를 거부해야 함', () => {
      expect(isValidKCowSemen('KPN12345')).toBe(false);
      expect(isValidKCowSemen('GPN123456')).toBe(false);
      expect(isValidKCowSemen('KPN999999')).toBe(false);
    });

    it('빈 문자열을 거부해야 함', () => {
      expect(isValidKCowSemen('')).toBe(false);
      expect(isValidKCowSemen('   ')).toBe(false);
    });

    it('null/undefined를 거부해야 함', () => {
      expect(isValidKCowSemen(null as any)).toBe(false);
      expect(isValidKCowSemen(undefined as any)).toBe(false);
    });

    it('숫자 중간에 문자가 있으면 거부해야 함', () => {
      expect(isValidKCowSemen('KPN12A')).toBe(false);
      expect(isValidKCowSemen('GPN1A34')).toBe(false);
    });

    it('한글 텍스트를 거부해야 함', () => {
      expect(isValidKCowSemen('알수없음')).toBe(false);
      expect(isValidKCowSemen('미입력')).toBe(false);
      expect(isValidKCowSemen('없음')).toBe(false);
      expect(isValidKCowSemen('해당없음')).toBe(false);
    });

    it('특수문자가 포함된 경우 거부해야 함', () => {
      expect(isValidKCowSemen('KPN-123')).toBe(false);
      expect(isValidKCowSemen('GPN_567')).toBe(false);
      expect(isValidKCowSemen('KPN@123')).toBe(false);
      expect(isValidKCowSemen('!@#$%')).toBe(false);
    });

    it('형식이 완전히 잘못된 경우 거부해야 함', () => {
      expect(isValidKCowSemen('123456')).toBe(false);
      expect(isValidKCowSemen('random text')).toBe(false);
    });
  });
});
