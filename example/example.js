class Foo {
  constructor (name = '') {
    this.name = name;

    setTimeout(() => {
      this.name = 'Quentin Tarantino';
    }, 1000);
  }
  fooMethod () {
    console.log(`Yo, I'm ${this.name}`);
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
  }
}

new FooBar({
  Foo: ['Jules Winnfield'],
  Bar: [
    {
      name: 'Grand Central Bowl',
      people: ['Mia Wallace', 'Vincent Vega'],
    },
  ],
});