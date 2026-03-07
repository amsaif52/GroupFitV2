import { EntityNotFoundException } from '../exceptions';

/**
 * Method decorator: if the method returns null or undefined, throws EntityNotFoundException.
 * Use for service methods that fetch by id and should 404 when missing.
 *
 * @param entityName - e.g. 'User', 'Booking' – used in the error message
 *
 * @example
 * @ThrowNotFound('User')
 * async findById(id: string) {
 *   return this.repo.findOne({ where: { id } });
 * }
 */
export function ThrowNotFound(entityName: string = 'Resource') {
  return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const result = await original.apply(this, args);
      if (result === null || result === undefined) {
        const id = args[0];
        throw new EntityNotFoundException(entityName, id);
      }
      return result;
    };
    return descriptor;
  };
}
