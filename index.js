import EventEmitter from 'eventemitter3';

/* README
Based off of  https://github.com/sindresorhus/p-debounce and https://github.com/sindresorhus/p-queue as reference
*/


class Debounce extends EventEmitter {
  constructor(fn, wait, maxWait = Infinity, context = null) {
    super();
    if (!Number.isFinite(wait)) {
      throw new TypeError('Expected `wait` to be a finite number');
    }
    this.context = context;
    this.fn = fn;
    this.wait = wait;
    this.latestArguments = null;
    this.maxWait = maxWait;
    this.timer = null;
    this.maxTimer = null;
    this.resolveList = [];
  }

  runNow(...arguments_) {
    this.latestArguments = arguments_;
    return new Promise(resolve => {
      this.resolveList.push(resolve);
      this.resolveNow(arguments_);
    })
  }

  run(...arguments_) {
    if(!this.maxTimer && isFinite(this.maxWait))
      this.maxTimer = setTimeout(() => this.resolveNow(arguments_), this.maxWait);
    this.latestArguments = arguments_;
    return new Promise(resolve => {
      this.resolveList.push(resolve);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.resolveNow(arguments_), this.wait);
    });
  }


  resolveNow() {

    clearTimeout(this.timer);
    clearTimeout(this.maxTimer);
    this.timer = null;
    this.maxTimer = null;

    const result = this.fn.apply(this.context, this.latestArguments);

    for (const resolve of this.resolveList) {
      resolve(result);
    }

    this.resolveList = [];

    this.emit('resolved', result);
  }

  get lastResult() {
    return this.lastResult;
  }
}

export default Debounce;