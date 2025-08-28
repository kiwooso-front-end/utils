interface MessageCallback {
  onError?: (message: string) => void;
  onInfo?: (message: string) => void;
}

/**
 * 파일 검증기 - 체인 방식으로 파일 유효성 검사 수행
 *
 * @example
 * ```typescript
 * // 기본 사용법 (메시지 없이)
 * const validFile = new FileValidator(file)
 *   .validateSize(0.5 * 1024 * 1024)  // 0.5MB 제한
 *   .validateNameLength(50)           // 50자 제한
 *   .getResult();
 *
 * // 메시지 처리와 함께 사용
 * const messageHandler = {
 *   onError: (msg) => toast.error(msg),
 *   onInfo: (msg) => toast.info(msg)
 * };
 *
 * const validFile = new FileValidator(file, messageHandler)
 *   .validateSize(0.2 * 1024 * 1024)
 *   .validateNameLength(30)
 *   .validateExtension(['jpg', 'png', 'gif'])
 *   .validateType(['image/jpeg', 'image/png'])
 *   .getResult();
 *
 * // 배열 처리 예시
 * const validFiles = Array.from(files)
 *   .map(file => new FileValidator(file, messageHandler)
 *     .validateSize(0.2 * 1024 * 1024)
 *     .validateNameLength()
 *     .getResult())
 *   .filter((file): file is File => file !== null);
 * ```
 */
export class FileValidator {
  private file: File | null;
  private callback: MessageCallback;

  /**
   * 파일 검증기 생성
   * @param file 검증할 파일
   * @param callback 메시지 처리 콜백 (선택사항)
   * @param callback.onError 에러 메시지 처리 함수
   * @param callback.onInfo 정보 메시지 처리 함수
   */
  constructor(file: File, callback: MessageCallback = {}) {
    this.file = file;
    this.callback = callback;
  }

  /**
   * 파일 용량 검증
   *
   * @param maxSize 최대 용량 (바이트 단위, 기본값: 0.5MB)
   * @returns FileValidator 인스턴스 (체이닝 지원)
   *
   * @example
   * ```typescript
   * validator.validateSize(1 * 1024 * 1024); // 1MB 제한
   * validator.validateSize(); // 기본값 0.5MB 사용
   * ```
   */
  validateSize(maxSize: number = 0.5 * 1024 * 1024): FileValidator {
    if (!this.file) return this;

    if (this.file.size > maxSize) {
      const message = `${this.file.name} 파일 크기가 너무 큽니다. ${
        maxSize / (1024 * 1024)
      }MB 이하로 업로드해주세요.`;
      this.callback.onError?.(message);
      this.file = null;
    }
    return this;
  }

  /**
   * 파일 이름 길이 검증 (초과시 자동 변경)
   *
   * @param maxLength 최대 파일 이름 길이 (기본값: 50자)
   * @returns FileValidator 인스턴스 (체이닝 지원)
   *
   * @example
   * ```typescript
   * validator.validateNameLength(30); // 30자 제한
   * validator.validateNameLength();   // 기본값 50자 사용
   * ```
   *
   * @note 파일명이 길면 'image-{랜덤숫자}.{확장자}' 형식으로 자동 변경
   */
  validateNameLength(maxLength: number = 50): FileValidator {
    if (!this.file) return this;

    if (this.file.name.length > maxLength) {
      const randomNum = Math.floor(Math.random() * 1000000);
      const extension = this.file.name.slice(this.file.name.lastIndexOf('.'));
      const newFileName = `image-${randomNum}${extension}`;

      const message = `파일명이 ${maxLength}자를 초과하여 ${newFileName}으로 변경하였습니다.`;
      this.callback.onInfo?.(message);
      this.file = new File([this.file], newFileName, { type: this.file.type });
    }
    return this;
  }

  /**
   * 파일 확장자 검증 (대소문자 구분 없음)
   *
   * @param allowedExtensions 허용할 확장자 배열
   * @returns FileValidator 인스턴스 (체이닝 지원)
   *
   * @example
   * ```typescript
   * validator.validateExtension(['jpg', 'png', 'gif']);
   * validator.validateExtension(['pdf', 'doc', 'docx']);
   * ```
   */
  validateExtension(allowedExtensions: string[]): FileValidator {
    if (!this.file) return this;

    const extension = this.file.name
      .slice(this.file.name.lastIndexOf('.') + 1)
      .toLowerCase();

    if (
      !allowedExtensions.map((ext) => ext.toLowerCase()).includes(extension)
    ) {
      const message = `${
        this.file.name
      } 파일 형식이 지원되지 않습니다. 허용 형식: ${allowedExtensions.join(
        ', '
      )}`;
      this.callback.onError?.(message);
      this.file = null;
    }
    return this;
  }

  /**
   * 파일 MIME 타입 검증
   *
   * @param allowedTypes 허용할 MIME 타입 배열
   * @returns FileValidator 인스턴스 (체이닝 지원)
   *
   * @example
   * ```typescript
   * validator.validateType(['image/jpeg', 'image/png']);
   * validator.validateType(['application/pdf', 'text/plain']);
   * ```
   */
  validateType(allowedTypes: string[]): FileValidator {
    if (!this.file) return this;

    if (!allowedTypes.includes(this.file.type)) {
      const message = `${
        this.file.name
      } 파일 타입이 지원되지 않습니다. 허용 타입: ${allowedTypes.join(', ')}`;
      this.callback.onError?.(message);
      this.file = null;
    }
    return this;
  }

  /**
   * 검증 결과 반환
   *
   * @returns 검증을 통과한 파일 또는 null (검증 실패시)
   *
   * @example
   * ```typescript
   * const result = validator.validateSize().getResult();
   * if (result) {
   *   // 검증 통과 - 파일 사용
   *   uploadFile(result);
   * } else {
   *   // 검증 실패 - 에러 처리
   *   console.log('파일 검증 실패');
   * }
   * ```
   */
  getResult(): File | null {
    return this.file;
  }
}

/**
 * 일반적인 이미지 파일 검증 유틸리티 함수
 *
 * @param file 검증할 파일
 * @param callback 메시지 처리 콜백
 * @returns 검증된 파일 또는 null
 *
 * @example
 * ```typescript
 * const validFile = validateImageFile(file, {
 *   onError: (msg) => toast.error(msg),
 *   onInfo: (msg) => toast.info(msg)
 * });
 * ```
 */
export const validateImageFile = (
  file: File,
  callback: MessageCallback = {}
): File | null => {
  return new FileValidator(file, callback)
    .validateSize(0.5 * 1024 * 1024) // 0.5MB
    .validateNameLength(50)
    .validateExtension(['jpg', 'jpeg', 'png', 'gif', 'webp'])
    .validateType(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
    .getResult();
};

/**
 * 문서 파일 검증 유틸리티 함수
 *
 * @param file 검증할 파일
 * @param callback 메시지 처리 콜백
 * @returns 검증된 파일 또는 null
 */
export const validateDocumentFile = (
  file: File,
  callback: MessageCallback = {}
): File | null => {
  return new FileValidator(file, callback)
    .validateSize(5 * 1024 * 1024) // 5MB
    .validateNameLength(100)
    .validateExtension(['pdf', 'doc', 'docx', 'txt'])
    .validateType([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ])
    .getResult();
};
