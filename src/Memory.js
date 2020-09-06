import {PlaneBufferGeometry, MeshBasicMaterial, Mesh, Color} from 'three';
import CONFIG from './Config';

class Cell {
    constructor() {
        this.material = new MeshBasicMaterial( { color: CONFIG.MEMORY.UNINIT } )
        this.value = 0;
    }

    get() {
        this.material.color.set(CONFIG.MEMORY.GET);
        return this.value;
    }
    set(v) {
        this.material.color.set(CONFIG.MEMORY.SET);
        this.value = v;
    }
    
}

class MemorySlice {
    constructor(cells, offset, size) {
        this.cells = cells;
        this.offset = offset;
        this.size = size;

        let shade = Math.round(40+Math.random() * 216) <<8
        for (let i = 0; i < this.size; i++) {
            let c = this.cells[this.offset + i].material.color.getHex();
            this.cells[this.offset + i].material.color.set((c&0xff00ff) | shade);
        }
    }

    get(i) {
        if (i >=this.size) {
            console.error("Index OUt of bounds");
            return null;
        }

        return this.cells[this.offset + i].get();
    }

    set(i, v) {
        if (i >=this.size) {
            console.error("Index OUt of bounds");
            return null;
        }

        return this.cells[this.offset + i].set(v);
    }
}



export class Memory {

    constructor(scene, memRegWidth, memRegHeight, x0, y0) {
        this.cells = []
        this.brk = 0;

        let cellSize = 20;
        let cellMargin = 4;
        let planeGeometry = new PlaneBufferGeometry(cellSize, cellSize);
        for (let j = Math.floor((memRegHeight -CONFIG.MARGIN/4)/ (cellSize + cellMargin)); j >=0; j--) {
            for (let i = 0; i <  Math.floor(memRegWidth / (cellSize + cellMargin)); i++) {
                let cell = new Cell();

                let plane = new Mesh(planeGeometry, cell.material);
                plane.position.x = x0 - memRegWidth/2 + (cellSize + cellMargin)/2 + i * (cellSize + cellMargin);
                plane.position.y = y0 - memRegHeight/2 + (cellSize + cellMargin)/2 + j * (cellSize + cellMargin);;
                plane.position.z = 2;
                scene.add(plane);
                this.cells.push(cell);
            }
        }
    }

    malloc(size) {
        if (this.brk + size > this.cells.length) {
            console.error("OUT OF MEMORY");
            return null;
        }
        let slice = new MemorySlice(this.cells, this.brk, size);
        this.brk += size;
        return slice;
    }

    mmalloc(h, w, major) {
        let slice = this.malloc(w * h);
        let m = new Matrix(slice, h, w, major);
        return m;
    }
}

class Matrix {
    constructor(mem, h, w, major) {
        //mem is a MemorySlice
        if (mem.size != w * h) {
            console.error(`Cannot create array of size ${w}x${h} from MemorySlice of size ${mem.size}`);
            return null;
        }
        if (major != "row" && major != "col") {console.error("Wrong major" + major); return null}
        this.w = w;
        this.h = h;
        this.major = major;
        this.mem = mem;
    }

    check(r, c) {
        if (r < 0 || r >= this.h) {
            console.error("Matrix row out of bounds");
            return false;
        }
        if (c < 0 || c >= this.w) {
            console.error("Matrix col out of bounds");
            return false;
        }
        return true;
    }

    get(r, c) {
        if (!this.check(r,c)) return null;
        return this.major == "row" ? this.rget(r,c) : this.cget(r,c);
    }

    set(r, c) {
        if (!this.check(r,c)) return null;
        return this.major == "row" ? this.rset(r,c) : this.cset(r,c);
    }

    rget(r, c) {
        let ind = r * this.w + c;
        return this.mem.get(ind);
    }

    cget(r, c) {
        let ind = c * this.h + r;
        return this.mem.get(ind)
    }

    rset(r, c, v) {
        let ind = r * this.w + c;
        return this.mem.set(ind, v);
    }

    cset(r, c, v) {
        let ind = c * this.h + r;
        return this.mem.set(ind, v)
    }

    

}

class CMatrix {

}