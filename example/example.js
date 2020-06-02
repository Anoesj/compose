import { compose } from '../compose.js';

class Foo {
  constructor (name = '') {
    this.name = name;
    this.testAccessingParentProperty();

    setTimeout(() => {
      this.name = 'Quentin Tarantino';
    }, 1000);
  }
  fooMethod () {
    console.log(`Yo, I'm ${this.name}`);
  }
  testAccessingParentProperty () {
    console.log(this.test);
  }
}

class Bar {
  constructor (bar = {}) {
    Object.assign(this, bar);
  }
  barMethod () {
    console.log(`${this.people.join(' and ')} went to ${this.name}`);
  }
}

class FooBar extends compose(Foo, Bar) {
  constructor () {
    super(...arguments);
    this.test = 'test';
    this.fooMethod();
    this.barMethod();
    // this.testAccessingParentProperty();

    setTimeout(() => {
      this.fooMethod();
    }, 2000);
  }
}

const foobar = new FooBar({
  Foo: ['Jules Winnfield'],
  Bar: [
    {
      name: 'Grand Central Bowl',
      people: ['Mia Wallace', 'Vincent Vega'],
    },
  ],
});

console.log(foobar);

console.log(`instanceof FooBar? ––>`, foobar instanceof FooBar);
console.log(`instanceof Foo? ––>`, foobar instanceof Foo);
console.log(`instanceof Bar? ––>`, foobar instanceof Bar);

// customElements.define('test-element', class TestElement extends compose(HTMLElement, Bar) {
//   constructor () {
//     super(...arguments);
//     this.test = 'test';
//     this.fooMethod();
//     this.barMethod();
//     // this.testAccessingParentProperty();

//     setTimeout(() => {
//       this.fooMethod();
//     }, 2000);
//   }
// });