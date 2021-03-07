import test from 'ava';
import delay from 'yoctodelay'; // TODO: Replace with `import {setTimeout as delay} = from 'timers/promises';` when targeting Node.js 16
import inRange from 'in-range';
import timeSpan from 'time-span';
import Debounce from './index.js';

test('multiple calls', async t => {
    let count = 0;
    const end = timeSpan();

    const debounced = new Debounce(async value => {
        count++;
        await delay(50);
        return value;
    }, 100);

    const results = await Promise.all([1, 2, 3, 4, 5].map(value => debounced.run(value)));

    t.deepEqual(results, [5, 5, 5, 5, 5]);
    t.is(count, 1);
    t.true(inRange(end(), {
        start: 130,
        end: 170
    }));

    await delay(200);
    t.is(await debounced.run(6), 6);
});

test('runNow', async t => {
    let count = 0;
    const end = timeSpan();

    const debounced = new Debounce(async value => {
        count++;
        return value;
    }, 1000);

    await delay(100);

    const results = Promise.all([1, 2, 3, 4, 5].map(value => debounced.run(value)));

    const plusOne = await debounced.runNow(6);

    t.deepEqual([...(await results), plusOne], [6, 6, 6, 6, 6, 6]);
    t.is(count, 1);
    t.true(inRange(end(), {
        start: 100,
        end: 200
    }));

    await delay(200);
    t.is(await debounced.run(6), 6);
});

test('maxTime', async t => {
    let count = 0;
    const end = timeSpan();

    const debounced = new Debounce(value => {
        count++;
        return value;
    }, 400, 700);


    const results = await Promise.all([0, 1, 2, 3, 4, 5].map(async value => {
        const doStuff = async () => {
            await delay(value * 200);
            console.log(end());
            return await debounced.run(value);
        }
        return await doStuff();
    }));

    t.deepEqual(results, [3, 3, 3, 3, 5, 5]);
    t.is(count, 2);

    await delay(200);
    t.is(await debounced.run(6), 6);
});

test('event emitter', async t => {

    const debounced = new Debounce(value => {
        return value;
    }, 100);

    debounced.on('resolved', async (value) => {
        t.is( value, 5);
    });

    const results = await Promise.all([1, 2, 3, 4, 5].map(value => debounced.run(value)));
});


class Abc {
    constructor() {
        this.a = 1;
        this.debounced = new Debounce(async value => {
            await delay(50);
            return this.a + value;
        }, 100);
    }

    go() {
        return Promise.all([1, 2, 3, 4, 5].map(value => this.debounced.run(value)));
    }
}

test('a thing', async t => {
    const end = timeSpan();

    const cls = new Abc();
    const results = await cls.go()

    t.deepEqual(results, [6, 6, 6, 6, 6]);
    t.true(inRange(end(), {
        start: 130,
        end: 230
    }));
});