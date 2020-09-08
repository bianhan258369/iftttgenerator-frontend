import { Shape } from './Shape';
import { Rect } from './Rect';
import { Oval } from './Oval';

export class Phenomenon{
    name:string;
    from:Rect;
    to:Rect;
    biaohao : number;
    state : string;
    constraining : boolean;
    requirement : Oval;
}