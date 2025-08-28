import { FileValidator } from '..';

// 테스트 헬퍼 함수
const createMockFile = (
  name: string,
  size: number,
  type: string = 'image/jpeg'
): File => {
  const content = new Array(size).fill(0);
  return new File([new Uint8Array(content)], name, { type });
};

// 메시지 캡처 함수
const createMessageCapture = () => {
  const messages: Array<{ message: string; type: 'error' | 'info' }> = [];

  return {
    onError: jest.fn((message: string) =>
      messages.push({ message, type: 'error' })
    ),
    onInfo: jest.fn((message: string) =>
      messages.push({ message, type: 'info' })
    ),
    getMessages: () => messages,
    getErrors: () => messages.filter((m) => m.type === 'error'),
    getInfos: () => messages.filter((m) => m.type === 'info'),
  };
};

describe('FileValidator', () => {
  describe('validateSize', () => {
    test('정상 크기 파일은 통과해야 함', () => {
      const file = createMockFile('test.jpg', 100 * 1024); // 100KB
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateSize(0.5 * 1024 * 1024) // 0.5MB 제한
        .getResult();

      expect(result).not.toBeNull();
      expect(result?.name).toBe('test.jpg');
      expect(messageCapture.onError).not.toHaveBeenCalled();
    });

    test('용량 초과 파일은 null 반환하고 에러 메시지 호출', () => {
      const file = createMockFile('large.jpg', 1 * 1024 * 1024); // 1MB
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateSize(0.5 * 1024 * 1024) // 0.5MB 제한
        .getResult();

      expect(result).toBeNull();
      expect(messageCapture.onError).toHaveBeenCalledWith(
        expect.stringContaining('파일 크기가 너무 큽니다')
      );
      expect(messageCapture.onError).toHaveBeenCalledWith(
        expect.stringContaining('0.5MB 이하로 업로드해주세요')
      );
    });

    test('콜백 없이 사용시 에러 없이 동작', () => {
      const file = createMockFile('test.jpg', 1 * 1024 * 1024);

      expect(() => {
        const result = new FileValidator(file)
          .validateSize(0.5 * 1024 * 1024)
          .getResult();
        expect(result).toBeNull();
      }).not.toThrow();
    });
  });

  describe('validateNameLength', () => {
    test('정상 길이 파일명은 그대로 유지', () => {
      const file = createMockFile('short.jpg', 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateNameLength(50)
        .getResult();

      expect(result).not.toBeNull();
      expect(result?.name).toBe('short.jpg');
      expect(messageCapture.onInfo).not.toHaveBeenCalled();
    });

    test('긴 파일명은 자동 변경되고 정보 메시지 호출', () => {
      const longName = 'a'.repeat(60) + '.jpg';
      const file = createMockFile(longName, 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateNameLength(50)
        .getResult();

      expect(result).not.toBeNull();
      expect(result?.name).not.toBe(longName);
      expect(result?.name).toMatch(/^image-\d+\.jpg$/);
      expect(messageCapture.onInfo).toHaveBeenCalledWith(
        expect.stringContaining('파일명이 50자를 초과하여')
      );
      expect(messageCapture.onInfo).toHaveBeenCalledWith(
        expect.stringContaining('으로 변경하였습니다')
      );
    });

    test('파일 확장자가 올바르게 유지됨', () => {
      const longName = 'a'.repeat(60) + '.png';
      const file = createMockFile(longName, 1024, 'image/png');

      const result = new FileValidator(file).validateNameLength(30).getResult();

      expect(result?.name).toMatch(/\.png$/);
      expect(result?.type).toBe('image/png');
    });
  });

  describe('validateExtension', () => {
    test('허용된 확장자는 통과', () => {
      const file = createMockFile('test.png', 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateExtension(['jpg', 'png', 'gif'])
        .getResult();

      expect(result).not.toBeNull();
      expect(messageCapture.onError).not.toHaveBeenCalled();
    });

    test('허용되지 않은 확장자는 거부', () => {
      const file = createMockFile('test.bmp', 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateExtension(['jpg', 'png', 'gif'])
        .getResult();

      expect(result).toBeNull();
      expect(messageCapture.onError).toHaveBeenCalledWith(
        expect.stringContaining('파일 형식이 지원되지 않습니다')
      );
    });

    test('대소문자 구분 없이 확장자 검증', () => {
      const file = createMockFile('test.JPG', 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateExtension(['jpg', 'png'])
        .getResult();

      expect(result).not.toBeNull();
      expect(messageCapture.onError).not.toHaveBeenCalled();
    });

    test('확장자 없는 파일은 거부', () => {
      const file = createMockFile('noextension', 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateExtension(['jpg', 'png'])
        .getResult();

      expect(result).toBeNull();
      expect(messageCapture.onError).toHaveBeenCalled();
    });
  });

  describe('validateType', () => {
    test('허용된 MIME 타입은 통과', () => {
      const file = createMockFile('test.jpg', 1024, 'image/jpeg');
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateType(['image/jpeg', 'image/png'])
        .getResult();

      expect(result).not.toBeNull();
      expect(messageCapture.onError).not.toHaveBeenCalled();
    });

    test('허용되지 않은 MIME 타입은 거부', () => {
      const file = createMockFile('test.gif', 1024, 'image/gif');
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateType(['image/jpeg', 'image/png'])
        .getResult();

      expect(result).toBeNull();
      expect(messageCapture.onError).toHaveBeenCalledWith(
        expect.stringContaining('파일 타입이 지원되지 않습니다')
      );
    });
  });

  describe('체인 검증', () => {
    test('모든 검증 통과시 원본 파일 반환', () => {
      const file = createMockFile('test.jpg', 100 * 1024, 'image/jpeg');
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateSize(0.5 * 1024 * 1024)
        .validateNameLength(50)
        .validateExtension(['jpg', 'png'])
        .validateType(['image/jpeg', 'image/png'])
        .getResult();

      expect(result).not.toBeNull();
      expect(result?.name).toBe('test.jpg');
      expect(messageCapture.onError).not.toHaveBeenCalled();
      expect(messageCapture.onInfo).not.toHaveBeenCalled();
    });

    test('첫 번째 검증 실패시 이후 검증 건너뛰기', () => {
      const file = createMockFile('test.jpg', 1 * 1024 * 1024); // 용량 초과
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateSize(0.5 * 1024 * 1024) // 실패
        .validateNameLength(50) // 건너뛰기
        .validateExtension(['jpg']) // 건너뛰기
        .getResult();

      expect(result).toBeNull();
      expect(messageCapture.onError).toHaveBeenCalledTimes(1);
      expect(messageCapture.onError).toHaveBeenCalledWith(
        expect.stringContaining('파일 크기가 너무 큽니다')
      );
    });

    test('파일명 변경 후 다른 검증 계속 진행', () => {
      const longName = 'a'.repeat(60) + '.jpg';
      const file = createMockFile(longName, 10 * 1024, 'image/jpeg');
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateNameLength(30)
        .validateExtension(['jpg', 'png'])
        .validateType(['image/jpeg'])
        .getResult();

      expect(result).not.toBeNull();
      expect(result?.name).not.toBe(longName);
      expect(result?.name).toMatch(/^image-\d+\.jpg$/);
      expect(messageCapture.onInfo).toHaveBeenCalledTimes(1);
      expect(messageCapture.onError).not.toHaveBeenCalled();
    });
  });

  describe('실제 사용 시나리오', () => {
    test('이미지 업로드 핸들러 시뮬레이션', () => {
      const files = [
        createMockFile('photo1.jpg', 150 * 1024, 'image/jpeg'), // 정상
        createMockFile('photo2.png', 1 * 1024 * 1024, 'image/png'), // 용량 초과
        createMockFile(
          'verylongphotoname' + 'a'.repeat(50) + '.jpg',
          50 * 1024
        ), // 이름 길이 초과
      ];

      const messageCapture = createMessageCapture();

      const validatedFiles = files
        .map((file) =>
          new FileValidator(file, messageCapture)
            .validateSize(0.2 * 1024 * 1024)
            .validateNameLength(30)
            .validateExtension(['jpg', 'jpeg', 'png'])
            .validateType(['image/jpeg', 'image/png'])
            .getResult()
        )
        .filter((file): file is File => file !== null);

      expect(validatedFiles).toHaveLength(2); // 첫 번째와 세 번째만 통과
      expect(validatedFiles[0].name).toBe('photo1.jpg'); // 첫 번째는 그대로
      expect(validatedFiles[1].name).toMatch(/^image-\d+\.jpg$/); // 세 번째는 이름 변경

      // 메시지 호출 검증
      expect(messageCapture.onError).toHaveBeenCalledTimes(1); // 용량 초과 1건
      expect(messageCapture.onInfo).toHaveBeenCalledTimes(1); // 파일명 변경 1건
    });
  });

  describe('엣지 케이스', () => {
    test('확장자 없는 파일', () => {
      const file = createMockFile('filename', 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateExtension(['jpg', 'png'])
        .getResult();

      expect(result).toBeNull();
      expect(messageCapture.onError).toHaveBeenCalled();
    });

    test('빈 확장자 배열', () => {
      const file = createMockFile('test.jpg', 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateExtension([])
        .getResult();

      expect(result).toBeNull();
      expect(messageCapture.onError).toHaveBeenCalled();
    });

    test('점만 있는 파일명', () => {
      const file = createMockFile('.', 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateExtension(['jpg'])
        .getResult();

      expect(result).toBeNull();
    });

    test('여러 점이 있는 파일명', () => {
      const file = createMockFile('file.name.with.dots.jpg', 1024);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateExtension(['jpg'])
        .getResult();

      expect(result).not.toBeNull();
      expect(result?.name).toBe('file.name.with.dots.jpg');
    });

    test('매우 작은 파일 크기 제한', () => {
      const file = createMockFile('test.jpg', 1024); // 1KB
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateSize(500) // 500bytes 제한
        .getResult();

      expect(result).toBeNull();
      expect(messageCapture.onError).toHaveBeenCalled();
    });

    test('0 크기 파일', () => {
      const file = createMockFile('empty.jpg', 0);
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateSize(1024)
        .getResult();

      expect(result).not.toBeNull(); // 0 크기는 제한보다 작으므로 통과
    });
  });

  describe('메서드 체이닝', () => {
    test('체인 중간에 실패해도 다음 메서드 호출 가능', () => {
      const file = createMockFile('test.jpg', 1 * 1024 * 1024);
      const messageCapture = createMessageCapture();

      const validator = new FileValidator(file, messageCapture).validateSize(
        0.5 * 1024 * 1024
      ); // 실패

      // 다음 메서드들도 호출 가능해야 함 (단, 실행은 건너뛰기)
      expect(() => {
        validator
          .validateNameLength(30)
          .validateExtension(['jpg'])
          .validateType(['image/jpeg']);
      }).not.toThrow();

      expect(validator.getResult()).toBeNull();
    });

    test('여러 검증을 순차적으로 통과', () => {
      const file = createMockFile('test.jpg', 50 * 1024, 'image/jpeg');
      const messageCapture = createMessageCapture();

      const result = new FileValidator(file, messageCapture)
        .validateSize(0.2 * 1024 * 1024)
        .validateNameLength(30)
        .validateExtension(['jpg', 'jpeg', 'png'])
        .validateType(['image/jpeg', 'image/png'])
        .getResult();

      expect(result).not.toBeNull();
      expect(result?.name).toBe('test.jpg');
      expect(messageCapture.onError).not.toHaveBeenCalled();
      expect(messageCapture.onInfo).not.toHaveBeenCalled();
    });
  });

  describe('콜백 동작', () => {
    test('onError 콜백이 올바른 메시지와 함께 호출됨', () => {
      const file = createMockFile('big.jpg', 1 * 1024 * 1024);
      const onError = jest.fn();

      new FileValidator(file, { onError })
        .validateSize(0.5 * 1024 * 1024)
        .getResult();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(expect.stringContaining('big.jpg'));
    });

    test('onInfo 콜백이 올바른 메시지와 함께 호출됨', () => {
      const longName = 'a'.repeat(60) + '.jpg';
      const file = createMockFile(longName, 1024);
      const onInfo = jest.fn();

      const result = new FileValidator(file, { onInfo })
        .validateNameLength(30)
        .getResult();

      expect(onInfo).toHaveBeenCalledTimes(1);
      expect(onInfo).toHaveBeenCalledWith(
        expect.stringContaining('파일명이 30자를 초과하여')
      );
      expect(result?.name).toMatch(/^image-\d+\.jpg$/);
    });

    test('콜백이 undefined여도 에러 없음', () => {
      const file = createMockFile('test.jpg', 1 * 1024 * 1024);

      expect(() => {
        new FileValidator(file, { onError: undefined, onInfo: undefined })
          .validateSize(0.5 * 1024 * 1024)
          .getResult();
      }).not.toThrow();
    });
  });
});

// 통합 테스트
describe('FileValidator Integration Tests', () => {
  test('실제 handleImageUpload 시나리오', () => {
    // Mock files 배열 생성
    const mockFiles = [
      createMockFile('normal.jpg', 150 * 1024, 'image/jpeg'), // 정상
      createMockFile('toolarge.jpg', 1 * 1024 * 1024, 'image/jpeg'), // 용량 초과
      createMockFile(
        'verylongfilenamethatexceedslimit.png',
        10 * 1024,
        'image/png'
      ), // 이름 길이 초과
      createMockFile('good.png', 30 * 1024, 'image/png'), // 정상
    ];

    // 메시지 수집용
    const errorMessages: string[] = [];
    const infoMessages: string[] = [];

    const messageHandler = {
      onError: (message: string) => errorMessages.push(message),
      onInfo: (message: string) => infoMessages.push(message),
    };

    // 실제 로직과 동일하게 처리
    const newFiles = mockFiles
      .map((file) =>
        new FileValidator(file, messageHandler)
          .validateSize(0.2 * 1024 * 1024)
          .validateNameLength(30)
          .validateExtension(['jpg', 'jpeg', 'png', 'gif'])
          .validateType(['image/jpeg', 'image/png'])
          .getResult()
      )
      .filter((file): file is File => file !== null);

    // 검증
    expect(newFiles).toHaveLength(3); // normal.jpg, 변경된이름.png, good.png
    expect(errorMessages).toHaveLength(1); // toolarge.jpg 용량 초과
    expect(infoMessages).toHaveLength(1); // 긴 파일명 변경

    // 첫 번째 파일은 그대로
    expect(newFiles[0].name).toBe('normal.jpg');

    // 세 번째 파일(긴 이름)은 변경됨
    expect(newFiles[1].name).toMatch(/^image-\d+\.png$/);

    // 네 번째 파일은 그대로
    expect(newFiles[2].name).toBe('good.png');
  });

  test('모든 파일이 실패하는 경우', () => {
    const mockFiles = [
      createMockFile('big1.jpg', 1 * 1024 * 1024, 'image/jpeg'),
      createMockFile('big2.png', 1 * 1024 * 1024, 'image/png'),
    ];

    const messageHandler = {
      onError: jest.fn(),
      onInfo: jest.fn(),
    };

    const newFiles = mockFiles
      .map((file) =>
        new FileValidator(file, messageHandler)
          .validateSize(0.1 * 1024 * 1024) // 매우 작은 제한
          .getResult()
      )
      .filter((file): file is File => file !== null);

    expect(newFiles).toHaveLength(0);
    expect(messageHandler.onError).toHaveBeenCalledTimes(2);
  });
});
