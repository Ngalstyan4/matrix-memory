import { Memory } from "./Memory";

export function execute(m) {
    // let arr = m.malloc(5);
    // arr.set(4,3);
    // arr.set(1,1);
    let mat2 = m.mmalloc(1,1, "row");
    console.log(m);
    // mat2.get(0,0);
    let mat1 = m.mmalloc(4,3, "col");
    // mat1.get(2,2);
    // mat1.get(2,1);
    let mat3 = m.mmalloc(4,3, "row");
    let mat4 = m.mmalloc(4,3, "col");
    // mat4.get(0,0);
    let mat5 = m.mmalloc(6,8, "row");
    // for (let i = 0; i < 6; i++)
    //     for (let j = 0; j < 8; j+=2)
    //         mat5.get(i,j);

    // mat2.get(2,1);
}