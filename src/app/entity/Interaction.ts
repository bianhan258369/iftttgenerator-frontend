export class Interaction{
    number : number;
    state : number;
    x1 : number;
    x2 : number;
    y1 : number;
    y2 : number;

    constructor(number : number, state : number, x1 : number, x2 : number, y1 : number, y2 : number){
        this.number = number; 
        this.state = state;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }
}