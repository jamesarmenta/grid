class Line {
    constructor(start, end, color) {
        this.start = start;
        this.end = end;
        this.color = color.toLowerCase();
        this.id = this.createId();
    }

    createId() {
        var color;
        color = Math.floor(Math.random() * 16777215).toString(16)
        color = '#' + ('000000' + color).slice(-6)
        return color;
    }
}

export default Line
