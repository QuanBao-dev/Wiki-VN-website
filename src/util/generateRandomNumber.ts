let temp = 1000;
export function generateUnrepeatedRandomNumber(range:number) {
  if(range === 0) return 0;
  let rand = Math.round(Math.random()*range);
  while (temp === rand) {
    rand = Math.round(Math.random()*range);
  }
  temp = rand;
  return rand;
}
