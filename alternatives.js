function compose (...parentClasses) {
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

  // First class is more important, so we'll handle it last, so it's properties can overwrite properties
  // of previous classes.
  const propertyInfoMap = new Map;
  for (const parentClass of [...parentClasses].reverse()) {
    const { constructor, ...parentClassPrototypePropertyDescriptors } = Object.getOwnPropertyDescriptors(parentClass.prototype);

    // Check for duplicate properties
    for (const property of Object.keys(parentClassPrototypePropertyDescriptors)) {
      const propertyInfo = propertyInfoMap.get(property);
      if (propertyInfo) {
        propertyInfo.foundIn.unshift(parentClass);
        propertyInfo.derivedFrom = parentClass;
      }
      else {
        propertyInfoMap.set(property, {
          foundIn: [parentClass],
          derivedFrom: parentClass,
        });
      }
    }

    Object.defineProperties(composedClass.prototype, parentClassPrototypePropertyDescriptors);
  }

  const conjunct = new Intl.ListFormat('en-US', { style: 'long', type: 'conjunction' });
  for (const [property, propertyInfo] of propertyInfoMap) {
    if (propertyInfo.foundIn.length > 1) {
      console.log(`Property “%s” exists in %s and only one will be used.`, property, conjunct.format(propertyInfo.foundIn.map(c => `“${c.prototype.constructor.name}”`)));
    }
  }

  console.log(composedClass.prototype);
  return composedClass;
}

export { compose };