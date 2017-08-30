import config from '../config';
import Line from './Line';
import { lineIsValid } from './validateLine';

const assert = require('chai').assert;

describe('lineIsValid function', () => {
    it('rejects invalid parameter types', () => {
        let start = '[0, 0]';
        let end = [0, 0];
        let color = '#faFA01';

        assert.isFalse(lineIsValid(new Line(start, end, color)), 'Start point is a string');
        assert.isFalse(lineIsValid(new Line({}, {}, '')), 'Data is comprised of empty objects');

    });

    it('accepts valid line', () => {
        // Column upper-bounds
        let start1 = [config.GRID_NUMBER_COL - 1, 1];
        let end1 = [config.GRID_NUMBER_COL - 1, 0];
        // Row upper-bounds
        let start2 = [1, config.GRID_NUMBER_ROW - 1];
        let end2 = [0, config.GRID_NUMBER_ROW - 1];
        // Start point lower-bounds
        let start3 = [0, 0];
        let end3 = [1, 1];
        // End point lower-bounds
        let start4 = [1, 1];
        let end4 = [0, 0];

        let color = '#faFA01';

        let myLine1 = new Line(start1, end1, color);
        let myLine2 = new Line(start2, end2, color);
        let myLine3 = new Line(start3, end3, color);
        let myLine4 = new Line(start4, end4, color);

        assert.isTrue(lineIsValid(myLine1), 'Valid column: upper-bounds');
        assert.isTrue(lineIsValid(myLine2), 'Valid row: upper-bounds');
        assert.isTrue(lineIsValid(myLine3), 'Valid start point: ower-bounds');
        assert.isTrue(lineIsValid(myLine4), 'Valid end point: lower-bounds');
    });

    it('rejects when start point == end point', () => {
        let start = [0, 0];
        let end = [0, 0];
        let color = '#faFA01';

        assert.isFalse(lineIsValid(new Line(start, end, color)), 'The same start and end point');
    });

    it('rejects when a point is less than lower-bounds', () => {
        let color = '#faFA01';

        assert.isFalse(lineIsValid(new Line([-1, 0], [0, 0], color)), 'Invalid start column: lower-bounds');
        assert.isFalse(lineIsValid(new Line([0, -1], [0, 0], color)), 'Invalid start row: lower-bounds');
        assert.isFalse(lineIsValid(new Line([0, 0], [-1, 0], color)), 'Invalid end column: lower-bounds');
        assert.isFalse(lineIsValid(new Line([0, 0], [0, -1], color)), 'Invalid end row: lower-bounds');
    });

    it('rejects when a point is beyond than upper-bounds', () => {
        // Column upper-bounds
        let start1 = [config.GRID_NUMBER_COL, 0];
        let end1 = [config.GRID_NUMBER_COL, 1];
        // Row upper-bounds
        let start2 = [1, config.GRID_NUMBER_ROW];
        let end2 = [0, config.GRID_NUMBER_ROW];
        // Start point upper-bounds
        let start3 = [config.GRID_NUMBER_COL + 1, config.GRID_NUMBER_ROW];
        let end3 = [0, 0];
        // End point upper-bounds
        let start4 = [0, 0];
        let end4 = [config.GRID_NUMBER_COL + 1, config.GRID_NUMBER_ROW];


        let color = '#faFA01';

        assert.isFalse(lineIsValid(new Line(start1, end1, color)), 'Invalid column: upper-bounds');
        assert.isFalse(lineIsValid(new Line(start2, end2, color)), 'Invalid row: upper-bounds');
        assert.isFalse(lineIsValid(new Line(start3, end3, color)), 'Invalid start point: upper-bounds');
        assert.isFalse(lineIsValid(new Line(start4, end4, color)), 'Invalid end point: upper-bounds');
    });
});
