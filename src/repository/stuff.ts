// internal import
import prisma from "../lib/prisma";

// types import
import { Stuff } from "@prisma/client";
import { TStuff } from "../types";

async function create(payload: TStuff): Promise<Stuff | null> {
  const newStuff = await prisma.stuff.create({ data: payload });
  return newStuff;
}

// export
export default {
  create,
};
