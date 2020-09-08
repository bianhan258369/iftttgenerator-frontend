import { Shape } from './Shape';
import { Phenomenon } from './Phenomenon';

export class Line extends Shape{
    state : number;
    from : Shape;
    to : Shape;
    phenomena : Array<Phenomenon>;
    name : string;
}