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

    *touchAll() {
        for (let i = 0; i < this.size; i++ ) {
            yield this.get(i);
        }
    }
}



export class Memory {

    constructor(scene, memRegWidth, memRegHeight, x0, y0) {
        this.cells = []
        this.brk = 0;

        let cellSize = CONFIG.MEMORY_LAYOUT.CELL_SIZE;
        let cellMargin = CONFIG.MEMORY_LAYOUT.CELL_MARGIN;
        let planeGeometry = new PlaneBufferGeometry(cellSize, cellSize);
        for (let j = Math.floor((memRegHeight -cellSize)/ (cellSize + cellMargin)); j >=0; j--) {
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
    // visualize some cache proxy
    refresh(guiParams) {
        for (let c of this.cells) {
            let color =  c.material.color.getHex();
            let redChannel = color >> 16;
            let bluChannel = color & 0xff;
            redChannel -= guiParams.fadeRate * 10;
            bluChannel -= guiParams.fadeRate * 10;
            redChannel = Math.max(redChannel, (CONFIG.MEMORY.UNINIT & 0xff0000) >> 16);
            bluChannel = Math.max(bluChannel, (CONFIG.MEMORY.UNINIT & 0x00000ff));
    
            redChannel <<= 16;
            c.material.color.set((color & 0x00ff00) | redChannel| bluChannel);
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
    reset() {
        this.brk = 0;
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

    set(r, c, v) {
        if (!this.check(r,c)) return null;
        return this.major == "row" ? this.rset(r,c) : this.cset(r,c, v);
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

    *multiply(matB, res) {
        if (this.w != matB.h) {
            console.error("Wrong dimensions, cannot multiply");
            return null;
        }
        if (res && (res.h != this.h || res.w != matB.w)) {
            console.error("The result matrix has wrong dimensions", res.h, res.w)
        }

        for (let r1 = 0; r1 < this.h; r1++) {
            for (let c2 = 0; c2 < matB.w; c2++) {
                let v = 0;
                for (let k = 0; k < this.w; k++) {
                    v += this.get(r1,k) * matB.get(k,c2);
                    console.log(v);
                    yield v;
                }
                if (res) {
                    yield res.set(r1, c2, v);
                }
            }
        }
    }
    
    *transpose() {
        if (this.h != this.w) {console.error("Works only for square matrices for now..."); return null}
        for (let r = 0; r < this.h; r++) {
            for (let c = 0; c < this.w; c++) {
                if (r == c) continue;
                let tmp = this.get(r, c);
                this.set(r, c, this.get(c, r));
                this.set(c, r, tmp);
                yield;
            }
        }
    }

    

}
