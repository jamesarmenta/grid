import Line from './Line';
const assert = require('chai').assert;


describe('Line constructor', ()=> {
  it('assigns values properly', ()=> {
    let start = [0, 0];
    let end = [1, 1];
    let color = '#ff00aa';


    let myLine = new Line(start, end, color);

    assert.deepEqual(myLine.start, start);
    assert.deepEqual(myLine.end, end);
    assert.deepEqual(myLine.color, color);
  });

  it('assigns valid id', ()=> {
    let start = [0, 0];
    let end = [1, 1];
    let color = '#ff00aa';

    let myLine = new Line(start, end, color);
    let assignedId = myLine.id;
    let idIsValid = /^#[0-9a-f]{6}$/i.test(assignedId);

    assert.isTrue(idIsValid);
  });

  it('converts hex color to lowercase', ()=> {
    let start = [0, 0];
    let end = [1, 1];
    let color = '#AaBbCc';

    let myLine = new Line(start, end, color);

    assert.isTrue(myLine.color == '#aabbcc');
  });
});
