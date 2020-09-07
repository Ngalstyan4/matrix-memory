/* this is no longer used. The program is loaded from user input instead */
import { Memory } from "./Memory";

export function program(m, cpu) {
    /*
    let arr = m.malloc(5);
    arr.set(4,3);
    // arr.set(1,1);
    let mat2 = m.mmalloc(1,1, "row");
    // mat2.get(0,0);
    let mat1 = m.mmalloc(4,3, "col");
    // mat1.get(2,2);
    // mat1.get(2,1);
    // let mat3 = m.mmalloc(4,3, "row");
    // let mat4 = m.mmalloc(4,3, "col");
    // mat4.get(0,0);
    let mat5 = m.mmalloc(6,8, "row");
    // for (let i = 0; i < 6; i++)
    //     for (let j = 0; j < 8; j+=2)
    //         mat5.get(i,j);

    // mat2.get(2,1);

    // let arr = m.malloc(5);
    // arr.get(0);
    let g = arr.touchAll(true);
    cpu(g);



    let A = m.mmalloc(4,5, "row");
    let B = m.mmalloc(5,6, "col");
    let AB = m.mmalloc(4,6, "row");
    let C = m.mmalloc(6,6,"col");
    let compute = A.multiply(B, AB);
    let compute2 = AB.multiply(C);
    cpu(compute);
    cpu(compute2);

    */
   let A = m.mmalloc(11,11, "row");
   let padding = m.malloc(3);
   let B = m.mmalloc(11,14, "col");
   let padding2 = m.malloc(1);

   let AB = m.mmalloc(11,14, "row"); 
   let compute = A.multiply(B, AB);
   let tt = AB.transpose();
   cpu(compute);
//    cpu(tt);
}