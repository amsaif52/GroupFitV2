import { EntityNotFoundException } from '../exceptions';

/**
 * Method decorator: if the method returns null or undefined, throws EntityNotFoundException
 * with optional custom message. Alias for ThrowNotFound with message override via metadata.
 *
 * Use when you want a custom message:
 * @AssertNotNull('User', 'No user with this email')
 */
export function AssertNotNull(entityName: string, customMessage?: string) {
  return function (
    _target: object,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const result = await original.apply(this, args);
      if (result === null || result === undefined) {
        throw new EntityNotFoundException(entityName, args[0], customMessage);
      }
      return result;
    };
    return descriptor;
  };
}
