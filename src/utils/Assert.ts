export class Assert {
  /**
   * 断言条件为 true，否则抛出错误
   */
  static isTrue(condition: any, message?: string): asserts condition {
    if (!condition) {
      throw new Error(message || `Expected condition to be true, but was false.`)
    }
  }

  /**
   * 断言条件为 false，否则抛出错误
   */
  static isFalse(condition: any, message?: string): asserts condition is false {
    if (condition) {
      throw new Error(message || `Expected condition to be false, but was true.`)
    }
  }

  /**
   * 断言值不为 null 或 undefined
   */
  static notNullOrUndefined<T>(value: T, message?: string): asserts value {
    if (value === null || value === undefined) {
      throw new Error(message || `Expected value to be not null or undefined.`)
    }
  }

  /**
   * 断言值为 null 或 undefined
   */
  static isNullOrUndefined<T>(value: T, message?: string): void {
    if (value !== null && value !== undefined) {
      throw new Error(message || `Expected value to be null or undefined.`)
    }
  }

  /**
   * 断言值是某个类型
   */
  static isType<T>(
    value: any,
    typeGuard: (value: any) => value is T,
    message?: string
  ): asserts value is T {
    if (!typeGuard(value)) {
      throw new Error(message || `Expected value to be of specified type.`)
    }
  }

  /**
   * 断言两个值相等（===）
   */
  static equals<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, but got ${actual}.`)
    }
  }

  /**
   * 断言字符串是空白（空或只包含空格、换行、制表符等）
   */
  static isBlank(value: string, message?: string): void {
    Assert.isType(value, (v): v is string => typeof v === 'string', 'Value must be a string')

    if (value.trim() !== '') {
      throw new Error(message || `Expected string to be blank, but was "${value}".`)
    }
  }

  /**
   * 断言字符串不是空白
   */
  static notBlank(value: string, message?: string): void {
    Assert.isType(value, (v): v is string => typeof v === 'string', 'Value must be a string')

    if (value.trim() === '') {
      throw new Error(message || `Expected string to not be blank.`)
    }
  }

  /**
   * 断言数组不是空数组
   */
  static notEmpty<T>(array: T[] | null | undefined, message?: string): asserts array is T[] {
    if (!array || array.length === 0) {
      throw new Error(message || 'Expected array to be non-empty')
    }
  }

  /**
   * 断言值是一个空字符串
   */
  static isEmpty(value: string, message?: string): void

  /**
   * 断言值是一个空数组
   */
  static isEmpty<T>(value: T[], message?: string): void

  /**
   * 实现方法
   */
  static isEmpty<T>(value: string | T[], message?: string): void {
    if (typeof value === 'string') {
      if (value !== '') {
        throw new Error(message || `Expected string to be empty, but was "${value}".`)
      }
    } else {
      if (!Array.isArray(value) || value.length !== 0) {
        throw new Error(message || `Expected array to be empty.`)
      }
    }
  }

  /**
   * 直接抛出错误
   */
  static fail(message: string): never {
    throw new Error(message)
  }
}