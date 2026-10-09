import prisma from "@/lib/db";

/** منطق عجلة الهدايا — ينفَّذ على الخادم فقط */
export function pickPrizeIndex(weights: number[], rand: number): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (rand * total < acc) return i;
  }
  return weights.length - 1;
}

export async function spinWheel(wheelId: string, studentId: string, rand = Math.random()) {
  const wheel = await prisma.giftWheel.findUnique({
    where: { id: wheelId },
    include: { prizes: true, spins: { where: { studentId } } },
  });
  if (!wheel || !wheel.active) throw Object.assign(new Error("WHEEL_CLOSED"), { status: 422 });
  if (wheel.expiresAt && wheel.expiresAt < new Date()) throw Object.assign(new Error("WHEEL_EXPIRED"), { status: 422 });
  if (wheel.spins.length >= wheel.maxSpins) throw Object.assign(new Error("ALREADY_SPUN"), { status: 409 });
  const avail = wheel.prizes.filter((p) => !p.stock || p.stock > 0);
  if (!avail.length) throw Object.assign(new Error("NO_PRIZES"), { status: 422 });
  const idx = pickPrizeIndex(avail.map((p) => p.weight), rand);
  const prize = avail[idx];
  let couponId: string | undefined;
  if (prize.kind !== "NOTHING") {
    const coupon = await prisma.coupon.create({
      data: {
        code: `WHEEL-${Date.now().toString(36).toUpperCase()}-${Math.floor(rand * 1e4)}`,
        kind: prize.kind as any,
        value: prize.value,
        ownerId: studentId,
        expiresAt: new Date(Date.now() + 30 * 864e5),
      },
    });
    couponId = coupon.id;
    if (prize.stock) await prisma.wheelPrize.update({ where: { id: prize.id }, data: { stock: prize.stock - 1 } });
  }
  const spin = await prisma.wheelSpin.create({ data: { wheelId, studentId, prizeId: prize.id, couponId } });
  return { spin, prize, couponId };
}
