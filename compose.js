const composedClassHandler = {
  get (target, property, receiver) {
    console.log({
      target,
      property,
      receiver,
    });

    if (Reflect.has(target, property)) {
      return Reflect.get(...arguments);
    }
    else {
      return target.get(property);
    }
  },

  getPrototypeOf (target) {
    console.log(target);
    return Reflect.getPrototypeOf(target);
  }
}

function compose (...parentClasses) {
  // Create class where class instances of parent classes are stored
  // The class instance will be wrapped in a Proxy, that gets properties
  // from the parent class instances if the property doesn't exist on the class itself.
  const composedClass = class Composed {

    #classInstances = [];

    constructor (args = {}) {
      this.#classInstances.push(
        ...(parentClasses.map((parentClass) => {
          return Reflect.construct(parentClass, args[parentClass.prototype.constructor.name] ?? []);
        }))
      );

      return new Proxy(this, composedClassHandler);
    }

    get (propertyName) {
      for (const classInstance of this.#classInstances) {
        if (Reflect.has(classInstance, propertyName)) {
          return Reflect.get(classInstance, propertyName);
        }
      }
    }

  };

  return composedClass;
}

export { compose };