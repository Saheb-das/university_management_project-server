async function createUser(data: any) {
  if (data.role) {
    return await createStudent(data);
  } else {
    return await createStuff(data);
  }
}

async function createStudent(data: any) {}

async function createStuff(data: any) {}
