import {before} from 'utils-decorators';

class Test {
  @before<Test>({func: 'goo'})
  foo() {
    console.log('will run after');
  }

  goo() {
    console.log('will run before foo');
  }
}

const t = new Test();
