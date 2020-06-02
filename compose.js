const composedClassHandler = {
  get (target, property, receiver) {
    // console.log(`%cGetting property “${property}” from ${Reflect.getPrototypeOf(target).constructor.name}.`, 'color: lightgrey;');

    if (Reflect.has(target, property)) {
      // console.log(`%cProperty “${property}” exists on ${Reflect.getPrototypeOf(target).constructor.name}.`, 'color: lightgrey;');
      return Reflect.get(...arguments);
    }
    else {
      return target.get(property);
    }
  },

  getPrototypeOf (target) {
    // Goal: mimic the prototype chain of all involved classes extending each other
    // by returning multiple layers of Proxy's with getPrototypeOf traps.
    const frankensteinPrototype = target.getPrototypes();

    // console.log(target, frankensteinPrototype, Reflect.getPrototypeOf(target));

    // return frankensteinPrototype;

    const frankensteinProxy = new Proxy(Reflect.getPrototypeOf(target), {
      getPrototypeOf (target) {
        return frankensteinPrototype;
      },
    });
    // console.log(frankensteinProxy);
    return frankensteinProxy;
    // return Reflect.getPrototypeOf(target);
  },
}

class MagicProxy {
  constructor () {
    return new Proxy(this, {
      get (target, property, receiver) {
        if (receiver !== null) {
          console.log('PROXY TO MAIN:', target.proxyToMain);
          console.log('GET', { target, property, receiver });
          return Reflect.get(target.proxyToMain, property, receiver);
        }
        return Reflect.get(...arguments);
      },
      set (target, property, value, receiver) {
        console.log('SET', { target, property, value, receiver });
        return Reflect.set(...arguments);
      },
    });
  }
}

function proxyFactory (classDefinition) {
  console.log(classDefinition.prototype);
  class Proxified extends MagicProxy {}
  // class Proxified {}

  Object.defineProperties(Proxified.prototype, Object.getOwnPropertyDescriptors(classDefinition.prototype));

  // for (const [propertyName, properyDescriptor] of Object.entries(Object.getOwnPropertyDescriptors(classDefinition.prototype))) {
  //   console.log(propertyName, properyDescriptor);
  //   Reflect.defineProperty(Proxi);
  // }
  console.log(Proxified.prototype);

  return Proxified;
}

function compose (...parentClasses) {
  // Create class where class instances of parent classes are stored
  // The class instance will be wrapped in a Proxy, that gets properties
  // from the parent class instances if the property doesn't exist on the class itself.
  const composedClass = class Composed {

    classInstances = [];

    constructor (args = {}) {
      const proxy = new Proxy(this, composedClassHandler);

      this.classInstances.push(
        ...(parentClasses.map((parentClass) => {
          console.log(`Going to construct %s`, parentClass.prototype.constructor.name);
          const proxifiedParentClass = proxyFactory(parentClass);
          proxifiedParentClass.prototype.proxyToMain = proxy; // TODO: Temp
          const instance = Reflect.construct(proxifiedParentClass, args[parentClass.prototype.constructor.name] ?? []);
          console.log(`Constructed %s`, parentClass.prototype.constructor.name, instance);
          return instance;
        }))
      );

      return proxy;
    }

    get (propertyName) {
      for (const classInstance of this.classInstances) {
        if (Reflect.has(classInstance, propertyName)) {
          // console.log(`%cProperty “${propertyName}” exists on ${Reflect.getPrototypeOf(classInstance).constructor.name}.`, 'color: lightgrey;');
          return Reflect.get(classInstance, propertyName, null);
        }
      }
    }

    getPrototypes () {
      return new Proxy(parentClasses[0], {
        getPrototypeOf (target) {
          // console.warn('GETTING PROTOTYPE OF', target.prototype.constructor.name);
          return parentClasses[1];
        },
      });
      // return new Proxy(parentClasses[0], {
      //   getPrototypeOf (target) {
      //     console.warn('GETTING PROTOTYPE OF', target);
      //     return parentClasses[1];
      //   },
      // });
      // return parentClasses.reduce((total, curr) => {
      //   return new Proxy(curr, {
      //     getPrototypeOf (target) {
      //       console.log('GETTING PROTOTYPE');
      //     }
      //   });
      // });
    }

  };

  return composedClass;
}

export { compose };