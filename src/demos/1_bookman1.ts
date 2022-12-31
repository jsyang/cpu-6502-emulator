import { CPU6502 } from "../CPU6502";
import { AccessMemoryFunc, ReadWrite } from "../types";
import * as fs from "fs-extra-promise";

let cpu: CPU6502;

const romImagePath = '/Users/jsyang/franklinbookman/rom-dumper/roms/WGM-2037_v1.0_U1.bin';

const getHex = (n:number) => n.toString(16).padStart(4,'0');

async function run() {
  const romImage = await fs.readFileAsync(romImagePath);

  const ram = new Uint8ClampedArray(0xffff); // 64kb ram
  // ram.fill(0xea); // fill with noop instructions
  ram.set(
    new Uint8ClampedArray(romImage.subarray(0, 0x8000 -1)),
    0x8000
  );

  // Manually set reset vector
  ram[0xfffc] = 0xA0; 
  ram[0xfffd] = 0xF2;

  const accessMemory: AccessMemoryFunc = (
    readWrite,
    address,
    value
  ): number | void => {
    let returnValue;
    let valueString = '';
    let rwString = '';
    if (readWrite === ReadWrite.write) {
      rwString = 'WRITE to ';
      ram[address] = value;
      valueString = `-- ${getHex(value)}`;
    } else {
      rwString = 'READ from';
      returnValue = ram[address];
      valueString = `== ${getHex(returnValue)}`;
    }

    console.log(`${rwString} 0x${getHex(address)} ${valueString}`);

    return returnValue;
  };

  // @ts-ignore
  cpu = new CPU6502({
    accessMemory,
    logInstructions: true,
    maxInstructions: 50,
  });
  // cpu.triggerNMIB();
  // cpu.startClock();
  cpu.reset();
}

run().catch(console.trace);